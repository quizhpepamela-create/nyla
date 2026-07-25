import { Router, RequestHandler } from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth";
import { getStripeClient, toStripeAmount } from "../stripe";

const router = Router();

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

function requireStripe(res: any): ReturnType<typeof getStripeClient> {
  const stripe = getStripeClient();
  if (!stripe) {
    res.status(503).json({ error: "Los pagos no están configurados todavía (falta STRIPE_SECRET_KEY)." });
    return null;
  }
  return stripe;
}

// Stripe API calls can reject (declined cards, insufficient available balance, etc.) —
// without this wrapper an unhandled rejection in an async Express 4 handler crashes the
// whole process instead of just failing the one request.
function asyncRoute(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err: any) => {
      console.error("Payments route error:", err);
      if (res.headersSent) return;
      const message = err?.type?.startsWith("Stripe") ? err.message : "Ocurrió un error al procesar el pago.";
      res.status(err?.statusCode && err.statusCode < 500 ? err.statusCode : 502).json({ error: message });
    });
  };
}

// Creates (or resumes) the student's Stripe Express connected account and returns
// a hosted onboarding link.
router.post("/connect/onboard", requireAuth, asyncRoute(async (req, res) => {
  const stripe = requireStripe(res);
  if (!stripe) return;
  if (req.session!.role !== "STUDENT") {
    return res.status(403).json({ error: "Solo los estudiantes conectan una cuenta de pagos." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.session!.userId } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

  let accountId = user.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    accountId = account.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeAccountId: accountId } });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl()}/?stripe_refresh=1`,
    return_url: `${appUrl()}/?stripe_return=1`,
    type: "account_onboarding",
  });

  res.json({ url: accountLink.url });
}));

// Syncs payouts_enabled from Stripe into our DB and reports connection status.
router.get("/connect/status", requireAuth, asyncRoute(async (req, res) => {
  if (req.session!.role !== "STUDENT") {
    return res.json({ connected: false, onboardingComplete: false });
  }

  const user = await prisma.user.findUnique({ where: { id: req.session!.userId } });
  if (!user?.stripeAccountId) {
    return res.json({ connected: false, onboardingComplete: false });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return res.json({ connected: true, onboardingComplete: user.stripeOnboardingComplete });
  }

  const account = await stripe.accounts.retrieve(user.stripeAccountId);
  const onboardingComplete = Boolean(account.payouts_enabled);
  if (onboardingComplete !== user.stripeOnboardingComplete) {
    await prisma.user.update({ where: { id: user.id }, data: { stripeOnboardingComplete: onboardingComplete } });
  }

  res.json({ connected: true, onboardingComplete });
}));

// Creates a Checkout Session for the entrepreneur to deposit the project's budget in escrow.
router.post("/projects/:id/checkout", requireAuth, asyncRoute(async (req, res) => {
  const stripe = requireStripe(res);
  if (!stripe) return;

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Proyecto no encontrado." });
  if (project.entrepreneurId !== req.session!.userId) {
    return res.status(403).json({ error: "No tienes acceso a este proyecto." });
  }
  if (project.status !== "IN_PROGRESS" || !project.studentId) {
    return res.status(400).json({ error: "El proyecto debe tener un estudiante asignado antes de depositar en garantía." });
  }
  if (project.escrowStatus !== "NONE") {
    return res.status(400).json({ error: "Este proyecto ya tiene un depósito en garantía." });
  }

  const student = await prisma.user.findUnique({ where: { id: project.studentId } });
  if (!student?.stripeOnboardingComplete) {
    return res.status(400).json({ error: "El estudiante asignado aún no ha configurado su cuenta de pagos." });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Depósito en garantía: ${project.title}` },
          unit_amount: toStripeAmount(project.budget),
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl()}/?payment=success&project=${project.id}`,
    cancel_url: `${appUrl()}/?payment=cancelled&project=${project.id}`,
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  res.json({ url: session.url });
}));

// Called when the entrepreneur lands back on our app after Stripe Checkout, to confirm
// payment synchronously (no public webhook endpoint required for this to work).
router.post("/projects/:id/confirm", requireAuth, asyncRoute(async (req, res) => {
  const stripe = requireStripe(res);
  if (!stripe) return;

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Proyecto no encontrado." });
  if (project.entrepreneurId !== req.session!.userId) {
    return res.status(403).json({ error: "No tienes acceso a este proyecto." });
  }
  if (project.escrowStatus === "HELD") {
    return res.json({ project });
  }
  if (!project.stripeCheckoutSessionId) {
    return res.status(400).json({ error: "No hay un depósito en garantía iniciado para este proyecto." });
  }

  const session = await stripe.checkout.sessions.retrieve(project.stripeCheckoutSessionId);
  if (session.payment_status !== "paid") {
    return res.status(400).json({ error: "El pago todavía no se ha completado." });
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: {
      escrowStatus: "HELD",
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    },
  });

  res.json({ project: updated });
}));

// Releases the escrowed funds: transfers 80% of the budget to the student's connected
// account. The remaining 20% commission simply stays in the platform's Stripe balance.
router.post("/projects/:id/release", requireAuth, asyncRoute(async (req, res) => {
  const stripe = requireStripe(res);
  if (!stripe) return;

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Proyecto no encontrado." });
  if (project.entrepreneurId !== req.session!.userId) {
    return res.status(403).json({ error: "No tienes acceso a este proyecto." });
  }
  if (project.escrowStatus !== "HELD") {
    return res.status(400).json({ error: "Este proyecto no tiene fondos retenidos en garantía." });
  }
  if (project.progress < 100) {
    return res.status(400).json({ error: "El estudiante todavía no ha marcado la entrega como completada." });
  }
  if (!project.studentId) {
    return res.status(400).json({ error: "El proyecto no tiene un estudiante asignado." });
  }

  const student = await prisma.user.findUnique({ where: { id: project.studentId } });
  if (!student?.stripeAccountId) {
    return res.status(400).json({ error: "El estudiante no tiene una cuenta de pagos conectada." });
  }

  const netAmount = Number((project.budget * 0.8).toFixed(2));
  const transfer = await stripe.transfers.create({
    amount: toStripeAmount(netAmount),
    currency: "usd",
    destination: student.stripeAccountId,
    transfer_group: project.id,
    description: `Liberación de garantía: ${project.title}`,
  });

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { status: "COMPLETED", escrowStatus: "RELEASED", stripeTransferId: transfer.id },
  });

  res.json({ project: updated });
}));

export default router;
