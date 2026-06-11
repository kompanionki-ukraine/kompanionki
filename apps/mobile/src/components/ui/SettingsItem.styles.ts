import { StyleSheet } from "react-native";
import { colors, palette, typography, spacing, radius } from "@/theme";

export const styles = StyleSheet.create({
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  settingsIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIconBoxDestructive: {
    backgroundColor: palette.red100,
  },
  settingsContent: { flex: 1 },
  settingsLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  settingsLabelDestructive: {
    color: colors.error,
  },
  settingsDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  pressed: { opacity: 0.7 },
});
