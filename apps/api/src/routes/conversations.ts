import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { SendMessageSchema, CreateConversationSchema } from "@kompanionki/shared";

const router = Router();

/** GET /api/v1/conversations */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 30);

    const memberships = await prisma.conversationMember.findMany({
      where: { userId: req.userId },
      select: { conversationId: true, lastReadAt: true, muted: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationIds = memberships.map((m: any) => m.conversationId as string);

    const conversations = await prisma.conversation.findMany({
      where: { id: { in: conversationIds } },
      include: {
        members: {
          include: { user: { include: { profile: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          where: { deletedAt: null },
        },
      },
      orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    type MRow = { conversationId: string; lastReadAt: Date | null; muted: boolean };
    const membershipMap = new Map<string, MRow>(
      (memberships as MRow[]).map((m) => [m.conversationId, m])
    );

    const enriched = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conversations.map(async (conv: any) => {
        const membership = membershipMap.get(conv.id as string);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: req.userId },
            deletedAt: null,
            createdAt: membership?.lastReadAt
              ? { gt: membership.lastReadAt }
              : undefined,
          },
        });
        return { ...conv, unreadCount, muted: membership?.muted ?? false };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/conversations — start or get DM */
router.post(
  "/",
  requireAuth,
  validate(CreateConversationSchema),
  async (req, res, next) => {
    try {
      const { recipientId } = req.body as { recipientId: string };

      // Check if DM already exists
      const existing = await prisma.conversation.findFirst({
        where: {
          type: "direct",
          members: {
            every: { userId: { in: [req.userId, recipientId] } },
          },
          AND: [
            { members: { some: { userId: req.userId } } },
            { members: { some: { userId: recipientId } } },
          ],
        },
      });

      if (existing) {
        res.json(existing);
        return;
      }

      const conv = await prisma.conversation.create({
        data: {
          type: "direct",
          members: {
            createMany: {
              data: [{ userId: req.userId }, { userId: recipientId }],
            },
          },
        },
        include: { members: true },
      });

      res.status(201).json(conv);
    } catch (err) {
      next(err);
    }
  }
);

/** GET /api/v1/conversations/:id/messages */
router.get("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 40);

    // Verify membership
    const membership = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: req.userId } },
    });
    if (!membership) {
      res.status(403).json({ error: "Not a member of this conversation" });
      return;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id, deletedAt: null },
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.message.count({ where: { conversationId: id, deletedAt: null } }),
    ]);

    // Mark as read
    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId: id, userId: req.userId } },
      data: { lastReadAt: new Date() },
    });

    res.json({
      data: messages.reverse(),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/conversations/:id/messages */
router.post(
  "/:id/messages",
  requireAuth,
  validate(SendMessageSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as { id: string };
      const { content, type, mediaUrl } = req.body as {
        content: string;
        type: "text" | "image";
        mediaUrl?: string;
      };

      const membership = await prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId: id, userId: req.userId } },
      });
      if (!membership) {
        res.status(403).json({ error: "Not a member" });
        return;
      }

      const [message] = await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId: id,
            senderId: req.userId,
            type,
            content,
            mediaUrl,
          },
          include: { sender: { include: { profile: true } } },
        }),
        prisma.conversation.update({
          where: { id },
          data: { lastMessageAt: new Date() },
        }),
      ]);

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }
);

/** DELETE /api/v1/conversations/:id/messages/:msgId — soft delete */
router.delete("/:id/messages/:msgId", requireAuth, async (req, res, next) => {
  try {
    const { id, msgId } = req.params as { id: string; msgId: string };
    const msg = await prisma.message.findUnique({ where: { id: msgId } });
    if (!msg || msg.conversationId !== id) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    if (msg.senderId !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await prisma.message.update({
      where: { id: msgId },
      data: { deletedAt: new Date(), content: "" },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
