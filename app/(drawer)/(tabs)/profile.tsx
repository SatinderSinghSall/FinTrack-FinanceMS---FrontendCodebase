import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import api from "../../../src/services/api";
import { useAuthStore } from "../../../src/store/auth.store";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "@/src/components/AppHeader";

export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);
  const navigation = useNavigation();

  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.android?.versionCode ||
    "1";

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    const doLogout = () => {
      logout();

      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "You have been successfully logged out",
        position: "top",
      });

      setTimeout(() => {
        router.replace("/landing");
      }, 500);
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

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-3">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const { user, stats } = profile;

  const initials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("") ?? "U";

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* 🔥 HEADER */}
      <AppHeader
        title="Profile"
        showMenu
        onMenuPress={() => navigation.openDrawer()}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isDesktop ? 700 : isTablet ? 550 : "100%",
            alignSelf: "center",
          }}
        >
          {/* HEADER */}
          <Text
            className="font-bold mb-1"
            style={{ fontSize: isTablet ? 34 : 28 }}
          >
            Profile
          </Text>

          <Text className="text-gray-500 mb-6">
            Manage your account & preferences
          </Text>

          {/* USER CARD */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 flex-row items-center">
            <View className="bg-blue-100 h-16 w-16 rounded-full items-center justify-center mr-4">
              <Text className="text-blue-600 font-bold text-xl">
                {initials}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {user.name}
              </Text>

              <Text className="text-gray-500 text-sm">{user.email}</Text>

              <Text className="text-gray-400 text-xs mt-1">
                Joined {new Date(user.createdAt).toDateString()}
              </Text>

              <View className="bg-blue-50 px-2 py-1 rounded-full mt-2 self-start">
                <Text className="text-xs text-blue-600 font-medium">
                  Active account
                </Text>
              </View>
            </View>
          </View>

          {/* STATS (FIXED RESPONSIVE GRID) */}
          <View className="flex-row flex-wrap justify-between mb-6">
            <StatCard
              icon="wallet-outline"
              color="#2563eb"
              label="Budgets"
              value={stats.budgetsCount}
              bg="bg-blue-50"
              isTablet={isTablet}
            />

            <StatCard
              icon="cash-outline"
              color="#dc2626"
              label="Expenses"
              value={stats.expensesCount}
              bg="bg-red-50"
              isTablet={isTablet}
            />

            <StatCard
              icon="cash-outline"
              color="#16a34a"
              label="Income"
              value={stats.incomeCount || 0}
              bg="bg-green-50"
              isTablet={isTablet}
            />
          </View>

          {/* 🔥 QUICK ACTIONS */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-3">
              Quick Actions
            </Text>

            <View className="flex-row justify-between">
              {/* INCOME */}
              <Pressable
                onPress={() => router.push("/income")}
                className="flex-1 bg-green-500 py-3 rounded-xl mr-2 flex-row items-center justify-center shadow-sm"
              >
                <Ionicons name="cash-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">Income</Text>
              </Pressable>

              {/* EXPENSE */}
              <Pressable
                onPress={() => router.push("/expenses")}
                className="flex-1 bg-red-500 py-3 rounded-xl mx-1 flex-row items-center justify-center shadow-sm"
              >
                <Ionicons name="receipt-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">Expense</Text>
              </Pressable>

              {/* BUDGET */}
              <Pressable
                onPress={() => router.push("/add-budget")}
                className="flex-1 bg-blue-600 py-3 rounded-xl ml-2 flex-row items-center justify-center shadow-sm"
              >
                <Ionicons name="wallet-outline" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-2">Budget</Text>
              </Pressable>
            </View>
          </View>

          {/* SETTINGS */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <ProfileItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push("/notifications")}
            />
            <Divider />
            <ProfileItem
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push("/settings")}
            />
            <Divider />
            <ProfileItem icon="lock-closed-outline" label="Change Password" />
            <Divider />
            <ProfileItem icon="help-circle-outline" label="Help & Support" />
            <Divider />
            <ProfileItem icon="document-text-outline" label="Privacy Policy" />
          </View>

          {/* VERSION */}
          <View className="items-center mt-8 mb-2">
            <View className="h-[1px] bg-gray-200 w-full mb-4 opacity-60" />
            <Text className="text-gray-400 text-xs tracking-wide">
              Version {appVersion} • Build {buildNumber}
            </Text>
          </View>

          {/* LOGOUT */}
          <Pressable
            onPress={handleLogout}
            className="bg-red-600 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-2">Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STAT CARD (FIXED) ---------------- */

function StatCard({ icon, color, label, value, bg, isTablet }: any) {
  return (
    <View
      className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-3"
      style={{
        width: isTablet ? "32%" : "48%",
      }}
    >
      <View className={`${bg} p-2 rounded-lg self-start`}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text className="text-gray-500 text-sm mt-2">{label}</Text>

      <Text className="text-xl font-bold mt-1">{value}</Text>
    </View>
  );
}

/* ---------------- PROFILE ITEM ---------------- */

function ProfileItem({ icon, label, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#e5e7eb" }}
      className="flex-row items-center px-4 py-4"
    >
      <View className="bg-gray-100 p-2 rounded-lg">
        <Ionicons name={icon} size={18} color="#374151" />
      </View>

      <Text className="ml-4 text-gray-800 font-medium flex-1">{label}</Text>

      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

/* ---------------- DIVIDER ---------------- */

function Divider() {
  return <View className="h-[1px] bg-gray-100 ml-12" />;
}
