import { supabase } from "../lib/supabase";

export function parseOAuthCallbackUrl(rawUrl: string): {
  access_token?: string;
  refresh_token?: string;
  code?: string;
} {
  try {
    const hashIdx = rawUrl.indexOf("#");
    if (hashIdx >= 0) {
      const hash = rawUrl.slice(hashIdx + 1);
      const params = new URLSearchParams(hash);
      return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
        code: params.get("code") ?? undefined,
      };
    }
    const qIdx = rawUrl.indexOf("?");
    if (qIdx >= 0) {
      const query = rawUrl.slice(qIdx + 1).split("#")[0];
      const params = new URLSearchParams(query);
      return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
        code: params.get("code") ?? undefined,
      };
    }
  } catch {
    /* ignore */
  }
  return {};
}

export async function applyOAuthCallbackUrl(
  rawUrl: string
): Promise<{ error?: string }> {
  const p = parseOAuthCallbackUrl(rawUrl);
  if (p.access_token && p.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: p.access_token,
      refresh_token: p.refresh_token,
    });
    return error ? { error: error.message } : {};
  }
  if (p.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(p.code);
    return error ? { error: error.message } : {};
  }
  return { error: "No session data in redirect URL" };
}
