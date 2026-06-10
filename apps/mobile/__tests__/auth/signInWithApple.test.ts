/**
 * Unit tests for signInWithApple().
 *
 * These tests verify the Supabase integration path and error handling without
 * needing a real Apple Developer Program account or device.
 */

// Use the real socialSignIn module, not the global mock from jest.setup.js
jest.unmock("../../src/auth/socialSignIn");

// jest.mock factories run before variable initialisers, so create the jest.fn()
// inline and access it through the imported module after the fact.
jest.mock("@invertase/react-native-apple-authentication", () => ({
  __esModule: true,
  default: {
    isSupported: true,
    Operation: { LOGIN: 0 },
    Scope: { EMAIL: 0, FULL_NAME: 1 },
    performRequest: jest.fn(),
  },
  AppleError: {
    UNKNOWN: "1000",
    CANCELED: "1001",
    INVALID_RESPONSE: "1002",
    NOT_HANDLED: "1003",
    FAILED: "1004",
  },
}));

jest.mock("../../src/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      signInWithIdToken: jest.fn(),
    },
  },
}));

import { signInWithApple } from "../../src/auth/socialSignIn";
import { Platform } from "react-native";
import appleAuth from "@invertase/react-native-apple-authentication";
import { supabase } from "../../src/lib/supabase";

const mockPerformRequest = appleAuth.performRequest as jest.Mock;
const mockSignInWithIdToken = supabase.auth.signInWithIdToken as jest.Mock;

describe("signInWithApple", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = "ios";
  });

  it("calls supabase.signInWithIdToken with the identityToken on success", async () => {
    mockPerformRequest.mockResolvedValueOnce({ identityToken: "mock-apple-token" });
    mockSignInWithIdToken.mockResolvedValueOnce({ error: null });

    await expect(signInWithApple()).resolves.toBeUndefined();

    expect(mockSignInWithIdToken).toHaveBeenCalledWith({
      provider: "apple",
      token: "mock-apple-token",
    });
  });

  it("throws when performRequest returns no identityToken", async () => {
    mockPerformRequest.mockResolvedValueOnce({ identityToken: null });

    await expect(signInWithApple()).rejects.toThrow(
      "Apple Sign-In did not return identityToken"
    );
    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });

  it("throws when supabase signInWithIdToken returns an error", async () => {
    mockPerformRequest.mockResolvedValueOnce({ identityToken: "mock-apple-token" });
    mockSignInWithIdToken.mockResolvedValueOnce({
      error: new Error("Invalid token"),
    });

    await expect(signInWithApple()).rejects.toThrow("Invalid token");
  });

  it("resolves silently when the user cancels (AppleAuthError.CANCELED = 1001)", async () => {
    const cancelError = Object.assign(new Error("Canceled"), { code: "1001" });
    mockPerformRequest.mockRejectedValueOnce(cancelError);

    await expect(signInWithApple()).resolves.toBeUndefined();
    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });

  it("re-throws non-cancellation errors from performRequest", async () => {
    const authError = Object.assign(new Error("Unknown Apple error"), {
      code: "1000",
    });
    mockPerformRequest.mockRejectedValueOnce(authError);

    await expect(signInWithApple()).rejects.toThrow("Unknown Apple error");
    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });

  it("throws when not on iOS", async () => {
    (Platform as { OS: string }).OS = "android";

    await expect(signInWithApple()).rejects.toThrow(
      "Sign in with Apple is only available on supported iOS devices"
    );
    expect(mockPerformRequest).not.toHaveBeenCalled();
  });
});
