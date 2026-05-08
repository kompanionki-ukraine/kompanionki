import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme";

interface Props {
  step: number;
  total: number;
}

export default function OnboardingProgress({ step, total }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i < step && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.secondary,
  },
});
