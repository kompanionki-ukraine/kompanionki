import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Logo from "./ui/Logo";
import DevFlagsMenu from "./DevFlagsMenu";

const TAPS_TO_OPEN = 2;
const TAP_WINDOW_MS = 1500;
const SIZE = 44;

/**
 * Floating dev trigger — only rendered in __DEV__ builds.
 *
 * Mounted once at App root (sibling of NavigationContainer) so it overlays
 * every screen. Double-tap the logo within 1.5s to open the dev flags menu.
 *
 * Stripped from release builds because the JSX is gated on `__DEV__`.
 */
export default function DevTrigger() {
  if (!__DEV__) return null;
  return <DevTriggerImpl />;
}

function DevTriggerImpl() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const tapCount = useRef(0);
  const firstTapAt = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - firstTapAt.current > TAP_WINDOW_MS) {
      tapCount.current = 1;
      firstTapAt.current = now;
      return;
    }
    tapCount.current += 1;
    if (tapCount.current >= TAPS_TO_OPEN) {
      tapCount.current = 0;
      firstTapAt.current = 0;
      setMenuOpen(true);
    }
  };

  return (
    <>
      <View
        style={[styles.container, { top: insets.top + 4, right: 4 }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handlePress}
          hitSlop={12}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 1 : 0.6 },
          ]}
        >
          <Logo size={SIZE} />
        </Pressable>
      </View>
      <DevFlagsMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999,
    elevation: 9999,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: "hidden",
  },
});
