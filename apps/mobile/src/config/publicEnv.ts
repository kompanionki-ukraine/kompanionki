/**
 * Values come from `process.env` at **bundle time** (see `babel.config.js`).
 * Always start Metro via npm scripts (`dotenvx run -fk ../../.env.keys -f .env.development -- …`)
 * so vars load from `apps/mobile/.env.development` using the repo-root `.env.keys`.
 */
export const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
export const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID ?? "";
export const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID ?? "";
export const OAUTH_REDIRECT_URL = process.env.OAUTH_REDIRECT_URL ?? "";
export const API_BASE_URL = process.env.API_BASE_URL ?? "";
