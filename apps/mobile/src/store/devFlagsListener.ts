import { createListenerMiddleware } from "@reduxjs/toolkit";
import { api } from "../api/client";
import { supabase } from "../lib/supabase";
import { setDevFlag } from "./devFlagsSlice";
import { setCredentials, logout } from "./sessionSlice";
import * as logger from "../utils/logger";

/**
 * Reacts to DevFlags changes that have side effects.
 *
 * skipOnboarding ON  → sign out any real Supabase session, fetch a JWT for the
 *                      seeded test user from `/dev/test-session`, and inject
 *                      those credentials into the Redux session so RTK Query
 *                      requests are authenticated as that user.
 * skipOnboarding OFF → clear credentials and reset the RTK cache so the app
 *                      returns to the unauthenticated state.
 */
export const devFlagsListener = createListenerMiddleware();

devFlagsListener.startListening({
  actionCreator: setDevFlag,
  effect: (action) => {
    if (action.payload.key !== "verboseLogging") return;
    if (action.payload.value) {
      logger.install();
      console.log("[devFlagsListener] verboseLogging ON — key:", logger.getLogStorageKey());
    } else {
      logger.uninstall();
    }
  },
});

devFlagsListener.startListening({
  actionCreator: setDevFlag,
  effect: async (action, { dispatch }) => {
    if (action.payload.key !== "skipOnboarding") return;

    if (action.payload.value) {
      try {
        // Drop any real Supabase session so onAuthStateChange doesn't clobber us.
        await supabase.auth.signOut().catch(() => {});

        // Mutations always execute fresh — no caching options needed.
        const result = await dispatch(
          api.endpoints.loadTestSession.initiate(undefined)
        );
        const data = "data" in result ? result.data : undefined;
        if (!data) {
          console.error("[devFlagsListener] loadTestSession failed", result);
          return;
        }

        dispatch(
          setCredentials({
            userId: data.userId,
            accessToken: data.accessToken,
          })
        );
        // Force every cached query to refetch with the new token.
        dispatch(api.util.resetApiState());
      } catch (err) {
        console.error("[devFlagsListener] skipOnboarding ON failed", err);
      }
    } else {
      dispatch(logout());
      dispatch(api.util.resetApiState());
    }
  },
});
