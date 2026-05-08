import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SessionState {
  userId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  languagePref: "uk" | "ru";
}

const initialState: SessionState = {
  userId: null,
  accessToken: null,
  isAuthenticated: false,
  onboardingCompleted: false,
  languagePref: "uk",
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ userId: string; accessToken: string }>
    ) {
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    setOnboardingCompleted(state, action: PayloadAction<boolean>) {
      state.onboardingCompleted = action.payload;
    },
    setLanguage(state, action: PayloadAction<"uk" | "ru">) {
      state.languagePref = action.payload;
    },
    logout(state) {
      state.userId = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.onboardingCompleted = false;
    },
  },
});

export const { setCredentials, setOnboardingCompleted, setLanguage, logout } =
  sessionSlice.actions;
export default sessionSlice.reducer;
