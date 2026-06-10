import { StyleSheet } from "react-native";

// ─── Color Factory ──────────────────────────────────────────────────────────
// All raw color values. Reference `colors` for semantic usage in components.

export const palette = {
  // Teal (primary brand — dark teal-green)
  teal900: "#1E4445",
  teal700: "#2E6162",
  teal500: "#4A7879",
  teal300: "#8AB5B6",
  teal100: "#D4E9E9",

  // Beige / warm (accent — warm beige for branches & highlights)
  beige700: "#B8946A",
  beige500: "#D3AD84",
  beige300: "#E8CEAB",
  beige100: "#F4E8D5",

  // Terracotta (secondary brand — muted terracotta / dusty rose)
  terracotta700: "#A66558",
  terracotta500: "#C98575",
  terracotta300: "#DFB0A0",
  terracotta100: "#F2DDD7",

  // Cream backgrounds
  cream200: "#EDE6D8", // slightly darker cream / shadow background
  cream100: "#F6F2EA", // light cream background

  // Olive (nature / growth)
  olive500: "#8A9B5A",
  olive300: "#B5C887",

  // Warm brown (grounding / support)
  brown500: "#B5956A",

  // Neutrals — keep all grey / black / white sets
  white: "#FFFFFF",
  grey50: "#FAFAFA",
  grey100: "#F5F5F5",
  grey200: "#EEEEEE",
  grey300: "#E0E0E0",
  grey400: "#BDBDBD",
  grey450: "#9CA3AF",
  grey500: "#9E9E9E",
  grey550: "#6B7280",
  grey600: "#757575",
  grey700: "#616161",
  grey800: "#424242",
  grey900: "#212121",
  black: "#000000",

  // Semantic — standard universally-recognized values, kept intentional
  green500: "#22C55E",
  red500: "#EF4444",
  red100: "#FEE2E2",
  amber500: "#F59E0B",
} as const;

// ─── Semantic Color Map ──────────────────────────────────────────────────────
// Import this in components. Never use raw `palette` values in UI code.

export const colors = {
  // Brand
  primary: palette.teal900,            // #1E4445 — dark teal-green, main CTA & active states
  primaryLight: palette.teal500,       // #4A7879 — medium teal, tinted surfaces
  secondary: palette.terracotta500,    // #C98575 — muted terracotta, warm accent actions
  secondaryLight: palette.terracotta300, // #DFB0A0 — soft terracotta, selected states
  accent: palette.beige500,            // #D3AD84 — warm beige, decorative & branch highlights
  accentLight: palette.beige300,       // #E8CEAB — light beige, tinted chips

  // Backgrounds
  background: palette.cream100,        // #F6F2EA — main screen background
  surface: palette.white,              // #FFFFFF — cards, inputs, modals
  surfaceAlt: palette.cream200,        // #EDE6D8 — alternate surface, icon boxes, dividers

  // Text
  text: "#1A1A2E",                     // near-black, primary text
  textSecondary: palette.grey550,      // #6B7280 — secondary / label text
  textMuted: palette.grey450,          // #9CA3AF — placeholder / muted text
  textInverse: palette.white,          // text on dark/teal backgrounds

  // Tab bar
  tabBar: palette.cream100,            // #F6F2EA — tab bar background
  tabBarBorder: "#D6CFC2",             // warm grey separator
  tabBarActive: palette.teal900,       // #1E4445 — active tab icon/label
  tabBarInactive: palette.grey500,     // #9E9E9E — inactive tab icon/label

  // Semantic
  success: palette.green500,           // #22C55E
  error: palette.red500,               // #EF4444
  warning: palette.amber500,           // #F59E0B
  info: palette.teal700,               // #2E6162 — teal info (replaces blue)

  // Borders
  border: "#D6CFC2",                   // warm grey, default border
  borderFocus: palette.teal900,        // #1E4445 — focused input border

  // Verification badges
  verifiedPhone: palette.teal700,      // #2E6162 — teal (was blue)
  verifiedSelfie: palette.olive500,    // #8A9B5A — olive-green (was purple)
  verifiedId: palette.green500,        // #22C55E — green (unchanged)

  // Intent pills — earthy, nature-inspired
  intentFriendship: palette.terracotta500,  // #C98575 — warm / inviting
  intentCoLiving: palette.beige500,         // #D3AD84 — home / comfort
  intentCoParenting: palette.teal900,       // #1E4445 — trust / family
  intentCoBusiness: palette.teal500,        // #4A7879 — professional
  intentMentorship: palette.olive500,       // #8A9B5A — growth / learning
  intentSupport: palette.brown500,          // #B5956A — grounding / support
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

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  heading1:      { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  heading2:      { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  heading3:      { fontSize: 18, fontWeight: "600" as const },
  body:          { fontSize: 15, fontWeight: "400" as const },
  bodySmall:     { fontSize: 13, fontWeight: "400" as const },
  caption:       { fontSize: 11, fontWeight: "400" as const },
  label:         { fontSize: 13, fontWeight: "600" as const },
  tabLabel:      { fontSize: 10, fontWeight: "500" as const },
  alert:         { fontSize: 14, fontWeight: "600" as const },
  tooltip:       { fontSize: 12, fontWeight: "400" as const },
  inlineMessage: { fontSize: 13, fontWeight: "400" as const },
};

export const shadows = StyleSheet.create({
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.black,
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
