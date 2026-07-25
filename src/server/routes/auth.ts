import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  generateResetToken,
  hashResetToken,
} from "../auth";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../email";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
});

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula.")
  .regex(/[0-9]/, "Debe incluir al menos un número.");

const registerSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("STUDENT"),
    email: z.string().email(),
    password: passwordSchema,
    fullName: z.string().min(2),
    university: z.string().optional(),
    career: z.string().optional(),
    semester: z.string().optional(),
  }),
  z.object({
    role: z.literal("ENTREPRENEUR"),
    email: z.string().email(),
    password: passwordSchema,
    businessName: z.string().min(2),
    category: z.string().optional(),
    description: z.string().optional(),
  }),
]);

router.post("/register", authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos.", details: parsed.error.flatten() });
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      lastLoginAt: new Date(),
      ...(data.role === "STUDENT"
        ? {
            studentProfile: {
              create: {
                fullName: data.fullName,
                university: data.university,
                career: data.career,
                semester: data.semester,
              },
            },
          }
        : {
            entrepreneurProfile: {
              create: {
                businessName: data.businessName,
                category: data.category,
                description: data.description,
              },
            },
          }),
    },
    include: { studentProfile: true, entrepreneurProfile: true },
  });

  const token = signSession({ userId: user.id, role: user.role });
  setSessionCookie(res, token);

  const displayName = user.studentProfile?.fullName ?? user.entrepreneurProfile?.businessName ?? user.email;
  sendWelcomeEmail(user.email, displayName, user.role).catch((err) =>
    console.error("Failed to send welcome email:", err)
  );

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    profile: user.studentProfile ?? user.entrepreneurProfile,
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos." });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: "Esta cuenta ha sido bloqueada. Contacta a soporte." });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = signSession({ userId: user.id, role: user.role });
  setSessionCookie(res, token);

  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.session!.userId },
    include: { studentProfile: true, entrepreneurProfile: true },
  });
  if (!user) {
    return res.status(401).json({ error: "No autenticado." });
  }
  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    profile: user.studentProfile ?? user.entrepreneurProfile,
  });
});

const forgotPasswordSchema = z.object({ email: z.string().email() });

router.post("/forgot-password", authLimiter, async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Correo inválido." });
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always respond the same way whether or not the account exists, to avoid leaking which emails are registered.
  if (!user) {
    return res.json({ ok: true });
  }

  const { token, tokenHash } = generateResetToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  sendPasswordResetEmail(user.email, resetLink).catch((err) =>
    console.error("Failed to send password reset email:", err)
  );

  res.json({ ok: true, devResetLink: process.env.NODE_ENV !== "production" ? resetLink : undefined });
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: passwordSchema,
});

router.post("/reset-password", authLimiter, async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos.", details: parsed.error.flatten() });
  }
  const { email, token, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
    return res.status(400).json({ error: "Enlace de recuperación inválido o expirado." });
  }
  if (user.resetTokenExpiresAt < new Date()) {
    return res.status(400).json({ error: "Enlace de recuperación inválido o expirado." });
  }
  if (hashResetToken(token) !== user.resetTokenHash) {
    return res.status(400).json({ error: "Enlace de recuperación inválido o expirado." });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });

  res.json({ ok: true });
});

export default router;
