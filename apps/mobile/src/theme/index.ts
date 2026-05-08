import { StyleSheet } from "react-native";

export const colors = {
  // Brand
  primary: "#E8936A",       // warm peach
  primaryLight: "#F5C4A8",
  secondary: "#C2607A",     // rose
  secondaryLight: "#EFB8C6",

  // Backgrounds
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F0EE",

  // Text
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Tab bar (iOS-like)
  tabBar: "#F9F9F9",
  tabBarBorder: "#C6C6C8",
  tabBarActive: "#C2607A",
  tabBarInactive: "#999999",

  // Semantic
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  // Borders
  border: "#E5E7EB",
  borderFocus: "#C2607A",

  // Verification badges
  verifiedPhone: "#3B82F6",
  verifiedSelfie: "#8B5CF6",
  verifiedId: "#22C55E",

  // Intent pills
  intentFriendship: "#EC4899",
  intentCoLiving: "#F97316",
  intentCoParenting: "#8B5CF6",
  intentCoBusiness: "#3B82F6",
  intentMentorship: "#10B981",
  intentSupport: "#F59E0B",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  heading1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  heading2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  heading3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  bodySmall: { fontSize: 13, fontWeight: "400" as const },
  caption: { fontSize: 11, fontWeight: "400" as const },
  label: { fontSize: 13, fontWeight: "600" as const },
  tabLabel: { fontSize: 10, fontWeight: "500" as const },
} as const;

export const shadows = StyleSheet.create({
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
});

// Shared card style
export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.md,
  ...shadows.md,
} as const;

// Intent color map
export const intentColors: Record<string, string> = {
  friendship: colors.intentFriendship,
  co_living: colors.intentCoLiving,
  co_parenting: colors.intentCoParenting,
  co_business: colors.intentCoBusiness,
  mentorship: colors.intentMentorship,
  support: colors.intentSupport,
};
