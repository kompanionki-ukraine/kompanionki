import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import type { TabParamList } from "./types";
import DiscoverStack from "./stacks/DiscoverStack";
import GroupsStack from "./stacks/GroupsStack";
import MessagesStack from "./stacks/MessagesStack";
import EventsStack from "./stacks/EventsStack";
import ProfileStack from "./stacks/ProfileStack";
import { colors, typography } from "@/theme";
import { styles } from "./MainTabs.styles";

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

// Stable references — defined at module scope so React Navigation never sees
// a new component type on re-renders of MainTabs.
const discoverIcon = ({ focused }: { focused: boolean }) => <TabIcon name="discover" focused={focused} />;
const groupsIcon = ({ focused }: { focused: boolean }) => <TabIcon name="groups" focused={focused} />;
const messagesIcon = ({ focused }: { focused: boolean }) => <TabIcon name="messages" focused={focused} />;
const eventsIcon = ({ focused }: { focused: boolean }) => <TabIcon name="events" focused={focused} />;
const profileIcon = ({ focused }: { focused: boolean }) => <TabIcon name="profile" focused={focused} />;

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: typography.tabLabel,
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStack}
        options={{ tabBarLabel: t("nav.discover"), tabBarIcon: discoverIcon }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsStack}
        options={{ tabBarLabel: t("nav.groups"), tabBarIcon: groupsIcon }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{ tabBarLabel: t("nav.messages"), tabBarIcon: messagesIcon }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{ tabBarLabel: t("nav.events"), tabBarIcon: eventsIcon }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: t("nav.profile"), tabBarIcon: profileIcon }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
