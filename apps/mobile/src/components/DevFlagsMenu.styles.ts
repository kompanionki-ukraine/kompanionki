import { StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/theme";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.heading3, color: colors.text },
  resetText: { ...typography.label, color: colors.secondary },
  list: { flexGrow: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  rowHint: { ...typography.caption, color: colors.textMuted, marginRight: spacing.sm },
  radioGroup: {
    flexDirection: "row",
    gap: spacing.md,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.secondary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  radioLabel: { ...typography.label, color: colors.textMuted },
  radioLabelSelected: { color: colors.secondary },
  logActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  logBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  logBtnText: { ...typography.label, color: colors.text },
  closeBtn: {
    alignSelf: "flex-end",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  closeText: { ...typography.label, color: colors.secondary },
  pressed: { opacity: 0.7 },
});
