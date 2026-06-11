import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

/**
 * Dev-only routes. NEVER mount in production.
 *
 * Provides a way for the mobile DevFlags `skipOnboarding` toggle to obtain a
 * valid Supabase-shaped JWT for the seeded test user without going through
 * Supabase Auth.
 */

const TEST_USER_ID = "00000000-0000-0000-0000-000000000001"; // Оксана (seed)

// TODO: FOR FUTURE PRODUCTION
// The hardcoded fallback below is committed to the repo and is therefore
// public. Anyone who can reach this route can mint a valid JWT for the
// seeded test user. The route is gated by an env allowlist (see DEV_MODES
// below) and the import in src/index.ts is also gated, but a misconfigured
// deployment (missing NODE_ENV, wrong base image, staging copying dev env)
// would expose it. Before going to production:
//   1. Delete the hardcoded fallback and require DEV_JWT_SECRET to be set.
//   2. Move this whole file behind a build-time flag so it is tree-shaken
//      out of production bundles entirely.
//   3. Make DEV_TOOLS_SECRET required (not optional) whenever NODE_ENV !== "development".
// Dev-only HS256 signing key. Independent of SUPABASE_JWT_SECRET so this route
// works on machines pointed at a real Supabase project (those use ES256/JWKS
// and ship no shared secret). auth.ts reads the same env var to verify.
const DEV_JWT_SECRET =
  process.env.DEV_JWT_SECRET ?? "dev-local-jwt-secret-kompanionki";

// Positive allowlist: only these NODE_ENV values may mount the dev routes.
// Anything else ("production", "staging", or an unset value) is rejected.
const DEV_MODES = new Set(["development", "test"]);

// Hard fail at module load if somehow imported in production. src/index.ts
// also guards the mount; this is defense in depth so the bad import surfaces
// loudly during boot instead of silently exposing /api/v1/dev/*.
if (!DEV_MODES.has(process.env.NODE_ENV ?? "")) {
  throw new Error(
    `routes/dev.ts loaded with NODE_ENV="${process.env.NODE_ENV}" — refusing to mount`
  );
}

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  if (!DEV_MODES.has(process.env.NODE_ENV ?? "")) {
    res.status(404).end();
    return;
  }
  // Optional shared-secret header for extra safety (set DEV_TOOLS_SECRET to enable).
  // TODO: FOR FUTURE PRODUCTION — make this REQUIRED, not optional.
  if (
    process.env.DEV_TOOLS_SECRET &&
    req.headers["x-dev-key"] !== process.env.DEV_TOOLS_SECRET
  ) {
    res.status(403).end();
    return;
  }
  next();
});

/** POST /api/v1/dev/test-session — issue a JWT for the seeded test user. */
router.post("/test-session", async (_req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: TEST_USER_ID },
      include: { profile: true },
    });
    if (!user) {
      res
        .status(404)
        .json({ error: "Test user not seeded — run `npm run db:seed`" });
      return;
    }

    const accessToken = jwt.sign(
      {
        sub: TEST_USER_ID,
        email: "test@kompanionki.dev",
        role: "authenticated",
        aud: "authenticated",
      },
      DEV_JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" }
    );

    res.json({ accessToken, userId: TEST_USER_ID });
  } catch (err) {
    next(err);
  }
});

export default router;
