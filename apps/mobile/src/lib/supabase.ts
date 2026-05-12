import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/publicEnv";

const url = SUPABASE_URL?.trim() ?? "";
const key = SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = createClient(
  url || "https://placeholder.invalid.supabase.co",
  key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
