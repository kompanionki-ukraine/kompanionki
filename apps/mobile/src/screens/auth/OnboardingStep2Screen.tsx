/**
 * Step 2: Life stage + children status
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { AuthScreenProps } from "@/navigation/types";
import type { LifeStage, ChildrenStatus } from "@kompanionki/shared";
import { styles } from "./OnboardingStep2Screen.styles";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

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

const OnboardingStep2Screen = ({
  navigation,
}: AuthScreenProps<"OnboardingStep2">) => {
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
            <Pressable
              key={ls}
              style={({ pressed }) => [
                styles.option,
                lifeStage === ls && styles.optionSelected,
                pressed && styles.pressed,
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
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t("onboarding.childrenStatus")} *</Text>
        <View style={styles.optionsCol}>
          {CHILDREN_STATUSES.map((cs) => (
            <Pressable
              key={cs}
              style={({ pressed }) => [
                styles.optionRow,
                childrenStatus === cs && styles.optionRowSelected,
                pressed && styles.pressed,
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
            </Pressable>
          ))}
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
          style={({ pressed }) => [styles.button, !isValid && styles.buttonDisabled, pressed && styles.pressed]}
          onPress={() => isValid && navigation.navigate("OnboardingStep3")}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>{t("onboarding.next")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default OnboardingStep2Screen;
