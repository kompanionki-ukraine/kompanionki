import { Platform } from "react-native";
import { API_BASE_URL } from "./publicEnv";

/** Same defaults as `src/api/client.ts` for sync calls outside RTK Query. */
export function getApiBaseUrl(): string {
  const fromEnv = API_BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    // Android emulator can't reach host via "localhost" — rewrite to 10.0.2.2
    if (Platform.OS === "android") {
      return fromEnv.replace(/\/\/localhost([:\/])/, "//10.0.2.2$1");
    }
    return fromEnv;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
}
