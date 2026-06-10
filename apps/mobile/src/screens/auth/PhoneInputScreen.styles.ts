import { StyleSheet } from "react-native";
import { colors, typography, spacing } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, ...screenPadding, paddingVertical: spacing.lg, justifyContent: "center" },
  text: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
