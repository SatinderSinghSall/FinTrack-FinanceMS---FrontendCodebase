import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../src/store/auth.store";

import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { useEffect, useState } from "react";
import UpdateModal from "../src/components/UpdateModal";
import MaintenanceModal from "../src/components/MaintenanceModal";
import { checkAppUpdate } from "../src/utils/checkAppUpdate";
import {
  checkMaintenance,
  type MaintenanceInfo,
} from "../src/utils/maintenance";

import NetInfo from "@react-native-community/netinfo";
import NetworkErrorModal from "../src/components/NetworkErrorModal";

type UpdateInfo = {
  latestVersion: string;
  minSupportedVersion: string;
  forceUpdate: boolean;
  playStoreUrl: string;
  updateMessage?: string;
};

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const [maintenance, setMaintenance] = useState<MaintenanceInfo | null>(null);

  const [showMaintenance, setShowMaintenance] = useState(false);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);

  /**
   * Check Maintenance Mode on app startup.
   *
   * Maintenance is checked first because it has priority
   * over the normal update flow.
   */
  useEffect(() => {
    const runStartupChecks = async () => {
      const maintenanceResult = await checkMaintenance();

      if (maintenanceResult) {
        setMaintenance(maintenanceResult);
        setShowMaintenance(true);
      }
    };

    runStartupChecks();
  }, []);

  /**
   * Network monitoring.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || state.isInternetReachable === false;

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

  /**
   * Check app update after maintenance has been checked.
   *
   * We intentionally do not run this while maintenance access
   * is restricted.
   */
  useEffect(() => {
    const run = async () => {
      if (maintenance && !maintenance.allowUserAccess) {
        return;
      }

      const res = await checkAppUpdate();

      if (res) {
        setUpdateInfo(res);
      }
    };

    run();
  }, [maintenance]);

  if (!fontsLoaded) {
    return null;
  }

  const maintenanceBlocksAccess = !!maintenance && !maintenance.allowUserAccess;

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

        <MaintenanceModal
          visible={showMaintenance}
          maintenance={maintenance}
          onClose={() => {
            if (!maintenanceBlocksAccess) {
              setShowMaintenance(false);
            }
          }}
        />

        <UpdateModal
          visible={!!updateInfo && !maintenanceBlocksAccess && !showMaintenance}
          storeUrl={updateInfo?.playStoreUrl ?? ""}
          force={updateInfo?.forceUpdate ?? false}
          updateMessage={updateInfo?.updateMessage}
          onClose={() => setUpdateInfo(null)}
        />
      </>
    </GestureHandlerRootView>
  );
}
