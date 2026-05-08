import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ReportSchema } from "@kompanionki/shared";

const router = Router();

/** POST /api/v1/reports */
router.post("/", requireAuth, validate(ReportSchema), async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body as {
      targetType: string;
      targetId: string;
      reason: string;
      details?: string;
    };

    const reportedId = targetType === "user" ? targetId : undefined;

    const report = await prisma.report.create({
      data: {
        reporterId: req.userId,
        reportedId,
        targetType,
        targetId,
        reason: reason as never,
        details,
        status: "open",
      },
    });

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
