/**
 * Step 5: Avatar upload + submit profile
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import { handleError } from "@/utils/errorHandler";
import { useTranslation } from "react-i18next";
import type { OnboardingScreenProps } from "@/navigation/types";
import { useCreateProfileMutation } from "@/api/client";
import { useAppDispatch, useAppSelector } from "@/store";
import { setOnboardingCompleted } from "@/store/sessionSlice";
import { persistOnboardingCompleted } from "@/utils/onboardingStorage";
import { colors } from "@/theme";
import { styles } from "./OnboardingStep5Screen.styles";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

const OnboardingStep5Screen = ({
  navigation,
}: OnboardingScreenProps<"OnboardingStep5">) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.session.userId);
  const [avatarUri, _setAvatarUri] = useState<string | null>(null);
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

      if (userId) await persistOnboardingCompleted(userId);
      dispatch(setOnboardingCompleted(true));
    } catch (e) {
      handleError(e, { message: t("errors.profileCreateFailed") });
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
              <Text style={styles.avatarPlaceholderText}>{t("onboarding.addPhoto")}</Text>
            </View>
          )}
          <Pressable style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}>
            <Text style={styles.uploadButtonText}>
              {avatarUri ? t("onboarding.changePhoto") : t("onboarding.addPhoto")}
            </Text>
          </Pressable>
          <Text style={styles.uploadHint}>{t("onboarding.photoSkipHint")}</Text>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{t("onboarding.profileReadyTitle")}</Text>
          <Text style={styles.previewText}>{t("onboarding.profileReadyBody")}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>{t("onboarding.back")}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.button, isLoading && styles.buttonDisabled, pressed && styles.pressed]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>{t("onboarding.finish")}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default OnboardingStep5Screen;
