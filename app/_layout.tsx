import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../src/store/auth.store";

import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useEffect, useState } from "react";
import UpdateModal from "../src/components/UpdateModal";
import { checkAppUpdate } from "../src/utils/checkAppUpdate";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [updateInfo, setUpdateInfo] = useState<any>(null);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // ✅ Hooks must always run
  useEffect(() => {
    const run = async () => {
      const res = await checkAppUpdate();
      if (res) setUpdateInfo(res);
    };

    run();
  }, []);

  // ✅ Now it's safe
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </>
          ) : (
            <Stack.Screen name="(tabs)" />
          )}
        </Stack>

        <Toast />

        <UpdateModal
          visible={!!updateInfo}
          storeUrl={updateInfo?.playStoreUrl}
          force={updateInfo?.forceUpdate}
        />
      </>
    </GestureHandlerRootView>
  );
}
