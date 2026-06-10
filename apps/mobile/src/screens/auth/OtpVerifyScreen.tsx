import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import type { AuthScreenProps } from "@/navigation/types";
import { styles } from "./OtpVerifyScreen.styles";

/** OTP removed — placeholder screen. */
const OtpVerifyScreen = (_props: AuthScreenProps<"OtpVerify">) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>OTP verification is disabled in this build.</Text>
      </View>
    </SafeAreaView>
  );
}

export default OtpVerifyScreen;
