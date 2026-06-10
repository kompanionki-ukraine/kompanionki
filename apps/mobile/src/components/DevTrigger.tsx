import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Logo from "./ui/Logo";
import DevFlagsMenu from "./DevFlagsMenu";
import { SIZE, useStyles } from "./DevTrigger.styles";

const TAPS_TO_OPEN = 2;
const TAP_WINDOW_MS = 1500;

/**
 * Floating dev trigger — only rendered in __DEV__ builds.
 *
 * Mounted once at App root (sibling of NavigationContainer) so it overlays
 * every screen. Double-tap the logo within 1.5s to open the dev flags menu.
 *
 * Stripped from release builds because the JSX is gated on `__DEV__`.
 */
const DevTrigger = () => {
  if (!__DEV__) return null;
  return <DevTriggerImpl />;
}

function DevTriggerImpl() {
  const styles = useStyles();
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
        style={styles.container}
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

export default DevTrigger;
