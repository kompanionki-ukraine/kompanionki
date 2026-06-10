import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SIZE = 44;

export const useStyles = () => {
  const { top } = useSafeAreaInsets();
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: "absolute",
          zIndex: 9999,
          elevation: 9999,
          top: top + 4,
          right: 4,
        },
        button: {
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          overflow: "hidden",
        },
      }),
    [top]
  );
};
