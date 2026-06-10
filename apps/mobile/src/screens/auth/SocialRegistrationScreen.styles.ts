import { StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    ...screenPadding,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  otpInput: {
    textAlign: "center",
    letterSpacing: 8,
    fontSize: 22,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 60,
  },
  eyeBtn: {
    position: "absolute",
    right: spacing.md,
    height: 52,
    justifyContent: "center",
  },
  eyeText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.secondary,
    marginTop: spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  btnLabelOutline: {
    ...typography.label,
    fontSize: 15,
    color: colors.textSecondary,
  },
  socialGroup: {
    gap: spacing.sm,
  },
  btnApple: {
    backgroundColor: "#000000",
  },
  btnGoogle: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  btnFacebook: {
    backgroundColor: "#1877F2",
  },
  btnLabel: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
  },
  btnLabelOnDark: {
    color: colors.textInverse,
  },
  btnMuted: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
  btnLabelMuted: {
    ...typography.label,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
  },
  hintSmall: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  switchRow: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  switchText: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
  pressed: { opacity: 0.7 },
});
