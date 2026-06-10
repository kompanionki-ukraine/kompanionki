import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Share,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  DEV_FLAG_KEYS,
  DevFlagKey,
  resetDevFlags,
  setDevFlag,
} from "@/store/devFlagsSlice";
import { colors, spacing } from "@/theme";
import { styles } from "./DevFlagsMenu.styles";
import { readLogs, clearLogs } from "@/utils/logger";

const FLAG_LABELS: Record<DevFlagKey, string> = {
  verboseLogging: "Verbose Logging",
  skipOnboarding: "Skip Onboarding",
  mockApiResponses: "Mock API Responses",
  enableAppleIDSignIn: "Apple ID Sign-In",
  enableFacebookSignIn: "Facebook Sign-In",
  languageEN: "Language",
  darkMode: "Theme",
};

// [off-label, on-label] for flags that aren't simple on/off
const FLAG_VALUE_HINTS: Partial<Record<DevFlagKey, [string, string]>> = {
  languageEN: ["UA", "EN"],
  darkMode: ["Light", "Dark"],
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Dev-only feature flag menu. Toggle runtime debug behaviors. */
const DevFlagsMenu = ({ visible, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const flags = useAppSelector((s) => s.devFlags.flags);

  async function handleShareLogs() {
    const content = await readLogs();
    if (!content.trim()) {
      Alert.alert("No logs", "Enable verboseLogging and use the app first.");
      return;
    }
    await Share.share({ message: content, title: "verbose.log" });
  }

  async function handleClearLogs() {
    await clearLogs();
    Alert.alert("Cleared", "Log buffer has been cleared.");
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Dev Flags</Text>
            <Pressable onPress={() => dispatch(resetDevFlags())} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={{ gap: spacing.sm }}>
            {DEV_FLAG_KEYS.map((key) => (
              <FlagRow
                key={key}
                flagKey={key}
                value={flags[key]}
                onChange={(value) => dispatch(setDevFlag({ key, value }))}
              />
            ))}
          </ScrollView>

          <View style={styles.logActions}>
            <Pressable style={({ pressed }) => [styles.logBtn, pressed && styles.pressed]} onPress={handleShareLogs}>
              <Text style={styles.logBtnText}>Share Logs</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.logBtn, pressed && styles.pressed]} onPress={handleClearLogs}>
              <Text style={styles.logBtnText}>Clear Logs</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Закрити</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FlagRow({
  flagKey,
  value,
  onChange,
}: {
  flagKey: DevFlagKey;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const hints = FLAG_VALUE_HINTS[flagKey];

  if (hints) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{FLAG_LABELS[flagKey]}</Text>
        <View style={styles.radioGroup}>
          {hints.map((label, idx) => {
            const isSelected = idx === 0 ? !value : value;
            return (
              <Pressable
                key={label}
                style={({ pressed }) => [styles.radioOption, pressed && styles.pressed]}
                onPress={() => onChange(idx === 1)}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{FLAG_LABELS[flagKey]}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.secondaryLight }}
        thumbColor={value ? colors.secondary : colors.surface}
      />
    </View>
  );
}

export default DevFlagsMenu;
