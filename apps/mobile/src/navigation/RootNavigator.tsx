import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Session } from "@supabase/supabase-js";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDevFlagsHydrated } from "@/store/devFlagsSlice";
import { setCredentials, logout, setLanguage, setOnboardingCompleted } from "@/store/sessionSlice";
import MainTabs from "./MainTabs";
import OnboardingStack from "./OnboardingStack";
import SplashScreen from "@/screens/SplashScreen";
import SocialRegistrationScreen from "@/screens/auth/SocialRegistrationScreen";
import { supabase } from "@/lib/supabase";
import type { RootParamList } from "./types";
import { syncUserProfile } from "@/api/syncUser";
import { loadSavedLanguage, detectDeviceLanguage, persistLanguage } from "@/utils/language";
import { loadOnboardingCompleted, persistOnboardingCompleted } from "@/utils/onboardingStorage";
import { getApiBaseUrl } from "@/config/apiBaseUrl";
import i18n from "@/i18n";

const Stack = createNativeStackNavigator<RootParamList>();

function credentialsFromSession(session: Session) {
  return {
    userId: session.user.id,
    accessToken: session.access_token,
  };
}

/**
 * Checks whether the user has a profile on the server.
 * Returns true if profile exists, false if 404, throws on other errors.
 */
async function fetchProfileExists(accessToken: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/profiles/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Profile check failed (${res.status})`);
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves onboarding status for a freshly authenticated user.
 * 1. Fast path: local AsyncStorage flag (works offline).
 * 2. Fallback: query server when no local flag (covers reinstall / new device).
 * Returns true if onboarding is complete.
 */
async function resolveOnboardingStatus(
  userId: string,
  accessToken: string,
): Promise<boolean> {
  const local = await loadOnboardingCompleted(userId);
  if (local) return true;

  try {
    const exists = await fetchProfileExists(accessToken);
    if (exists) {
      await persistOnboardingCompleted(userId);
      return true;
    }
    return false;
  } catch {
    // Network error on first launch — show onboarding (createProfile is an upsert)
    return false;
  }
}

/**
 * Background validation after the local flag granted access.
 * If the profile is genuinely gone on the server, kicks the user back to onboarding.
 */
function validateProfileInBackground(
  userId: string,
  accessToken: string,
  onInvalid: () => void,
) {
  fetchProfileExists(accessToken)
    .then((exists) => {
      if (!exists) onInvalid();
    })
    .catch(() => {
      // Network unavailable — trust the local flag
    });
}

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  // Dev test-user flow: skipOnboarding seeds creds into the session slice
  // without a Supabase Session object — accept that as authenticated too.
  //
  // TODO: FOR FUTURE PRODUCTION
  // This bypass means any code that calls setCredentials() can grant app
  // access without a real Supabase session. Today only the dev-only
  // loadTestSession mutation does that (and the BE route 404s in prod), so
  // it's safe — but the invariant is implicit. Before prod:
  //   1. Gate this fallback on __DEV__ so release builds ignore it entirely.
  //   2. Or attach a `source: "supabase" | "dev"` discriminator on the
  //      session slice and only treat "supabase" as authenticated in release.
  const isAuthedFromRedux = useAppSelector((s) => s.session.isAuthenticated);
  const onboardingCompleted = useAppSelector((s) => s.session.onboardingCompleted);

  useEffect(() => {
    (async () => {
      try {
        dispatch(setDevFlagsHydrated(true));
      } finally {
        /* continues after Supabase session restore */
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          const activeSession = refreshed.session ?? data.session;
          setSession(activeSession);
          dispatch(setCredentials(credentialsFromSession(activeSession)));

          try {
            await syncUserProfile(activeSession.access_token);
          } catch (err) {
            console.error("[RootNavigator] syncUserProfile failed on restore:", err);
          }

          const userId = activeSession.user.id;
          const completed = await resolveOnboardingStatus(userId, activeSession.access_token);
          dispatch(setOnboardingCompleted(completed));

          if (completed) {
            validateProfileInBackground(userId, activeSession.access_token, () => {
              if (!cancelled) dispatch(setOnboardingCompleted(false));
            });
          }
        } else {
          setSession(null);
        }

        const saved = await loadSavedLanguage();
        const lang = saved ?? detectDeviceLanguage();
        if (!saved) await persistLanguage(lang);
        await i18n.changeLanguage(lang);
        dispatch(setLanguage(lang));
      } catch (err) {
        console.error("[RootNavigator] getSession failed:", err);
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        dispatch(logout());
        return;
      }
      dispatch(setCredentials(credentialsFromSession(nextSession)));
      if (event === "SIGNED_IN") {
        try {
          await syncUserProfile(nextSession.access_token);
        } catch (err) {
          console.error("[RootNavigator] syncUserProfile failed on sign-in:", err);
        }
        const userId = nextSession.user.id;
        const completed = await resolveOnboardingStatus(userId, nextSession.access_token);
        dispatch(setOnboardingCompleted(completed));
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  if (isBootstrapping) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  const isAuthed = Boolean(session) || isAuthedFromRedux;

  return (
    <Stack.Navigator
      key={isAuthed ? (onboardingCompleted ? "main" : "onboarding") : "auth"}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      {!isAuthed ? (
        <Stack.Screen name="SocialRegistration" component={SocialRegistrationScreen} />
      ) : !onboardingCompleted ? (
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
