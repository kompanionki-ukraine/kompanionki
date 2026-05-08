import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { EventsStackParamList } from "../types";
import EventsListScreen from "../../screens/main/EventsListScreen";
import { colors } from "../../theme";

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerBackTitle: "",
      }}
    >
      <Stack.Screen name="EventsList" component={EventsListScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
