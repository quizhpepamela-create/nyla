import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;

  if (role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    return res.json({ role, profile });
  }
  if (role === "ENTREPRENEUR") {
    const profile = await prisma.entrepreneurProfile.findUnique({ where: { userId } });
    return res.json({ role, profile });
  }
  res.status(400).json({ error: "Los administradores no tienen perfil público." });
});

const studentUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  university: z.string().optional(),
  career: z.string().optional(),
  semester: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  cvUrl: z.string().url().optional().or(z.literal("")),
  availability: z.string().optional(),
});

const entrepreneurUpdateSchema = z.object({
  businessName: z.string().min(2).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  description: z.string().optional(),
  objectives: z.string().optional(),
  projectNeeds: z.string().optional(),
  studentProfileSought: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  estimatedDuration: z.string().optional(),
  budgetOrHours: z.string().optional(),
});

router.put("/me", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;

  if (role === "STUDENT") {
    const parsed = studentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos.", details: parsed.error.flatten() });
    }
    const profile = await prisma.studentProfile.update({ where: { userId }, data: parsed.data });
    return res.json({ role, profile });
  }
  if (role === "ENTREPRENEUR") {
    const parsed = entrepreneurUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos.", details: parsed.error.flatten() });
    }
    const profile = await prisma.entrepreneurProfile.update({ where: { userId }, data: parsed.data });
    return res.json({ role, profile });
  }
  res.status(400).json({ error: "Los administradores no tienen perfil público." });
});

export default router;
