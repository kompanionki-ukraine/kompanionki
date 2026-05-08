import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { ProfileScreenProps } from "../../navigation/types";
import { colors, typography, spacing } from "../../theme";

export default function MyProfileScreen(_props: ProfileScreenProps<"MyProfile">) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("nav.profile")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  label: { ...typography.heading3, color: colors.textMuted },
});
