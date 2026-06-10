import { StyleSheet } from "react-native";
import { colors, palette, typography, spacing, radius, shadows } from "@/theme";
import { screenPadding } from "@/styles/layout";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    ...screenPadding,
    gap: spacing.sm,
  },
  errorTitle: {
    ...typography.heading3,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  errorBody: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },

  // Nav bar
  navBar: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  navBarSpacer: { width: 44 },
  navBarTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  navBarButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    ...shadows.md,
  },

  // Profile header
  profileHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.lg,
  },
  avatarFallback: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.primary,
  },
  avatarEditButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  displayName: {
    ...typography.heading2,
    color: colors.text,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  metaDot: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  verificationBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  verificationBadgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: "600",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  statSeparator: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  statNumber: {
    ...typography.heading2,
    color: colors.text,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },

  // About
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Pills
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  intentPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  intentPillText: {
    ...typography.label,
    color: colors.textInverse,
  },
  valuePill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  valuePillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Settings
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
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 40 + spacing.md,
  },

  // Footer
  versionText: {
    textAlign: "center",
    ...typography.caption,
    color: colors.textMuted,
    paddingBottom: spacing.lg,
  },
  pressed: { opacity: 0.7 },
});
