import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { handleError } from "@/utils/errorHandler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors, typography } from "@/theme";
import { styles } from "./SocialRegistrationScreen.styles";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  isAppleSignInAvailable,
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from "@/auth/socialSignIn";
import { useAppSelector } from "@/store";
import {
  resendSignupOtp,
  signInWithEmail,
  signUpWithEmail,
  verifySignupOtp,
} from "@/auth/emailAuth";
import type { EmailBusy, SocialBusy, SocialRegistrationMode } from "@/types/auth";
import { isValidEmail, isValidPassword } from "@/utils/validation";

const OTP_RESEND_SECONDS = 60;
const OTP_LENGTH = 6;

const SocialRegistrationScreen = (): React.JSX.Element => {
  const { t } = useTranslation();

  const [mode, setMode] = useState<SocialRegistrationMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  const enableAppleIDSignIn = useAppSelector((s) => s.devFlags.flags.enableAppleIDSignIn);
  const enableFacebookSignIn = useAppSelector((s) => s.devFlags.flags.enableFacebookSignIn);

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
            { text: t("actions.confirm") },
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
      handleError(e, { title: t("auth.signInFailedTitle") });
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
      handleError(e, { title: t("auth.emailOtpInvalidTitle") });
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
      handleError(e, { title: t("auth.signInFailedTitle") });
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
        handleError(e, { title: t("auth.signInFailedTitle") });
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

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                (!codeReady || busy) && styles.btnDisabled,
                pressed && styles.pressed,
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
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnOutline,
                (resendCooldown > 0 || busy) && styles.btnDisabled,
                pressed && styles.pressed,
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
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.switchRow, pressed && styles.pressed]}
              onPress={handleBackFromOtp}
              disabled={busy}
            >
              <Text style={styles.switchText}>{t("auth.emailOtpBackBtn")}</Text>
            </Pressable>
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
          {/* Page title */}
          <View style={styles.header}>
            <Text style={[typography.heading2, styles.title]}>
              {mode === "register" ? t("auth.registerTitle") : t("auth.emailTitle")}
            </Text>
          </View>

          {/* Section 1 — email auth */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {mode === "register"
                ? t("auth.emailRegisterSubtitle")
                : t("auth.emailSignInSubtitle")}
            </Text>

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
                <Pressable
                  style={({ pressed }) => [styles.eyeBtn, pressed && styles.pressed]}
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityLabel={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? t("auth.hide") : t("auth.show")}
                  </Text>
                </Pressable>
              </View>
              {showPasswordError && (
                <Text style={styles.errorText}>{t("errors.passwordTooShort")}</Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnPrimary, busy && styles.btnDisabled, pressed && styles.pressed]}
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
            </Pressable>
          </View>

          {/* Section 2 — social auth */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {mode === "register" ? t("auth.socialExpand") : t("auth.socialSectionSignIn")}
            </Text>

            <View style={styles.socialGroup}>
              {enableAppleIDSignIn && (
                showApple ? (
                  <Pressable
                    style={({ pressed }) => [styles.btn, styles.btnApple, pressed && styles.pressed]}
                    disabled={busy}
                    onPress={() => runSocial("apple", signInWithApple)}
                    accessibilityRole="button"
                  >
                    {socialBusy === "apple" ? (
                      <ActivityIndicator color={colors.textInverse} />
                    ) : (
                      <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                        {mode === "register" ? t("auth.continueApple") : t("auth.signInApple")}
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <View style={[styles.btn, styles.btnMuted]} accessibilityElementsHidden>
                    <Text style={styles.btnLabelMuted}>
                      {mode === "register" ? t("auth.continueApple") : t("auth.signInApple")}
                    </Text>
                    <Text style={styles.hintSmall}>{t("auth.appleIosOnly")}</Text>
                  </View>
                )
              )}

              <Pressable
                style={({ pressed }) => [styles.btn, styles.btnGoogle, pressed && styles.pressed]}
                disabled={busy}
                onPress={() => runSocial("google", signInWithGoogle)}
                accessibilityRole="button"
              >
                {socialBusy === "google" ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.btnLabel}>
                    {mode === "register" ? t("auth.continueGoogle") : t("auth.signInGoogle")}
                  </Text>
                )}
              </Pressable>

              {enableFacebookSignIn && (
                <Pressable
                  style={({ pressed }) => [styles.btn, styles.btnFacebook, pressed && styles.pressed]}
                  disabled={busy}
                  onPress={() => runSocial("facebook", signInWithFacebook)}
                  accessibilityRole="button"
                >
                  {socialBusy === "facebook" ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={[styles.btnLabel, styles.btnLabelOnDark]}>
                      {mode === "register" ? t("auth.continueFacebook") : t("auth.signInFacebook")}
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {/* Mode switch */}
          <Pressable
            style={({ pressed }) => [styles.switchRow, pressed && styles.pressed]}
            onPress={toggleMode}
            disabled={busy}
          >
            <Text style={styles.switchText}>
              {mode === "register"
                ? t("auth.switchToSignIn")
                : t("auth.switchToRegister")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default SocialRegistrationScreen;
