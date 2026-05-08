import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  CreateProfileSchema,
  UpdateProfileSchema,
  DiscoveryFiltersSchema,
} from "@kompanionki/shared";

type CreateProfileBody = z.infer<typeof CreateProfileSchema>;
type UpdateProfileBody = z.infer<typeof UpdateProfileSchema>;
type DiscoveryFilters = z.infer<typeof DiscoveryFiltersSchema>;

const router = Router();

/** GET /api/v1/profiles/me */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      include: { user: { include: { intents: true } } },
    });
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/profiles */
router.post("/", requireAuth, validate(CreateProfileSchema), async (req, res, next) => {
  try {
    const body = req.body as CreateProfileBody;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await prisma.$transaction(async (tx: any) => {
      const p = await tx.profile.upsert({
        where: { userId: req.userId },
        create: {
          userId: req.userId,
          displayName: body.displayName,
          birthYear: body.birthYear,
          bio: body.bio,
          city: body.city,
          region: body.region,
          lifeStage: body.lifeStage,
          childrenStatus: body.childrenStatus,
          childrenCount: body.childrenCount ?? 0,
          languages: body.languages,
          occupation: body.occupation,
          valuesTags: body.valuesTags ?? [],
          dealBreakers: body.dealBreakers ?? [],
          onboardingCompleted: true,
        },
        update: {
          displayName: body.displayName,
          birthYear: body.birthYear,
          bio: body.bio,
          city: body.city,
          region: body.region,
          lifeStage: body.lifeStage,
          childrenStatus: body.childrenStatus,
          childrenCount: body.childrenCount ?? 0,
          languages: body.languages,
          occupation: body.occupation,
          valuesTags: body.valuesTags ?? [],
          dealBreakers: body.dealBreakers ?? [],
          onboardingCompleted: true,
        },
      });

      // Replace intents
      await tx.userIntent.deleteMany({ where: { userId: req.userId } });
      await tx.userIntent.createMany({
        data: body.intents.map((intent: string) => ({
          userId: req.userId,
          intent,
          active: true,
        })),
      });

      await tx.user.update({
        where: { id: req.userId },
        data: { status: "active" },
      });

      return p;
    });

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/v1/profiles/me */
router.patch("/me", requireAuth, validate(UpdateProfileSchema), async (req, res, next) => {
  try {
    const body = req.body as UpdateProfileBody;

    const { intents, ...profileData } = body as UpdateProfileBody & { intents?: string[] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await prisma.$transaction(async (tx: any) => {
      const p = await tx.profile.update({
        where: { userId: req.userId },
        data: profileData,
      });

      if (intents) {
        await tx.userIntent.deleteMany({ where: { userId: req.userId } });
        await tx.userIntent.createMany({
          data: (intents as string[]).map((intent) => ({
            userId: req.userId,
            intent,
            active: true,
          })),
        });
      }

      return p;
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/profiles/discovery — filtered list for discovery feed */
router.get(
  "/discovery",
  requireAuth,
  validate(DiscoveryFiltersSchema, "query"),
  async (req, res, next) => {
    try {
      const filters = req.query as unknown as DiscoveryFilters;
      const { intent, city, minAge, maxAge, lifeStage, page, pageSize } = filters as {
        intent?: string;
        city?: string;
        minAge?: number;
        maxAge?: number;
        lifeStage?: string;
        page: number;
        pageSize: number;
      };

      const currentYear = new Date().getFullYear();
      const maxBirthYear = minAge ? currentYear - minAge : undefined;
      const minBirthYear = maxAge ? currentYear - maxAge : undefined;

      // Exclude self, blocked users, already connected
      const [blocks, existingConnections] = await Promise.all([
        prisma.block.findMany({
          where: {
            OR: [{ blockerId: req.userId }, { blockedId: req.userId }],
          },
          select: { blockerId: true, blockedId: true },
        }),
        prisma.connection.findMany({
          where: {
            OR: [{ requesterId: req.userId }, { recipientId: req.userId }],
            status: { in: ["accepted", "pending"] },
          },
          select: { requesterId: true, recipientId: true },
        }),
      ]);

      const excludedIds = new Set<string>([req.userId]);
      for (const b of blocks) {
        excludedIds.add(b.blockerId);
        excludedIds.add(b.blockedId);
      }
      for (const c of existingConnections) {
        excludedIds.add(c.requesterId);
        excludedIds.add(c.recipientId);
      }

      const profiles = await prisma.profile.findMany({
        where: {
          userId: { notIn: [...excludedIds] },
          onboardingCompleted: true,
          ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
          ...(lifeStage ? { lifeStage: lifeStage as never } : {}),
          ...(minBirthYear ? { birthYear: { gte: minBirthYear } } : {}),
          ...(maxBirthYear ? { birthYear: { lte: maxBirthYear } } : {}),
          ...(intent
            ? {
                user: {
                  intents: { some: { intent: intent as never, active: true } },
                  status: "active",
                },
              }
            : { user: { status: "active" } }),
        },
        include: { user: { include: { intents: { where: { active: true } } } } },
        skip: ((page ?? 1) - 1) * (pageSize ?? 20),
        take: pageSize ?? 20,
        orderBy: { updatedAt: "desc" },
      });

      const total = await prisma.profile.count({
        where: { userId: { notIn: [...excludedIds] }, onboardingCompleted: true },
      });

      res.json({
        data: profiles,
        total,
        page: page ?? 1,
        pageSize: pageSize ?? 20,
        hasMore: (page ?? 1) * (pageSize ?? 20) < total,
      });
    } catch (err) {
      next(err);
    }
  }
);

/** GET /api/v1/profiles/:id */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };

    // Check block
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.userId, blockedId: id },
          { blockerId: id, blockedId: req.userId },
        ],
      },
    });
    if (isBlocked) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: id },
      include: {
        user: {
          include: {
            intents: { where: { active: true } },
            endorsementsGot: {
              take: 5,
              orderBy: { createdAt: "desc" },
              include: { fromUser: { include: { profile: true } } },
            },
          },
        },
      },
    });

    if (!profile || !profile.onboardingCompleted) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
