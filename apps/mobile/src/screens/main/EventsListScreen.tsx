import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { EventsScreenProps } from "@/navigation/types";
import { styles } from "./EventsListScreen.styles";

const EventsListScreen = (_props: EventsScreenProps<"EventsList">) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("nav.events")}</Text>
    </View>
  );
}

export default EventsListScreen;
