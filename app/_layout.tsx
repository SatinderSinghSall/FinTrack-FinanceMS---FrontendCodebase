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

import NetInfo from "@react-native-community/netinfo";
import NetworkErrorModal from "../src/components/NetworkErrorModal";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [updateInfo, setUpdateInfo] = useState<any>(null);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const [slowConnection, setSlowConnection] = useState(false);

  useEffect(() => {
    const run = async () => {
      const res = await checkAppUpdate();
      if (res) setUpdateInfo(res);
    };

    run();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;

      setShowNetworkModal(offline);

      if (!offline) {
        const slow =
          state.details &&
          "cellularGeneration" in state.details &&
          (state.details.cellularGeneration === "2g" ||
            state.details.cellularGeneration === "3g");

        setSlowConnection(!!slow);
      } else {
        setSlowConnection(false);
      }
    });

    return unsubscribe;
  }, []);

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
            <Stack.Screen name="(drawer)" />
          )}
        </Stack>

        <Toast />

        <NetworkErrorModal
          visible={showNetworkModal}
          isSlowConnection={slowConnection}
          onRetry={() => {}}
        />

        <UpdateModal
          visible={!!updateInfo}
          storeUrl={updateInfo?.playStoreUrl}
          force={updateInfo?.forceUpdate}
        />
      </>
    </GestureHandlerRootView>
  );
}
