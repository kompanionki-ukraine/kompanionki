import { supabase } from "../lib/supabase";
import { getApiBaseUrl } from "../config/apiBaseUrl";

/**
 * Upserts the Prisma `users` row via backend API.
 * @param accessToken — pass directly from onAuthStateChange callback to avoid
 *   race with AsyncStorage write during OAuth deep-link (getSession() may return stale).
 */
export async function syncUserProfile(accessToken?: string): Promise<void> {
  let token = accessToken;
  if (!token) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    token = session.access_token;
  }

  const base = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${base}/api/v1/users/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(text || `Sync failed (${res.status})`);
      console.error("[syncUserProfile] failed:", err.message);
      throw err;
    }
  } finally {
    clearTimeout(timeout);
  }
}
