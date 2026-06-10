/**
 * Component tests for SocialRegistrationScreen.
 *
 * Verifies the UI state machine: busy/disabled while loading, Alert on error,
 * re-enabled after completion, and cancellation (resolved silently) skips the Alert.
 */

import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Alert, TouchableOpacity } from "react-native";
import { Provider } from "react-redux";
import { store } from "../../src/store";

import SocialRegistrationScreen from "../../src/screens/auth/SocialRegistrationScreen";
import {
  signInWithApple,
  isAppleSignInAvailable,
} from "../../src/auth/socialSignIn";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: "3rdParty", init: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    // Return a plain View so no React import is needed inside the factory
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// socialSignIn and supabase are already mocked in jest.setup.js
const mockSignInWithApple = signInWithApple as jest.Mock;
const mockIsAppleSignInAvailable = isAppleSignInAvailable as jest.Mock;

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

function getButtons(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(TouchableOpacity);
}

describe("SocialRegistrationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAppleSignInAvailable.mockReturnValue(true);
  });

  describe("Apple button visibility", () => {
    it("renders a pressable Apple button when isAppleSignInAvailable is true", () => {
      const renderer = render();
      const buttons = getButtons(renderer);
      // Apple, Google, Facebook = 3 TouchableOpacity buttons
      expect(buttons).toHaveLength(3);
      expect(buttons[0].props.disabled).toBe(false);
    });

    it("renders only 2 pressable buttons when Apple is unavailable (non-iOS placeholder shown instead)", () => {
      mockIsAppleSignInAvailable.mockReturnValue(false);
      const renderer = render();
      const buttons = getButtons(renderer);
      // Google and Facebook only
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Apple sign-in flow", () => {
    it("calls signInWithApple when the Apple button is pressed", async () => {
      mockSignInWithApple.mockResolvedValueOnce(undefined);
      const renderer = render();

      await act(async () => {
        getButtons(renderer)[0].props.onPress();
      });

      expect(mockSignInWithApple).toHaveBeenCalledTimes(1);
    });

    it("disables all buttons while sign-in is in progress", async () => {
      let resolveSignIn!: () => void;
      mockSignInWithApple.mockReturnValueOnce(
        new Promise<void>((r) => {
          resolveSignIn = r;
        })
      );

      const renderer = render();

      act(() => {
        getButtons(renderer)[0].props.onPress();
      });

      // While the promise is still pending all buttons must be disabled
      getButtons(renderer).forEach((btn) => {
        expect(btn.props.disabled).toBe(true);
      });

      // Settle the promise
      await act(async () => {
        resolveSignIn();
      });
    });

    it("shows an Alert with the error message when signInWithApple throws", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      mockSignInWithApple.mockRejectedValueOnce(new Error("Apple auth failed"));

      const renderer = render();

      await act(async () => {
        getButtons(renderer)[0].props.onPress();
      });

      expect(alertSpy).toHaveBeenCalledWith(
        "auth.signInFailedTitle",
        "Apple auth failed"
      );
    });

    it("re-enables the Apple button after an error (busy resets to null)", async () => {
      mockSignInWithApple.mockRejectedValueOnce(new Error("fail"));

      const renderer = render();

      await act(async () => {
        getButtons(renderer)[0].props.onPress();
      });

      expect(getButtons(renderer)[0].props.disabled).toBe(false);
    });

    it("does NOT show an Alert when signInWithApple resolves (happy path)", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      mockSignInWithApple.mockResolvedValueOnce(undefined);

      const renderer = render();

      await act(async () => {
        getButtons(renderer)[0].props.onPress();
      });

      expect(alertSpy).not.toHaveBeenCalled();
    });

    it("does NOT show an Alert when signInWithApple resolves silently after cancellation", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");
      // Cancellation → signInWithApple resolves without throwing (our fix)
      mockSignInWithApple.mockResolvedValueOnce(undefined);

      const renderer = render();

      await act(async () => {
        getButtons(renderer)[0].props.onPress();
      });

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe("Supabase not configured", () => {
    it("shows an envMissing Alert and does not call signInWithApple", async () => {
      const alertSpy = jest.spyOn(Alert, "alert");

      const supabaseModule = require("../../src/lib/supabase");
      const original = supabaseModule.isSupabaseConfigured;
      Object.defineProperty(supabaseModule, "isSupabaseConfigured", {
        value: false,
        configurable: true,
      });

      const renderer = render();

      await act(async () => {
        getButtons(renderer)[0].props.onPress();
      });

      expect(alertSpy).toHaveBeenCalledWith(
        "auth.envMissingTitle",
        "auth.envMissingBody"
      );
      expect(mockSignInWithApple).not.toHaveBeenCalled();

      Object.defineProperty(supabaseModule, "isSupabaseConfigured", {
        value: original,
        configurable: true,
      });
    });
  });
});
