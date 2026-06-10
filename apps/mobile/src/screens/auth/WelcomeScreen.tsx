import React from "react";
import { View, Text, Pressable, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { AuthScreenProps } from "@/navigation/types";
import Logo from "@/components/ui/Logo";
import { colors } from "@/theme";
import { styles } from "./WelcomeScreen.styles";

const WelcomeScreen = ({ navigation }: AuthScreenProps<"Welcome">) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.hero}>
          <Logo size={140} style={styles.logo} />
          <Text style={styles.title}>{t("appName")}</Text>
          <Text style={styles.tagline}>{t("tagline")}</Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={() => navigation.navigate("PhoneInput")}
          >
            <Text style={styles.primaryButtonText}>{t("onboarding.getStarted")}</Text>
          </Pressable>
          <Text style={styles.disclaimer}>
            {`Тільки для жінок \u2022 Без реклами \u2022 Без романтики`}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default WelcomeScreen;
