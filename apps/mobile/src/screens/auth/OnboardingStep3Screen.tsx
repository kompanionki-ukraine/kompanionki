/**
 * Step 3: Intents (what you're looking for) — multi-select
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
import type { Intent } from "@kompanionki/shared";
import { colors, typography, spacing, radius, intentColors } from "../../theme";
import OnboardingProgress from "../../components/ui/OnboardingProgress";

type IntentOption = { id: Intent; emoji: string };

const INTENT_OPTIONS: IntentOption[] = [
  { id: "friendship", emoji: "💛" },
  { id: "co_living", emoji: "🏠" },
  { id: "co_parenting", emoji: "👶" },
  { id: "co_business", emoji: "💼" },
  { id: "mentorship", emoji: "🎓" },
  { id: "support", emoji: "🤝" },
];

export default function OnboardingStep3Screen({
  navigation,
}: AuthScreenProps<"OnboardingStep3">) {
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
              <TouchableOpacity
                key={id}
                style={[styles.card, isSelected && { borderColor: color }]}
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
          style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
          onPress={() => selected.length > 0 && navigation.navigate("OnboardingStep4")}
          disabled={selected.length === 0}
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
  subtitle: { ...typography.body, color: colors.textSecondary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    width: "47%",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    position: "relative",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  cardTitle: { ...typography.label, color: colors.text, marginTop: spacing.xs },
  cardDesc: { ...typography.caption, color: colors.textSecondary, lineHeight: 16 },
  checkBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { color: "#fff", fontSize: 12, fontWeight: "700" },
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
