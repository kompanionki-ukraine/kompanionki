import { Platform, StyleSheet } from "react-native";
import { colors } from "@/theme";

export const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === "ios" ? 83 : 60,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 6,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  iconText: {
    fontSize: 22,
    opacity: 0.55,
  },
  iconTextFocused: {
    opacity: 1,
  },
});
