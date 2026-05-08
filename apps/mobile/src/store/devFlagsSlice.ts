import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DevFlagsState {
  hydrated: boolean;
}

const initialState: DevFlagsState = {
  hydrated: false,
};

const devFlagsSlice = createSlice({
  name: "devFlags",
  initialState,
  reducers: {
    setDevFlagsHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
  },
});

export const { setDevFlagsHydrated } = devFlagsSlice.actions;
export default devFlagsSlice.reducer;
