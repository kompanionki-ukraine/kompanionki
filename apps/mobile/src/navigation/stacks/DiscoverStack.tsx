import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { DiscoverStackParamList } from "../types";
import DiscoveryScreen from "../../screens/main/DiscoveryScreen";
import { colors } from "../../theme";

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="Discovery"
        component={DiscoveryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
