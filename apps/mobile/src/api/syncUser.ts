import { supabase } from "../lib/supabase";
import { getApiBaseUrl } from "../config/apiBaseUrl";

/** Upserts the Prisma `users` row via API using the current Supabase session JWT. */
export async function syncUserProfile(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/v1/users/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `Sync failed (${res.status})`);
    console.error("[syncUserProfile] failed:", err.message);
    throw err;
  }
}
