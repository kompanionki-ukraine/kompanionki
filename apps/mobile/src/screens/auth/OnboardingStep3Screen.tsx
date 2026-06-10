/**
 * Step 3: Intents (what you're looking for) — multi-select
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
import type { Intent } from "@kompanionki/shared";
import { colors, intentColors } from "@/theme";
import { styles } from "./OnboardingStep3Screen.styles";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

type IntentOption = { id: Intent; emoji: string };

const INTENT_OPTIONS: IntentOption[] = [
  { id: "friendship", emoji: "💛" },
  { id: "co_living", emoji: "🏠" },
  { id: "co_parenting", emoji: "👶" },
  { id: "co_business", emoji: "💼" },
  { id: "mentorship", emoji: "🎓" },
  { id: "support", emoji: "🤝" },
];

const OnboardingStep3Screen = ({
  navigation,
}: AuthScreenProps<"OnboardingStep3">) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Intent[]>([]);

  const toggle = (intent: Intent) => {
    setSelected((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <OnboardingProgress step={3} total={5} />

        <Text style={styles.title}>{t("onboarding.step2Title")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.step2Subtitle")}</Text>

        <View style={styles.grid}>
          {INTENT_OPTIONS.map(({ id, emoji }) => {
            const isSelected = selected.includes(id);
            const color = intentColors[id] ?? colors.primary;
            return (
              <Pressable
                key={id}
                style={({ pressed }) => [styles.card, isSelected && { borderColor: color }, pressed && styles.pressed]}
                onPress={() => toggle(id)}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isSelected && { backgroundColor: color + "22" },
                  ]}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </View>
                <Text style={[styles.cardTitle, isSelected && { color }]}>
                  {t(`intents.${id}`)}
                </Text>
                <Text style={styles.cardDesc}>{t(`intents.${id}_desc`)}</Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: color }]}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
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
          style={({ pressed }) => [styles.button, selected.length === 0 && styles.buttonDisabled, pressed && styles.pressed]}
          onPress={() => selected.length > 0 && navigation.navigate("OnboardingStep4")}
          disabled={selected.length === 0}
        >
          <Text style={styles.buttonText}>{t("onboarding.next")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default OnboardingStep3Screen;
