import { StyleSheet } from "react-native";
import { colors, spacing, radius, shadows } from "@/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.md,
  },
});
