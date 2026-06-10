/**
 * Step 4: Bio + values tags
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
import type { AuthScreenProps } from "@/navigation/types";
import { colors } from "@/theme";
import { styles } from "./OnboardingStep4Screen.styles";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

const VALUES_TAGS = [
  "сім'я", "кар'єра", "здоров'я", "природа", "подорожі", "творчість",
  "освіта", "спорт", "мистецтво", "технології", "духовність", "волонтерство",
];

const OnboardingStep4Screen = ({
  navigation,
}: AuthScreenProps<"OnboardingStep4">) => {
  const { t } = useTranslation();
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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
          <OnboardingProgress step={4} total={5} />

          <Text style={styles.title}>{t("onboarding.step3Title")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.step3Subtitle")}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t("onboarding.bio")}</Text>
            <TextInput
              style={styles.textarea}
              value={bio}
              onChangeText={setBio}
              placeholder={t("onboarding.bioPlaceholder")}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          <Text style={styles.label}>{t("profile.values")}</Text>
          <View style={styles.tagsWrap}>
            {VALUES_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={({ pressed }) => [styles.tag, isSelected && styles.tagSelected, pressed && styles.pressed]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>{t("onboarding.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => navigation.navigate("OnboardingStep5")}
          >
            <Text style={styles.buttonText}>{t("onboarding.next")}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default OnboardingStep4Screen;
