jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-vector-icons/Ionicons", () => "Ionicons");

jest.mock("react-native-localize", () => ({
  getLocales: () => [{ languageCode: "uk", countryCode: "UA", languageTag: "uk-UA", isRTL: false }],
  getNumberFormatSettings: () => ({ decimalSeparator: ".", groupingSeparator: "," }),
  getCalendar: () => "gregorian",
  getCountry: () => "UA",
  getCurrencies: () => ["UAH"],
  getTemperatureUnit: () => "celsius",
  getTimeZone: () => "Europe/Kiev",
  uses24HourClock: () => true,
  usesMetricSystem: () => true,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  findBestLanguageTag: jest.fn(),
}));

jest.mock("./src/config/publicEnv", () => ({
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "test-anon",
  GOOGLE_WEB_CLIENT_ID: "",
  GOOGLE_IOS_CLIENT_ID: "",
  OAUTH_REDIRECT_URL: "kompanionki://auth-callback",
  API_BASE_URL: "",
}));

jest.mock("react-native-gesture-handler", () => {
  const RN = require("react-native");
  return {
    GestureHandlerRootView: RN.View,
    PanGestureHandler: RN.View,
    TapGestureHandler: RN.View,
    State: {},
    ScrollView: RN.ScrollView,
    Swipeable: RN.View,
    DrawerLayout: RN.View,
  };
});

jest.mock("./src/api/syncUser", () => ({
  syncUserProfile: jest.fn(() => Promise.resolve()),
}));

jest.mock("./src/auth/socialSignIn", () => ({
  configureGoogleSignIn: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  signInWithFacebook: jest.fn(),
  isAppleSignInAvailable: jest.fn(() => false),
}));

jest.mock("react-native-inappbrowser-reborn", () => ({
  openAuth: jest.fn(),
  default: { openAuth: jest.fn() },
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve()),
    signIn: jest.fn(() => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve({ idToken: "x" })),
  },
}));

jest.mock("./src/lib/supabase", () => {
  const subscription = { unsubscribe: jest.fn() };
  return {
    isSupabaseConfigured: true,
    supabase: {
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({ data: { session: null }, error: null })
        ),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription },
        })),
      },
    },
  };
});
