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

  /* 🔥 LOGOUT */
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
      {/* 🔥 MAIN WRAPPER */}
      <View className="flex-1 justify-between bg-white">
        {/* 🔝 TOP SECTION */}
        <View>
          {/* 💎 HEADER */}
          <View className="px-5 pt-12 pb-6 bg-blue-600 rounded-b-3xl">
            {/* Avatar + Name */}
            <View className="flex-row items-center mb-3">
              <View className="bg-white/20 w-14 h-14 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={26} color="#fff" />
              </View>

              <Text className="text-white font-semibold text-base">
                {userName}
              </Text>
            </View>

            {/* ✅ EMAIL (FULL WIDTH NO CUT EVER) */}
            <Text className="text-white/90 text-xs">{email}</Text>
          </View>

          {/* 🔥 MENU */}
          <View className="px-3 mt-6 space-y-2">
            <DrawerItem
              label="Dashboard"
              icon="home-outline"
              route="(tabs)"
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
              active={pathname.includes("budgets")}
              {...props}
            />

            <DrawerItem
              label="Income"
              icon="receipt-outline"
              route="(tabs)/income"
              active={pathname.includes("budgets")}
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

        {/* 🔻 FOOTER */}
        <View className="px-5 pb-6">
          <Text className="text-xs text-gray-400 text-center mb-4">
            Version {Constants.expoConfig?.version}
          </Text>

          {/* 🔥 LOGOUT BUTTON */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-4 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

/* ---------- PREMIUM ITEM ---------- */

function DrawerItem({ label, icon, route, active, ...props }: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/${route}`);
        props.navigation.closeDrawer();
      }}
      className={`flex-row items-center px-4 py-3 rounded-2xl ${
        active ? "bg-blue-50" : "active:bg-gray-100"
      }`}
    >
      <Ionicons name={icon} size={20} color={active ? "#2563eb" : "#374151"} />

      <Text
        className={`ml-3 text-sm font-medium ${
          active ? "text-blue-600" : "text-gray-800"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
