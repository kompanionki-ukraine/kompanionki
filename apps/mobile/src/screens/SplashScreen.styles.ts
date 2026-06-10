import { StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
});
