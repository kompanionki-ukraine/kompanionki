import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLanguage } from "@/store/sessionSlice";
import { persistLanguage } from "@/utils/language";
import i18n from "@/i18n";
import { styles } from "./LanguageSwitcher.styles";

interface Props {
  compact?: boolean;
}

const LanguageSwitcher = ({ compact }: Props) => {
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.session.languagePref);

  const handlePress = async (lang: "uk" | "en") => {
    if (lang === current) return;
    await i18n.changeLanguage(lang);
    await persistLanguage(lang);
    dispatch(setLanguage(lang));
  };

  const pillH = compact ? 28 : 32;
  const textStyle = compact ? styles.labelSmall : styles.label;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.pill, styles.pillLeft, { height: pillH }, current === "uk" && styles.pillActive, pressed && styles.pressed]}
        onPress={() => handlePress("uk")}
      >
        <Text style={[textStyle, current === "uk" ? styles.textActive : styles.textInactive]}>
          УКР
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.pill, styles.pillRight, { height: pillH }, current === "en" && styles.pillActive, pressed && styles.pressed]}
        onPress={() => handlePress("en")}
      >
        <Text style={[textStyle, current === "en" ? styles.textActive : styles.textInactive]}>
          ENG
        </Text>
      </Pressable>
    </View>
  );
}

export default LanguageSwitcher;
