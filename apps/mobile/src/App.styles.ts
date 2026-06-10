import { StyleSheet } from "react-native";
import { colors, spacing } from "./theme";

export const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bannerText: {
    color: colors.textInverse,
    fontSize: 14,
    textAlign: "center",
  },
});
