/**
 * Imperative bridge between non-React code (errorHandler) and the
 * AppAlertModal component mounted in the React tree.
 *
 * AppAlertModal registers itself on mount and unregisters on unmount.
 * If the modal is not yet mounted, showAppAlert falls back to the
 * native Alert so nothing is silently swallowed during early boot.
 */
import { Alert } from "react-native";

export interface AlertPayload {
  title: string;
  message: string;
  onDismiss?: () => void;
}

type ShowFn = (payload: AlertPayload) => void;

let _show: ShowFn | null = null;

export function registerAppAlert(fn: ShowFn): void {
  _show = fn;
}

export function unregisterAppAlert(): void {
  _show = null;
}

export function showAppAlert(payload: AlertPayload): void {
  if (_show) {
    _show(payload);
  } else {
    // Fallback during app boot before the modal is mounted
    Alert.alert(payload.title, payload.message, [
      { text: "OK", onPress: payload.onDismiss },
    ]);
  }
}
