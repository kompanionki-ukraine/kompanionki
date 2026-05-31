import * as Keychain from "react-native-keychain";

const SERVICE = "kompanionki-auth";
const SUPABASE_SERVICE_PREFIX = "kompanionki-supabase";

// Supabase-compatible storage adapter backed by iOS Keychain / Android Keystore.
// Implements the SupportedStorage interface (getItem / setItem / removeItem).
export const keychainStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({
        service: `${SUPABASE_SERVICE_PREFIX}-${key}`,
      });
      return result ? result.password : null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword(key, value, {
      service: `${SUPABASE_SERVICE_PREFIX}-${key}`,
    });
  },
  async removeItem(key: string): Promise<void> {
    await Keychain.resetGenericPassword({
      service: `${SUPABASE_SERVICE_PREFIX}-${key}`,
    });
  },
};

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Keychain.setGenericPassword(
    tokens.userId,
    JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }),
    { service: SERVICE }
  );
}

export async function getTokens(): Promise<StoredTokens | null> {
  try {
    const result = await Keychain.getGenericPassword({ service: SERVICE });
    if (!result) return null;
    const { accessToken, refreshToken } = JSON.parse(result.password) as {
      accessToken: string;
      refreshToken: string;
    };
    return { userId: result.username, accessToken, refreshToken };
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
