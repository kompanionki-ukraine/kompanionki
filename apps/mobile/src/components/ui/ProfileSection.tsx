import React from "react";
import { View } from "react-native";
import { styles } from "./ProfileSection.styles";

interface ProfileSectionProps {
  children: React.ReactNode;
}

export function ProfileSection({ children }: ProfileSectionProps) {
  return <View style={styles.card}>{children}</View>;
}
