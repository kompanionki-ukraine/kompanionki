import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "react-native-localize";

const STORAGE_KEY = "@language_preference";

export async function loadSavedLanguage(): Promise<"uk" | "en" | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value === "uk" || value === "en") return value;
    return null;
  } catch {
    return null;
  }
}

export async function persistLanguage(lang: "uk" | "en"): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage errors — language will still work in-memory
  }
}

export function detectDeviceLanguage(): "uk" | "en" {
  const locales = getLocales();
  const code = locales[0]?.languageCode ?? "uk";
  return code === "uk" ? "uk" : "en";
}
