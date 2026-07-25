import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth";

const router = Router();

async function reviewSummary(studentId: string) {
  const reviews = await prisma.review.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } });
  const count = reviews.length;
  const average = count > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : null;
  return { reviews, count, average };
}

// Real talent directory for entrepreneurs — every registered student with a completed profile.
router.get("/", requireAuth, async (req, res) => {
  if (req.session!.role !== "ENTREPRENEUR") {
    return res.status(403).json({ error: "Solo los emprendedores pueden ver el directorio de talento." });
  }

  const profiles = await prisma.studentProfile.findMany({ orderBy: { createdAt: "desc" } });
  const students = await Promise.all(
    profiles.map(async (p) => {
      const { count, average } = await reviewSummary(p.userId);
      const completedCount = await prisma.project.count({ where: { studentId: p.userId, status: "COMPLETED" } });
      return {
        id: p.userId,
        fullName: p.fullName,
        photoUrl: p.photoUrl,
        university: p.university,
        career: p.career,
        skills: p.skills,
        experience: p.experience,
        portfolioUrl: p.portfolioUrl,
        availability: p.availability,
        reviewCount: count,
        reviewAverage: average,
        completedProjectsCount: completedCount,
      };
    })
  );

  res.json({ students });
});

router.get("/:id", requireAuth, async (req, res) => {
  if (req.session!.role !== "ENTREPRENEUR") {
    return res.status(403).json({ error: "Solo los emprendedores pueden ver perfiles de estudiantes." });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.params.id } });
  if (!profile) return res.status(404).json({ error: "Estudiante no encontrado." });

  const completedProjects = await prisma.project.findMany({
    where: { studentId: req.params.id, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, description: true, budget: true, estimatedHours: true, updatedAt: true },
  });

  const { reviews, count, average } = await reviewSummary(req.params.id);
  const entrepreneurIds = reviews.map((r) => r.entrepreneurId);
  const entrepreneurs = await prisma.entrepreneurProfile.findMany({ where: { userId: { in: entrepreneurIds } } });
  const nameByUserId = new Map(entrepreneurs.map((e) => [e.userId, e.businessName]));

  res.json({
    student: {
      id: profile.userId,
      fullName: profile.fullName,
      photoUrl: profile.photoUrl,
      university: profile.university,
      career: profile.career,
      semester: profile.semester,
      skills: profile.skills,
      experience: profile.experience,
      portfolioUrl: profile.portfolioUrl,
      availability: profile.availability,
    },
    completedProjects,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      businessName: nameByUserId.get(r.entrepreneurId) ?? "Emprendedor NYLA",
    })),
    reviewCount: count,
    reviewAverage: average,
  });
});

export default router;
