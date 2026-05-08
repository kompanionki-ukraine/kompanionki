import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { SendConnectionSchema, RespondConnectionSchema } from "@kompanionki/shared";

const router = Router();

/** GET /api/v1/connections — list accepted connections */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);

    const [data, total] = await Promise.all([
      prisma.connection.findMany({
        where: {
          OR: [{ requesterId: req.userId }, { recipientId: req.userId }],
          status: "accepted",
        },
        include: {
          requester: { include: { profile: true } },
          recipient: { include: { profile: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { respondedAt: "desc" },
      }),
      prisma.connection.count({
        where: {
          OR: [{ requesterId: req.userId }, { recipientId: req.userId }],
          status: "accepted",
        },
      }),
    ]);

    res.json({ data, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/connections/requests — incoming pending requests */
router.get("/requests", requireAuth, async (req, res, next) => {
  try {
    const data = await prisma.connection.findMany({
      where: { recipientId: req.userId, status: "pending" },
      include: { requester: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/connections — send a connection request */
router.post("/", requireAuth, validate(SendConnectionSchema), async (req, res, next) => {
  try {
    const { recipientId, intentContext } = req.body as {
      recipientId: string;
      intentContext: string[];
    };

    if (recipientId === req.userId) {
      res.status(400).json({ error: "Cannot connect to yourself" });
      return;
    }

    // Check block
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.userId, blockedId: recipientId },
          { blockerId: recipientId, blockedId: req.userId },
        ],
      },
    });
    if (isBlocked) {
      res.status(403).json({ error: "Cannot send request" });
      return;
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: req.userId, recipientId },
          { requesterId: recipientId, recipientId: req.userId },
        ],
      },
    });
    if (existing) {
      res.status(409).json({ error: "Connection already exists", status: existing.status });
      return;
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId: req.userId,
        recipientId,
        intentContext: intentContext as never,
        status: "pending",
      },
    });

    res.status(201).json(connection);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/v1/connections/:id — accept or decline */
router.patch("/:id", requireAuth, validate(RespondConnectionSchema), async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: "accepted" | "declined" };

    const conn = await prisma.connection.findUnique({ where: { id } });
    if (!conn || conn.recipientId !== req.userId) {
      res.status(404).json({ error: "Connection not found" });
      return;
    }
    if (conn.status !== "pending") {
      res.status(400).json({ error: "Connection already responded" });
      return;
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status, respondedAt: new Date() },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/v1/connections/:id */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const conn = await prisma.connection.findUnique({ where: { id } });
    if (!conn) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (conn.requesterId !== req.userId && conn.recipientId !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await prisma.connection.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/connections/block */
router.post("/block", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: req.userId, blockedId: userId } },
      create: { blockerId: req.userId, blockedId: userId },
      update: {},
    });
    // Remove any existing connection
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { requesterId: req.userId, recipientId: userId },
          { requesterId: userId, recipientId: req.userId },
        ],
      },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
