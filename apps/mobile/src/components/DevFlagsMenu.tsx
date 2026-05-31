import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Share,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store";
import {
  DEV_FLAG_KEYS,
  DevFlagKey,
  resetDevFlags,
  setDevFlag,
} from "../store/devFlagsSlice";
import { colors, typography, spacing, radius } from "../theme";
import { readLogs, clearLogs } from "../utils/logger";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Dev-only feature flag menu. Toggle runtime debug behaviors. */
export default function DevFlagsMenu({ visible, onClose }: Props) {
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
            <TouchableOpacity onPress={() => dispatch(resetDevFlags())}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.logBtn} onPress={handleShareLogs}>
              <Text style={styles.logBtnText}>Share Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logBtn} onPress={handleClearLogs}>
              <Text style={styles.logBtnText}>Clear Logs</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeText}>Закрити</Text>
          </TouchableOpacity>
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
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{flagKey}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.secondaryLight }}
        thumbColor={value ? colors.secondary : colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.heading3, color: colors.text },
  resetText: { ...typography.label, color: colors.secondary },
  list: { flexGrow: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  logActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  logBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  logBtnText: { ...typography.label, color: colors.text },
  closeBtn: {
    alignSelf: "flex-end",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  closeText: { ...typography.label, color: colors.secondary },
});
