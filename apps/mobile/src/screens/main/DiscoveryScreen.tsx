import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { DiscoverScreenProps } from "../../navigation/types";
import { colors, typography, spacing } from "../../theme";

export default function DiscoveryScreen(_props: DiscoverScreenProps<"Discovery">) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("nav.discover")}</Text>
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
