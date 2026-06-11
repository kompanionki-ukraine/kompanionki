import { StyleSheet } from "react-native";
import { colors, typography, spacing, radius, shadows } from "@/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
  },
  required: {
    color: colors.secondary,
  },
});
