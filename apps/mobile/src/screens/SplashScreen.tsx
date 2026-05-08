import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../theme";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
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
  },
});
