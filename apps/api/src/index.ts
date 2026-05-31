import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import profilesRouter from "./routes/profiles";
import connectionsRouter from "./routes/connections";
import conversationsRouter from "./routes/conversations";
import groupsRouter from "./routes/groups";
import eventsRouter from "./routes/events";
import uploadsRouter from "./routes/uploads";
import reportsRouter from "./routes/reports";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Parsing / logging ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts" },
});

// Tighter limit for DB-write sync endpoint (30 req / 15 min per IP)
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many sync requests" },
});

app.use("/api/v1", defaultLimiter);
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/users", syncLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/profiles", profilesRouter);
app.use("/api/v1/connections", connectionsRouter);
app.use("/api/v1/conversations", conversationsRouter);
app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/uploads", uploadsRouter);
app.use("/api/v1/reports", reportsRouter);

// Dev-only routes. Imported lazily so the module is never even evaluated in
// production builds — prevents the hardcoded fallback secret in routes/dev.ts
// from being loaded into memory on prod hosts. See routes/dev.ts for full
// production hardening TODOs.
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const devRouter = require("./routes/dev").default;
  app.use("/api/v1/dev", devRouter);
}

app.get("/health", (_req, res) => res.json({ ok: true }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`[api] listening on :${PORT} (${process.env.NODE_ENV ?? "development"})`);
});

export default app;
