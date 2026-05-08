/**
 * Step 5: Avatar upload + submit profile
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { AuthScreenProps } from "../../navigation/types";
import { useCreateProfileMutation } from "../../api/client";
import { useAppDispatch } from "../../store";
import { setOnboardingCompleted } from "../../store/sessionSlice";
import { colors, typography, spacing, radius } from "../../theme";
import OnboardingProgress from "../../components/ui/OnboardingProgress";

export default function OnboardingStep5Screen({
  navigation,
}: AuthScreenProps<"OnboardingStep5">) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [createProfile, { isLoading }] = useCreateProfileMutation();

  const handleFinish = async () => {
    try {
      // In a full implementation this would gather state from all previous steps
      // via a shared onboarding context/store. For now we submit with minimal data.
      await createProfile({
        displayName: "Ім'я",
        birthYear: 1990,
        city: "Київ",
        lifeStage: "single",
        childrenStatus: "none",
        languages: ["Українська"],
        intents: ["friendship"],
      }).unwrap();

      dispatch(setOnboardingCompleted(true));
    } catch {
      Alert.alert("Помилка", t("errors.networkError"));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <OnboardingProgress step={5} total={5} />

        <Text style={styles.title}>{t("onboarding.step4Title")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.step4Subtitle")}</Text>

        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>📷</Text>
            </View>
          )}
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>
              {avatarUri ? "Замінити фото" : "Додати фото"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>
            Можна додати пізніше у профілі
          </Text>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Ваш профіль готовий!</Text>
          <Text style={styles.previewText}>
            Ви можете знайти своїх подруг та партнерок після верифікації.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{t("onboarding.back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>{t("onboarding.finish")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.heading2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  avatarContainer: { alignItems: "center", gap: spacing.md, marginTop: spacing.xl },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  avatarPlaceholderText: { fontSize: 40 },
  uploadButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  uploadButtonText: { ...typography.label, color: colors.secondary },
  uploadHint: { ...typography.caption, color: colors.textMuted },
  preview: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary + "18",
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  previewLabel: { ...typography.label, color: colors.text },
  previewText: { ...typography.body, color: colors.textSecondary },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  back: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  backText: { ...typography.body, color: colors.text, fontWeight: "600" },
  button: {
    flex: 2,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    fontSize: 17,
  },
});
