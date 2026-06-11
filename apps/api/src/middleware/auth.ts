import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
      /** JWT claims from Supabase `verify` (email, user_metadata, app_metadata). */
      authClaims?: {
        email?: string;
        user_metadata?: Record<string, unknown>;
        app_metadata?: Record<string, unknown>;
      };
    }
  }
}

// Supabase issues asymmetric (ES256/RS256) JWTs by default for new projects.
// Legacy projects use HS256 with SUPABASE_JWT_SECRET; we still support it as a fallback
// for tokens minted by the previous signing key that haven't expired yet.
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? "";
// Dev-only HS256 key used by /api/v1/dev/test-session (see routes/dev.ts).
// Kept separate from SUPABASE_JWT_SECRET so the dev flow works against real
// Supabase projects that no longer ship a shared secret. Only honored when
// NODE_ENV is on the positive allowlist below.
//
// TODO: FOR FUTURE PRODUCTION
// The fallback string is published in source. If a prod box ever boots with
// NODE_ENV unset or set to anything other than "production", DEV_JWT_SECRET
// becomes a valid HS256 verification key and anyone on the internet can mint
// a JWT for the seeded test user. Before going to production:
//   1. Drop the hardcoded fallback — require DEV_JWT_SECRET to be explicitly set.
//   2. Use a positive allowlist for prod detection (NODE_ENV === "production")
//      and assert at startup that DEV_JWT_SECRET is empty there.
//   3. Consider removing HS256 from the allowed-algorithms list once the
//      legacy SUPABASE_JWT_SECRET tokens have all expired.
const DEV_MODES = new Set(["development", "test"]);
const DEV_JWT_SECRET = DEV_MODES.has(process.env.NODE_ENV ?? "")
  ? process.env.DEV_JWT_SECRET ?? "dev-local-jwt-secret-kompanionki"
  : "";

const jwksClient = jwksRsa({
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600_000,
});

function getKey(
  header: jwt.JwtHeader,
  callback: jwt.SigningKeyCallback
): void {
  // HS256 tokens carry no kid — verify with the legacy Supabase secret if set,
  // otherwise fall back to the dev-only key (only populated outside production).
  if (header.alg === "HS256") {
    const secret = JWT_SECRET || DEV_JWT_SECRET;
    if (!secret) {
      callback(new Error("HS256 token received but no HS256 secret is configured"));
      return;
    }
    callback(null, secret);
    return;
  }
  // Asymmetric (ES256/RS256) — fetch public key from Supabase JWKS by kid.
  if (!header.kid) {
    callback(new Error("No kid in token header"));
    return;
  }
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      // TODO: FOR FUTURE PRODUCTION
      // Pipe this into Sentry / structured logger. Silent JWKS failures are
      // hard to diagnose and — combined with the HS256 fallback above —
      // could mask the fact that legitimate ES256 tokens are no longer
      // verifying. Surface it as a warning, not just a 401 to the client.
      console.error("[auth] JWKS getSigningKey failed:", err);
      callback(err ?? new Error("JWKS key not found"));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  jwt.verify(token, getKey, { algorithms: ["HS256", "RS256", "ES256"] }, (err, decoded) => {
    if (err || !decoded || typeof decoded !== "object") {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const payload = decoded as jwt.JwtPayload & {
      email?: string;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    };
    // Supabase puts the user id in `sub`
    const sub = payload.sub;
    if (!sub) {
      res.status(401).json({ error: "Token missing sub claim" });
      return;
    }

    req.userId = sub;
    req.authClaims = {
      email: typeof payload.email === "string" ? payload.email : undefined,
      user_metadata:
        payload.user_metadata && typeof payload.user_metadata === "object"
          ? payload.user_metadata
          : undefined,
      app_metadata:
        payload.app_metadata && typeof payload.app_metadata === "object"
          ? payload.app_metadata
          : undefined,
    };
    next();
  });
}
