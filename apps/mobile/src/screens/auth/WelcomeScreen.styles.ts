import { StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    ...screenPadding,
    justifyContent: "space-between",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  hero: { alignItems: "center", gap: spacing.sm },
  logo: { marginBottom: spacing.sm },
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
  pressed: { opacity: 0.7 },
});
