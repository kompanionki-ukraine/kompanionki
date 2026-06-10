import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { MessagesStackParamList } from "@/navigation/types";
import ConversationListScreen from "@/screens/main/ConversationListScreen";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<MessagesStackParamList>();

const MessagesStack = () => {
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
        name="ConversationList"
        component={ConversationListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MessagesStack;
