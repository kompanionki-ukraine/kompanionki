import React from "react";
import { View, Text, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "@/theme";
import { styles } from "./SettingsItem.styles";

export interface SettingsItemProps {
  icon: string;
  label: string;
  description?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingsItem({ icon, label, description, onPress, destructive }: SettingsItemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.settingsItem, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.settingsIconBox, destructive && styles.settingsIconBoxDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.error : colors.textSecondary}
        />
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsLabel, destructive && styles.settingsLabelDestructive]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.settingsDescription}>{description}</Text>
        ) : null}
      </View>
      {onPress && !destructive ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}
