import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { AuthScreenProps } from "../../navigation/types";
import { colors, typography, spacing, radius } from "../../theme";

/** OTP flow removed; kept for navigation typing if AuthStack is used. */
export default function WelcomeScreen({ navigation }: AuthScreenProps<"Welcome">) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoHeart}>♥</Text>
          </View>
          <Text style={styles.title}>{t("appName")}</Text>
          <Text style={styles.tagline}>{t("tagline")}</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("PhoneInput")}
          >
            <Text style={styles.primaryButtonText}>{t("onboarding.getStarted")}</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            Тільки для жінок • Без реклами • Без романтики
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  hero: { alignItems: "center", gap: spacing.sm },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logoHeart: { fontSize: 44, color: colors.surface },
  title: { ...typography.heading1, color: colors.text },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 260,
  },
  footer: { gap: spacing.md },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    fontSize: 17,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
});
