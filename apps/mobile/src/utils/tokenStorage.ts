import * as Keychain from "react-native-keychain";

const SERVICE = "kompanionki-auth";

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
