import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import i18n from "@/i18n";
import { captureException } from "./errorReporting";
import { showAppAlert } from "./appAlertBridge";

export type AppError = FetchBaseQueryError | SerializedError | Error | unknown;

export interface ErrorHandlerOptions {
  /** Override the alert title. Defaults to the auto-resolved title. */
  title?: string;
  /** Override the alert message. Defaults to the auto-resolved message. */
  message?: string;
  /** Called when the user taps the primary button. */
  onDismiss?: () => void;
  /** When true, skips sending the error to Sentry. Default: false. */
  silent?: boolean;
}

function t(key: string): string {
  return i18n.t(key);
}

/**
 * Resolve a human-readable { title, message } pair from any error shape.
 * RTK Query errors, JS errors, and plain unknowns are all handled.
 */
export function resolveErrorMessage(error: AppError): {
  title: string;
  message: string;
} {
  const fallback = {
    title: t("errors.somethingWentWrong"),
    message: t("errors.tryAgain"),
  };

  if (!error) return fallback;

  // RTK Query FetchBaseQueryError — has a numeric/string `status`
  if (typeof error === "object" && "status" in error) {
    const fetchError = error as FetchBaseQueryError;

    if (fetchError.status === "FETCH_ERROR") {
      return {
        title: t("errors.somethingWentWrong"),
        message: t("errors.networkError"),
      };
    }

    if (typeof fetchError.status === "number") {
      if (fetchError.status === 401) {
        return {
          title: t("errors.somethingWentWrong"),
          message: t("errors.sessionExpired"),
        };
      }
      if (fetchError.status === 403) {
        return {
          title: t("errors.somethingWentWrong"),
          message: t("errors.forbidden"),
        };
      }
      if (fetchError.status === 404) {
        return {
          title: t("errors.somethingWentWrong"),
          message: t("errors.notFound"),
        };
      }
      if (fetchError.status >= 500) {
        return {
          title: t("errors.somethingWentWrong"),
          message: t("errors.serverError"),
        };
      }
    }
  }

  // SerializedError / native Error — has a `message` string
  if (error instanceof Error) {
    return { title: t("errors.somethingWentWrong"), message: error.message };
  }
  if (typeof error === "object" && "message" in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) {
      return { title: t("errors.somethingWentWrong"), message: msg };
    }
  }

  return fallback;
}

/**
 * Show a native alert for the given error and optionally report it to Sentry.
 *
 * @example
 *   handleError(error);
 *   handleError(error, { title: t("auth.signInFailedTitle"), onDismiss: reset });
 */
export function handleError(error: AppError, options: ErrorHandlerOptions = {}): void {
  const resolved = resolveErrorMessage(error);
  const title = options.title ?? resolved.title;
  const message = options.message ?? resolved.message;

  // Report unexpected (non-client) errors to Sentry
  if (!options.silent) {
    const isClientError =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as FetchBaseQueryError).status === "number" &&
      (error as { status: number }).status < 500;

    if (!isClientError) {
      captureException(error, { resolvedTitle: title, resolvedMessage: message });
    }
  }

  showAppAlert({ title, message, onDismiss: options.onDismiss });
}
