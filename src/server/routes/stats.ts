import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth";
import { calculateStudentPayout } from "../../constants";

const router = Router();

router.get("/users", async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalRegistered, activeLast30d, totalStudents, totalEntrepreneurs, totalProjects, openProjects, completedProjects] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ENTREPRENEUR" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "OPEN" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
  ]);

  res.json({ totalRegistered, activeLast30d, totalStudents, totalEntrepreneurs, totalProjects, openProjects, completedProjects });
});

router.get("/me", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;

  if (role === "STUDENT") {
    const [appliedCount, activeCount, completedProjects] = await Promise.all([
      prisma.application.count({ where: { studentId: userId } }),
      prisma.project.count({ where: { studentId: userId, status: "IN_PROGRESS" } }),
      prisma.project.findMany({ where: { studentId: userId, status: "COMPLETED" }, select: { estimatedHours: true } }),
    ]);
    const earningsCount = Number(
      completedProjects.reduce((sum, p) => sum + calculateStudentPayout(p.estimatedHours), 0).toFixed(2)
    );
    return res.json({ appliedCount, activeCount, completedCount: completedProjects.length, earningsCount });
  }

  if (role === "ENTREPRENEUR") {
    const [postedCount, activeCount, completedProjects] = await Promise.all([
      prisma.project.count({ where: { entrepreneurId: userId } }),
      prisma.project.count({ where: { entrepreneurId: userId, status: "IN_PROGRESS" } }),
      prisma.project.findMany({ where: { entrepreneurId: userId, status: "COMPLETED" }, select: { budget: true } }),
    ]);
    const spentCount = Number(completedProjects.reduce((sum, p) => sum + p.budget, 0).toFixed(2));
    return res.json({ postedCount, activeCount, completedCount: completedProjects.length, spentCount });
  }

  res.json({});
});

export default router;
