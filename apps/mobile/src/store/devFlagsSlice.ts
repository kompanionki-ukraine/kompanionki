import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Registry of dev-only feature flags. Add new flags here and they'll show up
 * automatically as toggles in DevFlagsMenu.
 *
 * Flags are session-only (in-memory) — they reset on app reload, which is
 * usually what you want for transient debugging. If a flag needs to persist,
 * wire it through AsyncStorage in a separate effect.
 */
export const DEV_FLAG_KEYS = [
  "verboseLogging",
  "skipOnboarding",
  "mockApiResponses",
  "enableAppleIDSignIn",
  "enableFacebookSignIn",
] as const;

export type DevFlagKey = (typeof DEV_FLAG_KEYS)[number];

export interface DevFlagsState {
  hydrated: boolean;
  flags: Record<DevFlagKey, boolean>;
}

const initialFlags = DEV_FLAG_KEYS.reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {} as Record<DevFlagKey, boolean>,
);

const initialState: DevFlagsState = {
  hydrated: false,
  flags: initialFlags,
};

const devFlagsSlice = createSlice({
  name: "devFlags",
  initialState,
  reducers: {
    setDevFlagsHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    setDevFlag(
      state,
      action: PayloadAction<{ key: DevFlagKey; value: boolean }>,
    ) {
      state.flags[action.payload.key] = action.payload.value;
    },
    resetDevFlags(state) {
      state.flags = { ...initialFlags };
    },
  },
});

export const { setDevFlagsHydrated, setDevFlag, resetDevFlags } =
  devFlagsSlice.actions;
export default devFlagsSlice.reducer;
