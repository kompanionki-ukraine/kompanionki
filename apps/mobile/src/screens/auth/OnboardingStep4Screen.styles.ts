import { StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { ...screenPadding, paddingVertical: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { ...typography.heading2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 100,
  },
  charCount: { ...typography.caption, color: colors.textMuted, textAlign: "right" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  tagText: { ...typography.label, color: colors.text },
  tagTextSelected: { color: colors.primary },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  back: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  backText: { ...typography.body, color: colors.text, fontWeight: "600" },
  button: {
    flex: 2,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    fontSize: 17,
  },
  pressed: { opacity: 0.7 },
});
