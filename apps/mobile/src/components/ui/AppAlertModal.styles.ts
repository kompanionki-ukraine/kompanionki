import { StyleSheet } from "react-native";
import { colors, radius, shadows, spacing, typography } from "@/theme";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(30, 20, 15, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.secondary,
    lineHeight: 26,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonLabel: {
    ...typography.label,
    fontSize: 16,
    color: colors.textInverse,
  },
});
