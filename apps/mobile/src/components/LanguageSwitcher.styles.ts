import { StyleSheet } from "react-native";
import { colors, typography, radius } from "@/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    overflow: "hidden",
  },
  pill: {
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pillLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.secondary,
  },
  pillRight: {},
  pillActive: {
    backgroundColor: colors.secondary,
  },
  label: {
    ...typography.label,
    fontSize: 13,
  },
  labelSmall: {
    ...typography.label,
    fontSize: 11,
  },
  textActive: {
    color: colors.textInverse,
  },
  textInactive: {
    color: colors.secondary,
  },
  pressed: { opacity: 0.7 },
});
