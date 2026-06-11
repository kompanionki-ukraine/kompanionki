/**
 * Step 1: Basic info — name, birth year, city, occupation
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { OnboardingScreenProps } from "@/navigation/types";
import { colors } from "@/theme";
import { styles } from "./OnboardingStep1Screen.styles";
import OnboardingProgress from "@/components/ui/OnboardingProgress";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type FormData = {
  displayName: string;
  birthYear: string;
  city: string;
  occupation: string;
};

const OnboardingStep1Screen = ({
  navigation,
}: OnboardingScreenProps<"OnboardingStep1">) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormData>({
    displayName: "",
    birthYear: "",
    city: "",
    occupation: "",
  });

  const isValid =
    form.displayName.trim().length >= 2 &&
    /^\d{4}$/.test(form.birthYear) &&
    parseInt(form.birthYear) >= 1940 &&
    parseInt(form.birthYear) <= new Date().getFullYear() - 18 &&
    form.city.trim().length >= 2;

  const handleNext = () => {
    if (!isValid) return;
    navigation.navigate("OnboardingStep2");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <OnboardingProgress step={1} total={5} />
            </View>
            <LanguageSwitcher compact />
          </View>

          <Text style={styles.title}>{t("onboarding.step1Title")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.step1Subtitle")}</Text>

          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("onboarding.name")} *</Text>
              <TextInput
                style={styles.input}
                value={form.displayName}
                onChangeText={(v) => setForm((f) => ({ ...f, displayName: v }))}
                placeholder={t("onboarding.namePlaceholder")}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                maxLength={60}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t("onboarding.birthYear")} *</Text>
              <TextInput
                style={styles.input}
                value={form.birthYear}
                onChangeText={(v) => setForm((f) => ({ ...f, birthYear: v }))}
                placeholder="1985"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t("onboarding.city")} *</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
                placeholder={t("onboarding.cityPlaceholder")}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t("onboarding.occupation")}</Text>
              <TextInput
                style={styles.input}
                value={form.occupation}
                onChangeText={(v) => setForm((f) => ({ ...f, occupation: v }))}
                placeholder={t("onboarding.occupationPlaceholder")}
                placeholderTextColor={colors.textMuted}
                maxLength={100}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.button, !isValid && styles.buttonDisabled, pressed && styles.pressed]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>{t("onboarding.next")}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default OnboardingStep1Screen;
