import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "./types";
import OnboardingStep1Screen from "@/screens/auth/OnboardingStep1Screen";
import OnboardingStep2Screen from "@/screens/auth/OnboardingStep2Screen";
import OnboardingStep3Screen from "@/screens/auth/OnboardingStep3Screen";
import OnboardingStep4Screen from "@/screens/auth/OnboardingStep4Screen";
import OnboardingStep5Screen from "@/screens/auth/OnboardingStep5Screen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />
      <Stack.Screen name="OnboardingStep4" component={OnboardingStep4Screen} />
      <Stack.Screen name="OnboardingStep5" component={OnboardingStep5Screen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
