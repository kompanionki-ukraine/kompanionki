import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import type { AuthScreenProps } from "../../navigation/types";
import { colors, typography, spacing } from "../../theme";

/** OTP removed — placeholder screen. */
export default function OtpVerifyScreen(_props: AuthScreenProps<"OtpVerify">) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>OTP verification is disabled in this build.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  text: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
});
