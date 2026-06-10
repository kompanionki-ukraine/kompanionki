import { StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    ...screenPadding,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: { ...typography.heading2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  fields: { gap: spacing.md, marginTop: spacing.sm },
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    fontSize: 17,
  },
  pressed: { opacity: 0.7 },
});
