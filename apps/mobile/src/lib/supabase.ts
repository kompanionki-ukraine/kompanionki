import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/publicEnv";
import { keychainStorage } from "@/utils/tokenStorage";

// TODO: FOR FUTURE PRODUCTION
// Storage was swapped from AsyncStorage → keychainStorage. Existing users on
// the previous build will be silently logged out on first launch of the
// release containing this change (their session lives in AsyncStorage, the
// new client looks in Keychain). Before shipping:
//   1. Add a one-time migration: on first boot, read the old AsyncStorage
//      session, write it into keychainStorage, then delete the old copy.
//   2. Call it out in release notes so support is prepared for re-logins.

const url = SUPABASE_URL?.trim() ?? "";
const key = SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = createClient(
  url || "https://placeholder.invalid.supabase.co",
  key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
  {
    auth: {
      storage: keychainStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
