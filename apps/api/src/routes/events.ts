import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { CreateEventSchema } from "@kompanionki/shared";

const router = Router();

/** GET /api/v1/events */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const city = req.query.city as string | undefined;
    const upcoming = req.query.upcoming !== "false";

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          visibility: "public",
          ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
          ...(upcoming ? { startAt: { gte: new Date() } } : {}),
        },
        include: {
          organizer: { include: { profile: true } },
          attendees: { where: { userId: req.userId }, select: { status: true } },
          _count: { select: { attendees: true } },
        },
        orderBy: { startAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.event.count({
        where: { visibility: "public", ...(upcoming ? { startAt: { gte: new Date() } } : {}) },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = events.map((e: any) => ({
      ...e,
      attendeeStatus: e.attendees[0]?.status ?? null,
      attendeeCount: e._count.attendees,
    }));

    res.json({ data: enriched, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/events */
router.post("/", requireAuth, validate(CreateEventSchema), async (req, res, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = req.body as any;

    const event = await prisma.event.create({
      data: {
        organizerId: req.userId,
        groupId: body.groupId,
        title: body.title,
        description: body.description,
        startAt: new Date(body.startAt as string),
        endAt: body.endAt ? new Date(body.endAt as string) : undefined,
        locationName: body.locationName,
        city: body.city,
        isOnline: body.isOnline ?? false,
        onlineLink: body.onlineLink,
        maxAttendees: body.maxAttendees,
        visibility: body.visibility ?? "public",
      },
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/events/:id */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { include: { profile: true } },
        attendees: { where: { userId: req.userId }, select: { status: true } },
        _count: { select: { attendees: true } },
      },
    });
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({
      ...event,
      attendeeStatus: event.attendees[0]?.status ?? null,
      attendeeCount: event._count.attendees,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/events/:id/attend */
router.post("/:id/attend", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const status = (req.body as { status?: string }).status ?? "going";

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    await prisma.eventAttendee.upsert({
      where: { eventId_userId: { eventId: id, userId: req.userId } },
      create: { eventId: id, userId: req.userId, status: status as never },
      update: { status: status as never },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/v1/events/:id/attend */
router.delete("/:id/attend", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.eventAttendee.deleteMany({
      where: { eventId: id, userId: req.userId },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
