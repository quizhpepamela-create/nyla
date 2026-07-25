import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../auth";
import { NYLA_FIXED_FEE, calculateStudentPayout } from "../../constants";

const router = Router();

function requireAdmin(req: any, res: any): boolean {
  if (req.session!.role !== "ADMIN") {
    res.status(403).json({ error: "Solo el administrador puede acceder a esta sección." });
    return false;
  }
  return true;
}

router.get("/users", requireAuth, async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { studentProfile: true, entrepreneurProfile: true },
  });

  res.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      displayName: u.studentProfile?.fullName ?? u.entrepreneurProfile?.businessName ?? null,
    })),
  });
});

const toggleSchema = z.object({ isActive: z.boolean() });

router.post("/users/:id/toggle-active", requireAuth, async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const parsed = toggleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos inválidos." });

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "Usuario no encontrado." });
  if (target.role === "ADMIN") return res.status(400).json({ error: "No puedes desactivar a un administrador." });

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: parsed.data.isActive },
  });
  res.json({ user: { id: updated.id, isActive: updated.isActive } });
});

router.get("/projects", requireAuth, async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      entrepreneur: { include: { entrepreneurProfile: true } },
      student: { include: { studentProfile: true } },
    },
  });

  res.json({
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      escrowStatus: p.escrowStatus,
      budget: p.budget,
      estimatedHours: p.estimatedHours,
      createdAt: p.createdAt,
      entrepreneurName: p.entrepreneur.entrepreneurProfile?.businessName ?? p.entrepreneur.email,
      studentName: p.student?.studentProfile?.fullName ?? null,
    })),
  });
});

router.get("/stats", requireAuth, async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const [
    userCount,
    studentCount,
    entrepreneurCount,
    projectCount,
    openCount,
    inProgressCount,
    completedCount,
    heldProjects,
    releasedProjects,
    allReviews,
    activeToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ENTREPRENEUR" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "OPEN" } }),
    prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.project.findMany({ where: { escrowStatus: "HELD" }, select: { budget: true } }),
    prisma.project.findMany({ where: { escrowStatus: "RELEASED" }, select: { estimatedHours: true } }),
    prisma.review.findMany({ select: { rating: true } }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  const totalCommission = Number((releasedProjects.length * NYLA_FIXED_FEE).toFixed(2));
  const totalPaidToStudents = Number(
    releasedProjects.reduce((sum, p) => sum + calculateStudentPayout(p.estimatedHours), 0).toFixed(2)
  );
  const totalEscrowHeld = Number(heldProjects.reduce((sum, p) => sum + p.budget, 0).toFixed(2));
  const platformReviewAverage =
    allReviews.length > 0 ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)) : null;

  res.json({
    userCount,
    studentCount,
    entrepreneurCount,
    activeUserCount: activeToday,
    projectCount,
    openCount,
    inProgressCount,
    completedCount,
    releasedCount: releasedProjects.length,
    heldCount: heldProjects.length,
    totalCommission,
    totalPaidToStudents,
    totalEscrowHeld,
    reviewCount: allReviews.length,
    platformReviewAverage,
  });
});

router.get("/reviews", requireAuth, async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { studentProfile: true } },
      entrepreneur: { include: { entrepreneurProfile: true } },
    },
  });

  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      studentName: r.student.studentProfile?.fullName ?? r.student.email,
      businessName: r.entrepreneur.entrepreneurProfile?.businessName ?? r.entrepreneur.email,
    })),
  });
});

router.delete("/reviews/:id", requireAuth, async (req, res) => {
  if (!requireAdmin(req, res)) return;
  await prisma.review.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

export default router;
