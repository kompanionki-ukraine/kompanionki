import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import type { AuthScreenProps } from "@/navigation/types";
import { styles } from "./PhoneInputScreen.styles";

/** OTP removed — placeholder screen. */
const PhoneInputScreen = (_props: AuthScreenProps<"PhoneInput">) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>Phone sign-in is disabled in this build.</Text>
      </View>
    </SafeAreaView>
  );
}

export default PhoneInputScreen;
