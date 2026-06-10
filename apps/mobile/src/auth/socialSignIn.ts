import { Platform } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import InAppBrowser from "react-native-inappbrowser-reborn";
import appleAuth, { AppleError } from "@invertase/react-native-apple-authentication";
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  OAUTH_REDIRECT_URL,
} from "@/config/publicEnv";
import { supabase } from "@/lib/supabase";
import { applyOAuthCallbackUrl } from "./oauthSession";

let googleConfigured = false;

export function configureGoogleSignIn(): void {
  if (googleConfigured) return;
  const web = GOOGLE_WEB_CLIENT_ID?.trim();
  if (!web) return;
  GoogleSignin.configure({
    webClientId: web,
    iosClientId: GOOGLE_IOS_CLIENT_ID?.trim() || undefined,
    offlineAccess: false,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<void> {
  configureGoogleSignIn();
  if (!GOOGLE_WEB_CLIENT_ID?.trim()) {
    throw new Error("Set GOOGLE_WEB_CLIENT_ID in apps/mobile/.env");
  }
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === statusCodes.SIGN_IN_CANCELLED) return;
    throw e;
  }
  const tokens = await GoogleSignin.getTokens();
  if (!tokens.idToken) {
    throw new Error("Google Sign-In did not return an id_token");
  }
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: tokens.idToken,
  });
  if (error) throw error;
}

export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== "ios" || !appleAuth.isSupported) {
    throw new Error("Sign in with Apple is only available on supported iOS devices");
  }
  try {
    const cred = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    if (!cred.identityToken) {
      throw new Error("Apple Sign-In did not return identityToken");
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: cred.identityToken,
    });
    if (error) throw error;

    // Apple returns FULL_NAME only on the first login — persist it to
    // user_metadata immediately so the backend sync can always read it.
    const givenName = cred.fullName?.givenName?.trim();
    const familyName = cred.fullName?.familyName?.trim();
    if (givenName || familyName) {
      const fullName = [givenName, familyName].filter(Boolean).join(" ");
      await supabase.auth.updateUser({
        data: { full_name: fullName, given_name: givenName, family_name: familyName },
      });
    }
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === AppleError.CANCELED) return;
    throw e;
  }
}

export function isAppleSignInAvailable(): boolean {
  return Platform.OS === "ios" && appleAuth.isSupported;
}

export async function signOutSocial(): Promise<void> {
  if (!googleConfigured) return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // user may not have signed in with Google; ignore
  }
}

export async function signInWithFacebook(): Promise<void> {
  const redirectTo =
    OAUTH_REDIRECT_URL?.trim() || "kompanionki://auth-callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Facebook OAuth did not return a URL");

  if (!(await InAppBrowser.isAvailable())) {
    throw new Error("In-app browser is not available on this device");
  }

  const result = await InAppBrowser.openAuth(data.url, redirectTo);

  // User explicitly closed or dismissed the browser — treat silently, same as Apple cancel.
  if (result.type === "cancel" || result.type === "dismiss") return;

  // Unexpected: success result with no URL (shouldn't happen per the library types, but guard it).
  if (!result.url) {
    throw new Error("Facebook sign-in completed but no redirect URL was returned");
  }

  const applied = await applyOAuthCallbackUrl(result.url);
  if (applied.error) {
    throw new Error(applied.error);
  }
}
