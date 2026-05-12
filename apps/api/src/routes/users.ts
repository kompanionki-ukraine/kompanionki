import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/** POST /api/v1/users/sync — upsert `users` row from Supabase JWT claims */
router.post("/sync", requireAuth, async (req, res, next) => {
  try {
    const claims = req.authClaims;
    const meta = claims?.user_metadata ?? {};
    const appMeta = claims?.app_metadata ?? {};

    const email = claims?.email ?? null;
    const fullName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      null;
    const avatarUrl =
      (typeof meta.avatar_url === "string" && meta.avatar_url) ||
      (typeof meta.picture === "string" && meta.picture) ||
      null;
    const provider =
      (typeof appMeta.provider === "string" && appMeta.provider) || null;
    const providerId =
      (typeof meta.provider_id === "string" && meta.provider_id) ||
      (typeof meta.sub === "string" && meta.sub) ||
      null;

    const user = await prisma.user.upsert({
      where: { id: req.userId },
      update: {
        ...(email != null ? { email } : {}),
        ...(fullName != null ? { fullName } : {}),
        ...(avatarUrl != null ? { avatarUrl } : {}),
        ...(provider != null ? { provider } : {}),
        ...(providerId != null ? { providerId } : {}),
      },
      create: {
        id: req.userId,
        ...(email != null ? { email } : {}),
        ...(fullName != null ? { fullName } : {}),
        ...(avatarUrl != null ? { avatarUrl } : {}),
        ...(provider != null ? { provider } : {}),
        ...(providerId != null ? { providerId } : {}),
      },
    });

    res.json(user);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      res.status(409).json({ error: "Email already registered to another account" });
      return;
    }
    next(err);
  }
});

export default router;
