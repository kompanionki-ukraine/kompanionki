/**
 * Component tests for SocialRegistrationScreen.
 *
 * Social sign-in buttons (Apple, Facebook) are currently behind dev flags.
 * Tests for those flows will be added when the flags are removed.
 */

import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Provider } from "react-redux";
import { store } from "../../src/store";

import SocialRegistrationScreen from "../../src/screens/auth/SocialRegistrationScreen";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

function render() {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <SocialRegistrationScreen />
      </Provider>
    );
  });
  return renderer;
}

describe("SocialRegistrationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => render()).not.toThrow();
  });
});
