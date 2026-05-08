import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { GroupsStackParamList } from "../types";
import GroupsListScreen from "../../screens/main/GroupsListScreen";
import { colors } from "../../theme";

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export default function GroupsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerBackTitle: "",
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsListScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
