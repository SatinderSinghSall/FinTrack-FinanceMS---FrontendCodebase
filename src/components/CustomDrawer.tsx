import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/src/store/auth.store";

export default function CustomDrawer(props: any) {
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    const doLogout = () => {
      logout();
      Toast.show({ type: "success", text1: "Logged out" });
      setTimeout(() => {
        router.replace("/landing");
      }, 300);
    };

    if (Platform.OS === "web") {
      if (window.confirm("Logout?")) doLogout();
    } else {
      Alert.alert("Logout", "Logout from your account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout },
      ]);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 bg-white px-6 pt-16 pb-6">
        {/* HEADER */}
        <View className="mb-12">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Ionicons name="person" size={22} color="#374151" />
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  Hello,
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {user?.name}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MENU */}
        <View className="space-y-1">
          <DrawerItem
            label="Dashboard"
            icon="home-outline"
            route="(tabs)/dashboard"
            active={pathname.includes("dashboard")}
            {...props}
          />

          <DrawerItem
            label="Transactions"
            icon="swap-horizontal-outline"
            route="(tabs)/transactions"
            active={pathname.includes("transactions")}
            {...props}
          />

          <DrawerItem
            label="Expense"
            icon="cash-outline"
            route="(tabs)/expenses"
            active={pathname.includes("expenses")}
            {...props}
          />

          <DrawerItem
            label="Income"
            icon="receipt-outline"
            route="(tabs)/income"
            active={pathname.includes("income")}
            {...props}
          />

          <DrawerItem
            label="Budgets"
            icon="wallet-outline"
            route="(tabs)/budgets"
            active={pathname.includes("budgets")}
            {...props}
          />

          <DrawerItem
            label="Analytics"
            icon="bar-chart-outline"
            route="(tabs)/analytics"
            active={pathname.includes("analytics")}
            {...props}
          />

          <DrawerItem
            label="Settings"
            icon="settings-outline"
            route="settings"
            active={pathname.includes("settings")}
            {...props}
          />
        </View>

        {/* FOOTER */}
        <View className="mt-auto pt-10">
          {/* SEPARATOR */}
          <View className="h-px bg-gray-200 mb-6" />

          <Text className="text-l text-gray-400 text-center mb-6">
            v{Constants.expoConfig?.version} • build{" "}
            {Platform.OS === "android"
              ? Constants.expoConfig?.android?.versionCode
              : Constants.expoConfig?.ios?.buildNumber}
          </Text>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="bg-red-50 border border-red-100 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="ml-2 text-base text-red-500 font-semibold">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerItem({ label, icon, route, active, ...props }: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/${route}`);
        props.navigation.closeDrawer();
      }}
      activeOpacity={0.7}
      className={`flex-row items-center py-4 px-2 rounded-xl ${
        active ? "bg-gray-100" : ""
      }`}
    >
      <Ionicons name={icon} size={22} color={active ? "#111827" : "#9ca3af"} />

      <Text
        className={`ml-4 text-base ${
          active ? "text-gray-900 font-semibold" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
