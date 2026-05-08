import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CreateGroupSchema,
  CreatePostSchema,
  CreateReplySchema,
} from "@kompanionki/shared";

const router = Router();

// ─── Groups ───────────────────────────────────────────────────────────────────

/** GET /api/v1/groups */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const type = req.query.type as string | undefined;
    const city = req.query.city as string | undefined;
    const mine = req.query.mine === "true";

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where: {
          ...(type ? { type: type as never } : {}),
          ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
          ...(mine ? { members: { some: { userId: req.userId } } } : {}),
          isPrivate: mine ? undefined : false,
        },
        include: {
          members: { where: { userId: req.userId }, select: { role: true } },
          _count: { select: { posts: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { memberCount: "desc" },
      }),
      prisma.group.count({
        where: {
          ...(mine ? { members: { some: { userId: req.userId } } } : {}),
          isPrivate: mine ? undefined : false,
        },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = groups.map((g: any) => ({
      ...g,
      isJoined: g.members.length > 0,
      myRole: g.members[0]?.role ?? null,
    }));

    res.json({ data: enriched, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/groups */
router.post("/", requireAuth, validate(CreateGroupSchema), async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = req.body as any;

    const slug = (body.name as string)
      .toLowerCase()
      .replace(/[^\wа-яіїєґa-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    const group = await prisma.group.create({
      data: {
        name: body.name,
        slug: `${slug}-${Date.now()}`,
        description: body.description,
        type: body.type,
        intentTag: body.intentTag,
        city: body.city,
        isPrivate: body.isPrivate ?? false,
        createdById: req.userId,
        memberCount: 1,
        members: {
          create: { userId: req.userId, role: "owner" },
        },
      },
    });

    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/groups/:id */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: { where: { userId: req.userId }, select: { role: true } },
        _count: { select: { members: true, posts: true } },
      },
    });
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    res.json({
      ...group,
      isJoined: group.members.length > 0,
      myRole: group.members[0]?.role ?? null,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/groups/:id/join */
router.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId } },
    });
    if (existing) {
      res.status(409).json({ error: "Already a member" });
      return;
    }
    await prisma.$transaction([
      prisma.groupMember.create({ data: { groupId: id, userId: req.userId } }),
      prisma.group.update({ where: { id }, data: { memberCount: { increment: 1 } } }),
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/v1/groups/:id/leave */
router.delete("/:id/leave", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId } },
    });
    if (!member) {
      res.status(404).json({ error: "Not a member" });
      return;
    }
    if (member.role === "owner") {
      res.status(400).json({ error: "Owner cannot leave; transfer ownership first" });
      return;
    }
    await prisma.$transaction([
      prisma.groupMember.delete({
        where: { groupId_userId: { groupId: id, userId: req.userId } },
      }),
      prisma.group.update({ where: { id }, data: { memberCount: { decrement: 1 } } }),
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ─── Posts ────────────────────────────────────────────────────────────────────

/** GET /api/v1/groups/:id/posts */
router.get("/:id/posts", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);

    const isMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId } },
    });
    const group = await prisma.group.findUnique({ where: { id }, select: { isPrivate: true } });
    if (group?.isPrivate && !isMember) {
      res.status(403).json({ error: "Private group" });
      return;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { groupId: id, deletedAt: null },
        include: {
          author: { include: { profile: true } },
          reactions: { where: { userId: req.userId } },
          _count: { select: { replies: true, reactions: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.count({ where: { groupId: id, deletedAt: null } }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = posts.map((p: any) => ({
      ...p,
      myReaction: p.reactions[0]?.reaction ?? null,
    }));

    res.json({ data: enriched, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/groups/:id/posts */
router.post("/:id/posts", requireAuth, validate(CreatePostSchema), async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const { content, mediaUrls } = req.body as { content: string; mediaUrls: string[] };

    const isMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: req.userId } },
    });
    if (!isMember) {
      res.status(403).json({ error: "Must be a group member to post" });
      return;
    }

    const post = await prisma.post.create({
      data: { authorId: req.userId, groupId: id, content, mediaUrls: mediaUrls ?? [] },
      include: { author: { include: { profile: true } } },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/groups/:id/posts/:postId/reactions */
router.post("/:id/posts/:postId/reactions", requireAuth, async (req, res, next) => {
  try {
    const { postId } = req.params as { postId: string };
    const { reaction } = req.body as { reaction?: string };
    if (!reaction) {
      res.status(400).json({ error: "reaction required" });
      return;
    }

    const existing = await prisma.postReactionRecord.findUnique({
      where: { postId_userId: { postId, userId: req.userId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.postReactionRecord.delete({
          where: { postId_userId: { postId, userId: req.userId } },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { reactionCount: { decrement: 1 } },
        }),
      ]);
      res.status(204).end();
      return;
    }

    await prisma.$transaction([
      prisma.postReactionRecord.create({
        data: { postId, userId: req.userId, reaction: reaction as never },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { reactionCount: { increment: 1 } },
      }),
    ]);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/groups/:id/posts/:postId/replies */
router.get("/:id/posts/:postId/replies", requireAuth, async (req, res, next) => {
  try {
    const { postId } = req.params as { postId: string };
    const replies = await prisma.postReply.findMany({
      where: { postId, deletedAt: null },
      include: { author: { include: { profile: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(replies);
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/groups/:id/posts/:postId/replies */
router.post(
  "/:id/posts/:postId/replies",
  requireAuth,
  validate(CreateReplySchema),
  async (req, res, next) => {
    try {
      const { id, postId } = req.params as { id: string; postId: string };
      const { content } = req.body as { content: string };

      const isMember = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: req.userId } },
      });
      if (!isMember) {
        res.status(403).json({ error: "Must be a group member" });
        return;
      }

      const [reply] = await prisma.$transaction([
        prisma.postReply.create({
          data: { postId, authorId: req.userId, content },
          include: { author: { include: { profile: true } } },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { replyCount: { increment: 1 } },
        }),
      ]);

      res.status(201).json(reply);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
