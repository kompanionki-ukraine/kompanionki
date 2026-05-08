/**
 * Step 4: Bio + values tags
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { AuthScreenProps } from "../../navigation/types";
import { colors, typography, spacing, radius } from "../../theme";
import OnboardingProgress from "../../components/ui/OnboardingProgress";

const VALUES_TAGS = [
  "сім'я", "кар'єра", "здоров'я", "природа", "подорожі", "творчість",
  "освіта", "спорт", "мистецтво", "технології", "духовність", "волонтерство",
];

export default function OnboardingStep4Screen({
  navigation,
}: AuthScreenProps<"OnboardingStep4">) {
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
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{t("onboarding.back")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("OnboardingStep5")}
          >
            <Text style={styles.buttonText}>{t("onboarding.next")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { ...typography.heading2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 100,
  },
  charCount: { ...typography.caption, color: colors.textMuted, textAlign: "right" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  tagText: { ...typography.label, color: colors.text },
  tagTextSelected: { color: colors.primary },
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
  buttonText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    fontSize: 17,
  },
});
