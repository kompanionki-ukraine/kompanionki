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

// Supabase Auth issues HS256 JWTs signed with the project JWT secret.
// Alternatively for RS256 projects you can use the JWKS endpoint below.
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? "";

// JWKS client (only needed if your Supabase project uses asymmetric keys)
const jwksClient = jwksRsa({
  jwksUri: `${process.env.SUPABASE_URL}/rest/v1/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600_000,
});

function getKey(
  header: jwt.JwtHeader,
  callback: jwt.SigningKeyCallback
): void {
  if (JWT_SECRET) {
    // Symmetric secret (most common Supabase setup)
    callback(null, JWT_SECRET);
    return;
  }
  if (!header.kid) {
    callback(new Error("No kid in token header"));
    return;
  }
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
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

  jwt.verify(token, getKey, { algorithms: ["HS256", "RS256"] }, (err, decoded) => {
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
