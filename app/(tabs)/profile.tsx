import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import api from "../../src/services/api";
import { useAuthStore } from "../../src/store/auth.store";

export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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
      router.replace("/landing");
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) {
        doLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: doLogout },
      ]);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-500">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const { user, stats } = profile;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Width constraint */}
        <View
          style={{
            width: "100%",
            maxWidth: isLargeScreen ? 900 : "100%",
            alignSelf: "center",
          }}
        >
          {/* Header */}
          <Text
            className="font-bold mb-1"
            style={{ fontSize: isLargeScreen ? 34 : 28 }}
          >
            Profile
          </Text>
          <Text className="text-gray-500 mb-6">
            Manage your account & preferences
          </Text>

          {/* User Card */}
          <View className="bg-white rounded-2xl p-5 mb-6 flex-row items-center border border-gray-100 shadow-sm">
            <View className="bg-blue-100 p-4 rounded-full mr-4">
              <Ionicons name="person-outline" size={28} color="#2563eb" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-semibold">{user.name}</Text>
              <Text className="text-gray-500 text-sm">{user.email}</Text>
              <Text className="text-gray-400 text-xs mt-1">
                Joined {new Date(user.createdAt).toDateString()}
              </Text>

              <Text className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 self-start">
                Active account
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mb-6">
            <View className="bg-white rounded-xl p-4 flex-1 mr-3 border border-gray-100 shadow-sm">
              <View className="bg-blue-50 p-2 rounded-lg self-start">
                <Ionicons name="wallet-outline" size={20} color="#2563eb" />
              </View>
              <Text className="text-gray-500 text-sm mt-2">Budgets</Text>
              <Text className="text-xl font-bold mt-1">
                {stats.budgetsCount}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4 flex-1 ml-3 border border-gray-100 shadow-sm">
              <View className="bg-red-50 p-2 rounded-lg self-start">
                <Ionicons name="cash-outline" size={20} color="#dc2626" />
              </View>
              <Text className="text-gray-500 text-sm mt-2">Expenses</Text>
              <Text className="text-xl font-bold mt-1">
                {stats.expensesCount}
              </Text>
            </View>
          </View>

          {/* Settings */}
          <View className="bg-white rounded-2xl mb-6 border border-gray-100 shadow-sm overflow-hidden">
            <ProfileItem icon="notifications-outline" label="Notifications" />
            <Divider />
            <ProfileItem icon="lock-closed-outline" label="Change Password" />
            <Divider />
            <ProfileItem icon="help-circle-outline" label="Help & Support" />
          </View>

          {/* Logout */}
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

function ProfileItem({ icon, label }: any) {
  return (
    <Pressable
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

function Divider() {
  return <View className="h-[1px] bg-gray-100 ml-12" />;
}
