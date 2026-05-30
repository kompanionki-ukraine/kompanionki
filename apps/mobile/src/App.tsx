import React, { useEffect, useRef, useState } from "react";
import { Linking, StatusBar, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./store";
import RootNavigator from "./navigation/RootNavigator";
import "./i18n";
import { configureGoogleSignIn } from "./auth/socialSignIn";
import { applyOAuthCallbackUrl } from "./auth/oauthSession";
import { colors, spacing } from "./theme";

const BANNER_DURATION_MS = 4000;

function AppContent(): React.JSX.Element {
  const { t } = useTranslation();
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    configureGoogleSignIn();

    function showBanner(message: string) {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      setBannerMessage(message);
      dismissTimer.current = setTimeout(() => setBannerMessage(null), BANNER_DURATION_MS);
    }

    async function handleUrl(url: string | null) {
      if (!url) return;
      if (!url.includes("auth-callback")) return;
      const result = await applyOAuthCallbackUrl(url);
      if (result.error) {
        console.warn("[App] deep-link auth failed:", result.error);
        showBanner(t("auth.deepLinkFailed"));
      }
    }

    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    Linking.getInitialURL().then(handleUrl);

    return () => {
      sub.remove();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [t]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          {bannerMessage ? (
            <View style={styles.banner} pointerEvents="none">
              <Text style={styles.bannerText}>{bannerMessage}</Text>
            </View>
          ) : null}
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App(): React.JSX.Element {
  return <AppContent />;
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bannerText: {
    color: colors.textInverse,
    fontSize: 14,
    textAlign: "center",
  },
});
