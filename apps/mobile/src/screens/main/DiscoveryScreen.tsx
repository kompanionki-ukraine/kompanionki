import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { DiscoverScreenProps } from "@/navigation/types";
import { styles } from "./DiscoveryScreen.styles";

const DiscoveryScreen = (_props: DiscoverScreenProps<"Discovery">) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("nav.discover")}</Text>
    </View>
  );
}

export default DiscoveryScreen;
