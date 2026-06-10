import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** Append ?pgbouncer=true so Prisma skips prepared statements (required for Supabase transaction-mode pooler). */
function pgbouncerUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  const u = new URL(url);
  u.searchParams.set("pgbouncer", "true");
  return u.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    datasourceUrl: pgbouncerUrl(process.env.DATABASE_URL),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
