import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppDispatch } from "../store";
import { setDevFlagsHydrated } from "../store/devFlagsSlice";
import MainTabs from "./MainTabs";
import SplashScreen from "../screens/SplashScreen";

type RootParamList = {
  Splash: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        dispatch(setDevFlagsHydrated(true));
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, [dispatch]);

  if (isBootstrapping) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="App" component={MainTabs} />
    </Stack.Navigator>
  );
}
