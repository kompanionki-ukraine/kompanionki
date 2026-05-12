import { Platform } from "react-native";
import { API_BASE_URL } from "./publicEnv";

/** Same defaults as `src/api/client.ts` for sync calls outside RTK Query. */
export function getApiBaseUrl(): string {
  const fromEnv = API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
}
