import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing, typography } from "../../theme";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  isAppleSignInAvailable,
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from "../../auth/socialSignIn";

type Busy = "apple" | "google" | "facebook" | null;

export default function SocialRegistrationScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<Busy>(null);

  const run = useCallback(
    async (provider: Exclude<Busy, null>, fn: () => Promise<void>) => {
      if (!isSupabaseConfigured) {
        if (__DEV__) {
          console.warn(
            "[Kompanionki] Supabase env missing: set SUPABASE_URL and SUPABASE_ANON_KEY (apps/mobile/.env.development). See apps/mobile/README.md."
          );
        }
        Alert.alert(t("auth.envMissingTitle"), t("auth.envMissingBody"));
        return;
      }
      setBusy(provider);
      try {
        await fn();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        Alert.alert(t("auth.signInFailedTitle"), msg);
      } finally {
        setBusy(null);
      }
    },
    [t]
  );

  const showApple = isAppleSignInAvailable();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.center}>
        <Text style={[typography.heading2, styles.title]}>
          {t("auth.socialTitle")}
        </Text>
        <Text style={[typography.body, styles.subtitle]}>
          {t("auth.socialSubtitle")}
        </Text>
      </View>

      <View style={styles.bottom}>
        {showApple ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnApple]}
            disabled={busy !== null}
            onPress={() => run("apple", signInWithApple)}
            accessibilityRole="button"
          >
            {busy === "apple" ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                {t("auth.continueApple")}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[styles.btn, styles.btnMuted]} accessibilityElementsHidden>
            <Text style={styles.btnLabelMuted}>{t("auth.continueApple")}</Text>
            <Text style={styles.hintSmall}>{t("auth.appleIosOnly")}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.btnGoogle]}
          disabled={busy !== null}
          onPress={() => run("google", signInWithGoogle)}
          accessibilityRole="button"
        >
          {busy === "google" ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.btnLabel}>{t("auth.continueGoogle")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnFacebook]}
          disabled={busy !== null}
          onPress={() => run("facebook", signInWithFacebook)}
          accessibilityRole="button"
        >
          {busy === "facebook" ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
              {t("auth.continueFacebook")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  btnApple: {
    backgroundColor: "#000000",
  },
  btnGoogle: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  btnFacebook: {
    backgroundColor: "#1877F2",
  },
  btnLabel: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
  },
  btnLabelOnDark: {
    color: colors.textInverse,
  },
  btnMuted: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
  btnLabelMuted: {
    ...typography.label,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
  },
  hintSmall: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
});
