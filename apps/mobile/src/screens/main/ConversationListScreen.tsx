import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { MessagesScreenProps } from "@/navigation/types";
import { styles } from "./ConversationListScreen.styles";

const ConversationListScreen = (
  _props: MessagesScreenProps<"ConversationList">
) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("nav.messages")}</Text>
    </View>
  );
}

export default ConversationListScreen;
