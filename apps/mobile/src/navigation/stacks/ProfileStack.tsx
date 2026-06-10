import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";
import MyProfileScreen from "@/screens/main/MyProfileScreen";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerBackTitle: "",
      }}
    >
      <Stack.Screen name="MyProfile" component={MyProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
