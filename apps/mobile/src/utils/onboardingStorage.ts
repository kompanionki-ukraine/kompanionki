import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = (userId: string) => `@onboarding_completed:${userId}`;

export async function loadOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(storageKey(userId));
    return value === "true";
  } catch {
    return false;
  }
}

export async function persistOnboardingCompleted(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), "true");
  } catch {
    // ignore storage errors — flag will still work in-memory
  }
}
