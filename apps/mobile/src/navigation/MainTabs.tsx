import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import type { TabParamList } from "./types";
import DiscoverStack from "./stacks/DiscoverStack";
import GroupsStack from "./stacks/GroupsStack";
import MessagesStack from "./stacks/MessagesStack";
import EventsStack from "./stacks/EventsStack";
import ProfileStack from "./stacks/ProfileStack";
import { colors, typography } from "../theme";

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, string> = {
    discover: "🔍",
    groups: "👥",
    messages: "💬",
    events: "📅",
    profile: "👤",
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
        {iconMap[name]}
      </Text>
    </View>
  );
}

export default function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: typography.tabLabel,
        tabBarIcon: ({ focused }) => {
          const name = route.name.replace("Tab", "").toLowerCase();
          return <TabIcon name={name} focused={focused} />;
        },
      })}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStack}
        options={{ tabBarLabel: t("nav.discover") }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsStack}
        options={{ tabBarLabel: t("nav.groups") }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{ tabBarLabel: t("nav.messages") }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{ tabBarLabel: t("nav.events") }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: t("nav.profile") }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === "ios" ? 83 : 60,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 6,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  iconText: {
    fontSize: 22,
    opacity: 0.55,
  },
  iconTextFocused: {
    opacity: 1,
  },
});
