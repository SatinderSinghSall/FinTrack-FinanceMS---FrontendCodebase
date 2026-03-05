import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../src/store/auth.store";
import CustomSplash from "../src/screens/SplashScreen";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await restoreSession();

      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/landing");
      }

      setReady(true);
      await SplashScreen.hideAsync();
    };

    init();
  }, []);

  if (!ready) {
    return <CustomSplash />;
  }

  return <View />;
}
