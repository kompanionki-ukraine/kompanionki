import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing, typography } from "../../theme";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  isAppleSignInAvailable,
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from "../../auth/socialSignIn";
import {
  resendSignupOtp,
  signInWithEmail,
  signUpWithEmail,
  verifySignupOtp,
} from "../../auth/emailAuth";

type EmailBusy = "email" | "otpVerify" | "otpResend" | null;
type SocialBusy = "apple" | "google" | "facebook" | null;
type Mode = "register" | "signIn" | "awaitingOtp";

const OTP_RESEND_SECONDS = 60;
const OTP_LENGTH = 6;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPassword(value: string): boolean {
  return value.length >= 6;
}

export default function SocialRegistrationScreen(): React.JSX.Element {
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);
  const [emailBusy, setEmailBusy] = useState<EmailBusy>(null);
  const [socialBusy, setSocialBusy] = useState<SocialBusy>(null);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const busy = emailBusy !== null || socialBusy !== null;

  const emailValid = isValidEmail(email);
  const passwordValid = isValidPassword(password);
  const showEmailError = emailTouched && !emailValid;
  const showPasswordError = passwordTouched && !passwordValid;

  const showApple = isAppleSignInAvailable();

  const guardSupabase = useCallback((): boolean => {
    if (!isSupabaseConfigured) {
      if (__DEV__) {
        console.warn(
          "[Kompanionki] Supabase env missing: set SUPABASE_URL and SUPABASE_ANON_KEY"
        );
      }
      Alert.alert(t("auth.envMissingTitle"), t("auth.envMissingBody"));
      return false;
    }
    return true;
  }, [t]);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(OTP_RESEND_SECONDS);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const handleEmailSubmit = useCallback(async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!emailValid || !passwordValid) return;
    if (!guardSupabase()) return;

    Keyboard.dismiss();
    setEmailBusy("email");
    try {
      if (mode === "register") {
        const trimmed = email.trim();
        const { needsConfirmation, emailTaken } = await signUpWithEmail(trimmed, password);
        if (emailTaken) {
          Alert.alert(t("auth.emailTakenTitle"), t("auth.emailTakenBody"), [
            { text: t("actions.confirm"), onPress: () => setSocialExpanded(true) },
          ]);
        } else if (needsConfirmation) {
          setOtpEmail(trimmed);
          setOtpCode("");
          setMode("awaitingOtp");
          startResendCooldown();
        }
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("auth.signInFailedTitle"), msg);
    } finally {
      setEmailBusy(null);
    }
  }, [email, emailValid, guardSupabase, mode, password, passwordValid, startResendCooldown, t]);

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length !== OTP_LENGTH) return;
    if (!guardSupabase()) return;
    Keyboard.dismiss();
    setEmailBusy("otpVerify");
    try {
      await verifySignupOtp(otpEmail, otpCode);
      // RootNavigator's onAuthStateChange will pick up the new session.
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("auth.emailOtpInvalidTitle"), msg);
    } finally {
      setEmailBusy(null);
    }
  }, [guardSupabase, otpCode, otpEmail, t]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;
    if (!guardSupabase()) return;
    setEmailBusy("otpResend");
    try {
      await resendSignupOtp(otpEmail);
      startResendCooldown();
      Alert.alert(
        t("auth.emailOtpResentTitle"),
        t("auth.emailOtpResentBody", { email: otpEmail })
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(t("auth.signInFailedTitle"), msg);
    } finally {
      setEmailBusy(null);
    }
  }, [guardSupabase, otpEmail, resendCooldown, startResendCooldown, t]);

  const handleBackFromOtp = useCallback(() => {
    setMode("register");
    setOtpCode("");
    setOtpEmail("");
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    setResendCooldown(0);
  }, []);

  const runSocial = useCallback(
    async (provider: Exclude<SocialBusy, null>, fn: () => Promise<void>) => {
      if (!guardSupabase()) return;
      setSocialBusy(provider);
      try {
        await fn();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        Alert.alert(t("auth.signInFailedTitle"), msg);
      } finally {
        setSocialBusy(null);
      }
    },
    [guardSupabase, t]
  );

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "register" ? "signIn" : "register"));
    setEmailTouched(false);
    setPasswordTouched(false);
  }, []);

  // ── OTP confirmation screen ────────────────────────────────────────────────
  if (mode === "awaitingOtp") {
    const codeReady = otpCode.length === OTP_LENGTH;
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={[typography.heading2, styles.title]}>
                {t("auth.emailOtpTitle")}
              </Text>
              <Text style={[typography.body, styles.subtitle]}>
                {t("auth.emailOtpSubtitle", { email: otpEmail })}
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otpCode}
                onChangeText={(v) => setOtpCode(v.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))}
                placeholder={t("auth.emailOtpPlaceholder")}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus
                maxLength={OTP_LENGTH}
                editable={!busy}
                returnKeyType="done"
                onSubmitEditing={handleVerifyOtp}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                (!codeReady || busy) && styles.btnDisabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={!codeReady || busy}
              accessibilityRole="button"
            >
              {emailBusy === "otpVerify" ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                  {t("auth.emailOtpVerifyBtn")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnOutline,
                (resendCooldown > 0 || busy) && styles.btnDisabled,
              ]}
              onPress={handleResendOtp}
              disabled={resendCooldown > 0 || busy}
              accessibilityRole="button"
            >
              {emailBusy === "otpResend" ? (
                <ActivityIndicator color={colors.textSecondary} />
              ) : (
                <Text style={styles.btnLabelOutline}>
                  {resendCooldown > 0
                    ? t("auth.emailOtpResendIn", { sec: resendCooldown })
                    : t("auth.emailOtpResendBtn")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchRow}
              onPress={handleBackFromOtp}
              disabled={busy}
            >
              <Text style={styles.switchText}>{t("auth.emailOtpBackBtn")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[typography.heading2, styles.title]}>
              {t("auth.emailTitle")}
            </Text>
            <Text style={[typography.body, styles.subtitle]}>
              {mode === "register"
                ? t("auth.emailRegisterSubtitle")
                : t("auth.emailSignInSubtitle")}
            </Text>
          </View>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t("auth.emailLabel")}</Text>
            <TextInput
              style={[styles.input, showEmailError && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              onBlur={() => setEmailTouched(true)}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!busy}
              returnKeyType="next"
            />
            {showEmailError && (
              <Text style={styles.errorText}>{t("errors.invalidEmail")}</Text>
            )}
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t("auth.passwordLabel")}</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  showPasswordError && styles.inputError,
                ]}
                value={password}
                onChangeText={setPassword}
                onBlur={() => setPasswordTouched(true)}
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                textContentType={mode === "register" ? "newPassword" : "password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                editable={!busy}
                returnKeyType="done"
                onSubmitEditing={handleEmailSubmit}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
              >
                <Text style={styles.eyeText}>
                  {showPassword ? t("auth.hide") : t("auth.show")}
                </Text>
              </TouchableOpacity>
            </View>
            {showPasswordError && (
              <Text style={styles.errorText}>{t("errors.passwordTooShort")}</Text>
            )}
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, busy && styles.btnDisabled]}
            onPress={handleEmailSubmit}
            disabled={busy}
            accessibilityRole="button"
          >
            {emailBusy ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                {mode === "register" ? t("auth.registerBtn") : t("auth.signInBtn")}
              </Text>
            )}
          </TouchableOpacity>

          {/* Mode switch */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={toggleMode}
            disabled={busy}
          >
            <Text style={styles.switchText}>
              {mode === "register"
                ? t("auth.switchToSignIn")
                : t("auth.switchToRegister")}
            </Text>
          </TouchableOpacity>

          {/* Social expand */}
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => setSocialExpanded((v) => !v)}
            disabled={busy}
            accessibilityRole="button"
          >
            <Text style={styles.btnLabelOutline}>{t("auth.socialExpand")}</Text>
          </TouchableOpacity>

          {/* Social buttons — revealed when expanded */}
          {socialExpanded && (
            <View style={styles.socialGroup}>
              {showApple ? (
                <TouchableOpacity
                  style={[styles.btn, styles.btnApple]}
                  disabled={busy}
                  onPress={() => runSocial("apple", signInWithApple)}
                  accessibilityRole="button"
                >
                  {socialBusy === "apple" ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                      {t("auth.continueApple")}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={[styles.btn, styles.btnMuted]} accessibilityElementsHidden>
                  <Text style={styles.btnLabelMuted}>{t("auth.continueApple")}</Text>
                  <Text style={styles.hintSmall}>{t("auth.appleIosOnly")}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, styles.btnGoogle]}
                disabled={busy}
                onPress={() => runSocial("google", signInWithGoogle)}
                accessibilityRole="button"
              >
                {socialBusy === "google" ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.btnLabel}>{t("auth.continueGoogle")}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnFacebook]}
                disabled={busy}
                onPress={() => runSocial("facebook", signInWithFacebook)}
                accessibilityRole="button"
              >
                {socialBusy === "facebook" ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                    {t("auth.continueFacebook")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  otpInput: {
    textAlign: "center",
    letterSpacing: 8,
    fontSize: 22,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 60,
  },
  eyeBtn: {
    position: "absolute",
    right: spacing.md,
    height: 52,
    justifyContent: "center",
  },
  eyeText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.secondary,
    marginTop: spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  btnLabelOutline: {
    ...typography.label,
    fontSize: 15,
    color: colors.textSecondary,
  },
  socialGroup: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btnApple: {
    backgroundColor: "#000000",
  },
  btnGoogle: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  btnFacebook: {
    backgroundColor: "#1877F2",
  },
  btnLabel: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
  },
  btnLabelOnDark: {
    color: colors.textInverse,
  },
  btnMuted: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
  btnLabelMuted: {
    ...typography.label,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
  },
  hintSmall: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  switchRow: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  switchText: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
});
