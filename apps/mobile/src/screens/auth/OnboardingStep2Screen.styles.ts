import { StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { ...screenPadding, paddingVertical: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { ...typography.heading2, color: colors.text },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight + "33",
  },
  optionText: { ...typography.label, color: colors.text },
  optionTextSelected: { color: colors.secondary },
  optionsCol: { gap: spacing.sm },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionRowSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight + "22",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: { borderColor: colors.secondary, backgroundColor: colors.secondary },
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
  buttonDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
  buttonText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    fontSize: 17,
  },
});
