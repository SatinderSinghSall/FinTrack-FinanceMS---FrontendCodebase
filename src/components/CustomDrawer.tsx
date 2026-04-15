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

  const userName = user?.name || "User";
  const email = user?.email || "No email";

  /* LOGOUT */
  const handleLogout = () => {
    const doLogout = () => {
      logout();

      Toast.show({
        type: "success",
        text1: "Logged out",
      });

      setTimeout(() => {
        router.replace("/landing");
      }, 300);
    };

    if (Platform.OS === "web") {
      if (window.confirm("Logout from your account?")) doLogout();
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
      <View className="flex-1 justify-between bg-gray-50">
        {/* TOP SECTION */}
        <View>
          {/* HEADER */}
          <View className="px-6 pt-16 pb-10 bg-blue-600 rounded-b-[40px]">
            <View className="flex-row items-center">
              {/* Avatar */}
              <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-4">
                <Ionicons name="person" size={26} color="#fff" />
              </View>

              {/* User Info */}
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">
                  {userName}
                </Text>

                <Text numberOfLines={1} className="text-white/80 text-sm mt-1">
                  {email}
                </Text>
              </View>
            </View>
          </View>

          {/* MENU */}
          <View className="px-4 mt-7">
            <DrawerItem
              label="Dashboard"
              icon="home-outline"
              route="(tabs)/dashboard"
              active={pathname === "/"}
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
        </View>

        {/* FOOTER */}
        <View className="px-5 pb-7">
          <Text className="text-xs text-gray-400 text-center mb-4">
            Version {Constants.expoConfig?.version}
          </Text>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />

            <Text className="text-white font-semibold ml-2 text-sm">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

/* PREMIUM MENU ITEM */

function DrawerItem({ label, icon, route, active, ...props }: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/${route}`);
        props.navigation.closeDrawer();
      }}
      className={`flex-row items-center px-4 py-3 rounded-2xl mb-2 ${
        active ? "bg-blue-50" : "active:bg-gray-100"
      }`}
    >
      {/* ACTIVE INDICATOR */}
      {active && (
        <View className="absolute left-0 h-6 w-1 bg-blue-600 rounded-r-full" />
      )}

      {/* ICON CONTAINER */}
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center ${
          active ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        <Ionicons
          name={icon}
          size={18}
          color={active ? "#2563eb" : "#6b7280"}
        />
      </View>

      {/* LABEL */}
      <Text
        className={`ml-3 text-sm font-semibold ${
          active ? "text-blue-600" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
