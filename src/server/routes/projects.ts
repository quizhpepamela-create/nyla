import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../auth";
import { scoreStudent } from "../match";
import { HOURLY_RATE } from "../../constants";

const router = Router();

const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  requiredCareer: z.string().optional(),
  requiredSkills: z.array(z.string()).optional().default([]),
  estimatedHours: z.number().int().min(1).max(500),
});

router.post("/", requireAuth, async (req, res) => {
  if (req.session!.role !== "ENTREPRENEUR") {
    return res.status(403).json({ error: "Solo los emprendedores pueden publicar proyectos." });
  }
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos.", details: parsed.error.flatten() });
  }
  const { title, description, requiredCareer, requiredSkills, estimatedHours } = parsed.data;
  const hourlyRate = HOURLY_RATE;
  const budget = Number((estimatedHours * hourlyRate).toFixed(2));

  const project = await prisma.project.create({
    data: {
      entrepreneurId: req.session!.userId,
      title,
      description,
      requiredCareer,
      requiredSkills,
      estimatedHours,
      hourlyRate,
      budget,
    },
  });

  res.status(201).json({ project });
});

router.get("/", requireAuth, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "OPEN";
  const { userId, role } = req.session!;

  const projects = await prisma.project.findMany({
    where: { status: status as any },
    orderBy: { createdAt: "desc" },
    include: {
      entrepreneur: { include: { entrepreneurProfile: true } },
      applications: role === "STUDENT" ? { where: { studentId: userId } } : false,
    },
  });

  res.json({
    projects: projects.map((p: any) => ({
      ...p,
      entrepreneurName: p.entrepreneur.entrepreneurProfile?.businessName ?? null,
      entrepreneur: undefined,
      myApplicationStatus: p.applications?.[0]?.status ?? null,
      applications: undefined,
    })),
  });
});

router.get("/mine", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;

  if (role === "ENTREPRENEUR") {
    const projects = await prisma.project.findMany({
      where: { entrepreneurId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        student: { include: { studentProfile: true } },
        applications: { include: { student: { include: { studentProfile: true } } } },
      },
    });
    return res.json({ projects });
  }

  if (role === "STUDENT") {
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ studentId: userId }, { applications: { some: { studentId: userId } } }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        entrepreneur: { include: { entrepreneurProfile: true } },
        applications: { where: { studentId: userId } },
      },
    });
    return res.json({
      projects: projects.map((p) => ({
        ...p,
        entrepreneurName: p.entrepreneur.entrepreneurProfile?.businessName ?? null,
        entrepreneur: undefined,
        myApplicationStatus: p.applications[0]?.status ?? null,
      })),
    });
  }

  res.json({ projects: [] });
});

router.get("/:id/matches", requireAuth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado." });
  }
  if (project.entrepreneurId !== req.session!.userId) {
    return res.status(403).json({ error: "No tienes acceso a este proyecto." });
  }

  const profiles = await prisma.studentProfile.findMany();
  const ranked = profiles
    .map((profile) => ({ profile, ...scoreStudent(project, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  res.json({
    matches: ranked.map(({ profile, score, breakdown }) => ({
      studentId: profile.userId,
      score,
      breakdown,
      profile,
    })),
  });
});

const applySchema = z.object({
  proposedHours: z.number().int().min(1).max(500).optional(),
});

router.post("/:id/apply", requireAuth, async (req, res) => {
  if (req.session!.role !== "STUDENT") {
    return res.status(403).json({ error: "Solo los estudiantes pueden postularse." });
  }
  const parsed = applySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos." });
  }

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project || project.status !== "OPEN") {
    return res.status(404).json({ error: "Este proyecto ya no está disponible." });
  }

  try {
    const application = await prisma.application.create({
      data: {
        projectId: project.id,
        studentId: req.session!.userId,
        proposedHours: parsed.data.proposedHours,
      },
    });
    res.status(201).json({ application });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya te postulaste a este proyecto." });
    }
    throw err;
  }
});

const assignSchema = z.object({ studentId: z.string().min(1) });

router.post("/:id/assign", requireAuth, async (req, res) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos." });
  }

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado." });
  }
  if (project.entrepreneurId !== req.session!.userId) {
    return res.status(403).json({ error: "No tienes acceso a este proyecto." });
  }

  const { studentId } = parsed.data;
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000);

  const [updatedProject] = await prisma.$transaction([
    prisma.project.update({
      where: { id: project.id },
      // escrowStatus stays NONE until the entrepreneur actually pays via Stripe Checkout
      // (see POST /api/payments/projects/:id/checkout + /confirm).
      data: { studentId, status: "IN_PROGRESS", startDate, endDate },
    }),
    prisma.application.updateMany({
      where: { projectId: project.id, studentId },
      data: { status: "ACCEPTED" },
    }),
    prisma.application.updateMany({
      where: { projectId: project.id, studentId: { not: studentId } },
      data: { status: "REJECTED" },
    }),
  ]);

  res.json({ project: updatedProject });
});

router.post("/:id/deliver", requireAuth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado." });
  }
  if (project.studentId !== req.session!.userId) {
    return res.status(403).json({ error: "No tienes acceso a este proyecto." });
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { progress: 100 },
  });
  res.json({ project: updated });
});

// Escrow release (real Stripe transfer to the student's Connect account) lives in
// src/server/routes/payments.ts — POST /api/payments/projects/:id/release.

export default router;
