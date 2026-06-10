import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { GroupsScreenProps } from "@/navigation/types";
import { styles } from "./GroupsListScreen.styles";

const GroupsListScreen = (_props: GroupsScreenProps<"GroupsList">) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("nav.groups")}</Text>
    </View>
  );
}

export default GroupsListScreen;
