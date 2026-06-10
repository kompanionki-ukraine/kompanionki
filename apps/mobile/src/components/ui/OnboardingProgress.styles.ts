import { StyleSheet } from "react-native";
import { colors, spacing, radius } from "@/theme";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.secondary,
  },
});
