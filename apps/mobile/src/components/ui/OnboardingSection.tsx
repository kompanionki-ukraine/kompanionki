import React from "react";
import { View, Text } from "react-native";
import { styles } from "./OnboardingSection.styles";

interface OnboardingSectionProps {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}

export function OnboardingSection({ title, required, children }: OnboardingSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}
