import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Session } from "@supabase/supabase-js";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDevFlagsHydrated } from "@/store/devFlagsSlice";
import { setCredentials, logout, setLanguage } from "@/store/sessionSlice";
import MainTabs from "./MainTabs";
import SplashScreen from "@/screens/SplashScreen";
import SocialRegistrationScreen from "@/screens/auth/SocialRegistrationScreen";
import { supabase } from "@/lib/supabase";
import type { RootParamList } from "./types";
import { syncUserProfile } from "@/api/syncUser";
import { loadSavedLanguage, detectDeviceLanguage, persistLanguage } from "@/utils/language";
import i18n from "@/i18n";

const Stack = createNativeStackNavigator<RootParamList>();

function credentialsFromSession(session: Session) {
  return {
    userId: session.user.id,
    accessToken: session.access_token,
  };
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
        } else {
          setSession(null);
        }

        // Load persisted language (or detect from device on first launch)
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
      key={isAuthed ? "main" : "auth"}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      {isAuthed ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen
          name="SocialRegistration"
          component={SocialRegistrationScreen}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
