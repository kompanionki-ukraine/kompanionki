import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { styles } from "./AppAlertModal.styles";
import {
  registerAppAlert,
  unregisterAppAlert,
  type AlertPayload,
} from "@/utils/appAlertBridge";

const AppAlertModal = (): React.JSX.Element | null => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<AlertPayload | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const show = useCallback((p: AlertPayload) => setPayload(p), []);

  useEffect(() => {
    registerAppAlert(show);
    return () => unregisterAppAlert();
  }, [show]);

  useEffect(() => {
    if (payload) {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 280,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [payload, scaleAnim, opacityAnim]);

  const handleDismiss = useCallback(() => {
    const onDismiss = payload?.onDismiss;
    setPayload(null);
    onDismiss?.();
  }, [payload]);

  if (!payload) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Pressable>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>!</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{payload.title}</Text>

            {/* Message */}
            <Text style={styles.message}>{payload.message}</Text>

            {/* Button */}
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleDismiss}
            >
              <Text style={styles.buttonLabel}>{t("errors.ok")}</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default AppAlertModal;
