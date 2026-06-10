import React from "react";
import { View, ActivityIndicator } from "react-native";
import Logo from "@/components/ui/Logo";
import { colors } from "@/theme";
import { styles } from "./SplashScreen.styles";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Logo size={120} />
      <ActivityIndicator color={colors.secondary} size="small" />
    </View>
  );
};

export default SplashScreen;
