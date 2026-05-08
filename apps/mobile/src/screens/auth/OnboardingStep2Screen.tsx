/**
 * Step 2: Life stage + children status
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { AuthScreenProps } from "../../navigation/types";
import type { LifeStage, ChildrenStatus } from "@kompanionki/shared";
import { colors, typography, spacing, radius } from "../../theme";
import OnboardingProgress from "../../components/ui/OnboardingProgress";

const LIFE_STAGES: LifeStage[] = [
  "single",
  "single_mother",
  "partnered",
  "divorced",
  "widowed",
  "other",
];

const CHILDREN_STATUSES: ChildrenStatus[] = [
  "none",
  "have",
  "planning",
  "prefer_not_say",
];

export default function OnboardingStep2Screen({
  navigation,
}: AuthScreenProps<"OnboardingStep2">) {
  const { t } = useTranslation();
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null);
  const [childrenStatus, setChildrenStatus] = useState<ChildrenStatus | null>(null);

  const isValid = !!lifeStage && !!childrenStatus;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <OnboardingProgress step={2} total={5} />

        <Text style={styles.title}>{t("onboarding.step1Title")}</Text>

        <Text style={styles.sectionLabel}>{t("onboarding.lifeStage")} *</Text>
        <View style={styles.optionsGrid}>
          {LIFE_STAGES.map((ls) => (
            <TouchableOpacity
              key={ls}
              style={[
                styles.option,
                lifeStage === ls && styles.optionSelected,
              ]}
              onPress={() => setLifeStage(ls)}
            >
              <Text
                style={[
                  styles.optionText,
                  lifeStage === ls && styles.optionTextSelected,
                ]}
              >
                {t(`lifeStages.${ls}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t("onboarding.childrenStatus")} *</Text>
        <View style={styles.optionsCol}>
          {CHILDREN_STATUSES.map((cs) => (
            <TouchableOpacity
              key={cs}
              style={[
                styles.optionRow,
                childrenStatus === cs && styles.optionRowSelected,
              ]}
              onPress={() => setChildrenStatus(cs)}
            >
              <View
                style={[
                  styles.radio,
                  childrenStatus === cs && styles.radioSelected,
                ]}
              />
              <Text style={styles.optionText}>{t(`childrenStatuses.${cs}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{t("onboarding.back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={() => isValid && navigation.navigate("OnboardingStep3")}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>{t("onboarding.next")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { ...typography.heading2, color: colors.text },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight + "33",
  },
  optionText: { ...typography.label, color: colors.text },
  optionTextSelected: { color: colors.secondary },
  optionsCol: { gap: spacing.sm },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionRowSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight + "22",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: { borderColor: colors.secondary, backgroundColor: colors.secondary },
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
