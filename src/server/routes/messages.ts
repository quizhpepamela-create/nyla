import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../auth";

const router = Router();

// A user may only message people they have a real project relationship with:
// an entrepreneur and any student who applied to (or was assigned) one of their
// projects, in either direction.
async function getContactIds(userId: string, role: string): Promise<Set<string>> {
  const contactIds = new Set<string>();

  if (role === "ENTREPRENEUR") {
    const projects = await prisma.project.findMany({
      where: { entrepreneurId: userId },
      include: { applications: true },
    });
    for (const project of projects) {
      if (project.studentId) contactIds.add(project.studentId);
      for (const app of project.applications) contactIds.add(app.studentId);
    }
  } else {
    const [assignedProjects, applications] = await Promise.all([
      prisma.project.findMany({ where: { studentId: userId } }),
      prisma.application.findMany({ where: { studentId: userId }, include: { project: true } }),
    ]);
    for (const project of assignedProjects) contactIds.add(project.entrepreneurId);
    for (const app of applications) contactIds.add(app.project.entrepreneurId);
  }

  contactIds.delete(userId);
  return contactIds;
}

router.get("/contacts", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;
  const contactIds = await getContactIds(userId, role);

  if (contactIds.size === 0) {
    return res.json({ contacts: [] });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(contactIds) } },
    include: { studentProfile: true, entrepreneurProfile: true },
  });

  const contacts = await Promise.all(
    users.map(async (u: any) => {
      const [lastMessage, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: u.id },
              { senderId: u.id, recipientId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.message.count({
          where: { senderId: u.id, recipientId: userId, readAt: null },
        }),
      ]);

      return {
        id: u.id,
        name: u.studentProfile?.fullName ?? u.entrepreneurProfile?.businessName ?? u.email,
        role: u.role,
        lastMessage: lastMessage?.content ?? null,
        lastMessageAt: lastMessage?.createdAt ?? null,
        unreadCount,
      };
    })
  );

  contacts.sort((a: any, b: any) => {
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  res.json({ contacts });
});

router.get("/:userId", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;
  const otherId = req.params.userId;

  const contactIds = await getContactIds(userId, role);
  if (!contactIds.has(otherId)) {
    return res.status(403).json({ error: "No tienes una relación de proyecto con este usuario." });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { senderId: otherId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  res.json({
    messages: messages.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

router.post("/:userId", requireAuth, async (req, res) => {
  const { userId, role } = req.session!;
  const otherId = req.params.userId;

  const contactIds = await getContactIds(userId, role);
  if (!contactIds.has(otherId)) {
    return res.status(403).json({ error: "No tienes una relación de proyecto con este usuario." });
  }

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Mensaje inválido." });
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      recipientId: otherId,
      content: parsed.data.content,
    },
  });

  res.status(201).json({
    message: { id: message.id, senderId: message.senderId, content: message.content, createdAt: message.createdAt },
  });
});

export default router;
