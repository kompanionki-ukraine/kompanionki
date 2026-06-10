import React from "react";
import { View } from "react-native";
import { styles } from "./OnboardingProgress.styles";

interface Props {
  step: number;
  total: number;
}

const OnboardingProgress = ({ step, total }: Props) => {
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

export default OnboardingProgress;
