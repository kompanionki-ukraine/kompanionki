import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Session } from "@supabase/supabase-js";
import { useAppDispatch } from "../store";
import { setDevFlagsHydrated } from "../store/devFlagsSlice";
import { setCredentials, logout } from "../store/sessionSlice";
import MainTabs from "./MainTabs";
import SplashScreen from "../screens/SplashScreen";
import SocialRegistrationScreen from "../screens/auth/SocialRegistrationScreen";
import { supabase } from "../lib/supabase";
import { syncUserProfile } from "../api/syncUser";

type RootParamList = {
  Splash: undefined;
  SocialRegistration: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

function credentialsFromSession(session: Session) {
  return {
    userId: session.user.id,
    accessToken: session.access_token,
  };
}

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

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
        setSession(data.session);
        if (data.session) {
          dispatch(setCredentials(credentialsFromSession(data.session)));
          try {
            await syncUserProfile();
          } catch (err) {
            console.error("[RootNavigator] syncUserProfile failed on restore:", err);
          }
        }
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
          await syncUserProfile();
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

  return (
    <Stack.Navigator
      key={session ? "main" : "auth"}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      {session ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen
          name="SocialRegistration"
          component={SocialRegistrationScreen}
        />
      )}
    </Stack.Navigator>
  );
}
