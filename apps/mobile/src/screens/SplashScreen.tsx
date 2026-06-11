import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Logo from "../components/ui/Logo";
import { colors, spacing } from "../theme";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Logo size={120} />
      <ActivityIndicator color={colors.secondary} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
});
