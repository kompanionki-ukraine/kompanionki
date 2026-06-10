import { StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    ...screenPadding,
    paddingVertical: spacing.lg,
  },
  label: { ...typography.heading3, color: colors.textMuted },
});
