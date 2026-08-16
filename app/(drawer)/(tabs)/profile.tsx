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
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import { router, useFocusEffect } from "expo-router";
import api from "../../../src/services/api";
import { useAuthStore } from "../../../src/store/auth.store";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "@/src/components/AppHeader";

export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);
  const navigation = useNavigation();

  const scrollRef = useRef<ScrollView>(null);

  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* External webpage modal */
  const [showWebpageModal, setShowWebpageModal] = useState(false);
  const [selectedWebpage, setSelectedWebpage] = useState("");

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.android?.versionCode ||
    "1";

  /* ====================================================== */
  /* FETCH PROFILE */
  /* ====================================================== */

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
    } catch (error) {
      console.log("Profile fetch error:", error);
    }
  };

  /* ====================================================== */
  /* REFRESH WHEN SCREEN FOCUSES */
  /* ====================================================== */

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        await fetchProfile();

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false,
        });
      };

      refresh();
    }, []),
  );

  /* ====================================================== */
  /* PULL TO REFRESH */
  /* ====================================================== */

  const onRefresh = async () => {
    setRefreshing(true);

    await fetchProfile();

    setRefreshing(false);
  };

  /* ====================================================== */
  /* LOGOUT */
  /* ====================================================== */

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
      if (window.confirm("Logout from your account?")) {
        doLogout();
      }
    } else {
      Alert.alert("Logout", "Logout from your account?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: doLogout,
        },
      ]);
    }
  };

  /* ====================================================== */
  /* EXTERNAL WEBPAGE */
  /* ====================================================== */

  const handleWebpagePress = (page: string) => {
    setSelectedWebpage(page);
    setShowWebpageModal(true);
  };

  const openWebpage = async () => {
    setShowWebpageModal(false);

    const url = "https://fintrack-policy.vercel.app/";

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Unable to open webpage",
          "This webpage could not be opened on your device.",
        );
      }
    } catch (error) {
      console.log("Webpage opening error:", error);

      Alert.alert(
        "Unable to open webpage",
        "Something went wrong while opening the webpage.",
      );
    }
  };

  /* ====================================================== */
  /* LOADING */
  /* ====================================================== */

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View
          className="bg-white rounded-[24px] px-7 py-6 items-center"
          style={{
            shadowColor: "#0F172A",
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.06,
            shadowRadius: 18,
            elevation: 3,
          }}
        >
          <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center">
            <ActivityIndicator size="small" color="#2563EB" />
          </View>

          <Text className="text-slate-900 font-semibold mt-4">
            Loading profile
          </Text>

          <Text className="text-slate-400 text-xs mt-1">
            Preparing your financial overview...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { user, stats } = profile;

  /* ====================================================== */
  /* USER INITIALS */
  /* ====================================================== */

  const initials =
    user?.name
      ?.trim()
      ?.split(/\s+/)
      ?.map((name: string) => name[0])
      ?.join("")
      ?.slice(0, 2)
      ?.toUpperCase() || "U";

  /* ====================================================== */
  /* JOINED DATE */
  /* ====================================================== */

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* ================================================== */}
      {/* EXTERNAL WEBPAGE CONFIRMATION MODAL */}
      {/* ================================================== */}

      <Modal
        visible={showWebpageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebpageModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View
            className="w-full max-w-[420px] bg-white rounded-[26px] p-5"
            style={{
              shadowColor: "#0F172A",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.15,
              shadowRadius: 25,
              elevation: 10,
            }}
          >
            {/* ICON */}

            <View className="items-center">
              <View className="w-16 h-16 rounded-[20px] bg-blue-50 items-center justify-center">
                <Ionicons name="open-outline" size={28} color="#2563EB" />
              </View>

              {/* TITLE */}

              <Text className="text-slate-900 text-lg font-extrabold mt-4 text-center">
                Leaving FinTrack
              </Text>

              {/* MESSAGE */}

              <Text className="text-slate-500 text-sm text-center mt-2 leading-5">
                You are being directed to an external webpage to view{" "}
                <Text className="font-semibold text-slate-700">
                  {selectedWebpage}
                </Text>
                .
              </Text>

              {/* URL */}

              <View className="w-full bg-slate-50 rounded-xl px-3 py-2.5 mt-4 flex-row items-center">
                <Ionicons name="globe-outline" size={16} color="#64748B" />

                <Text
                  className="text-slate-500 text-[10px] ml-2 flex-1"
                  numberOfLines={1}
                >
                  fintrack-policy.vercel.app
                </Text>
              </View>

              {/* BUTTONS */}

              <View className="flex-row w-full mt-5">
                <Pressable
                  onPress={() => setShowWebpageModal(false)}
                  className="flex-1 bg-slate-100 rounded-xl py-3.5 items-center mr-2"
                >
                  <Text className="text-slate-600 font-bold text-sm">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={openWebpage}
                  className="flex-1 bg-blue-600 rounded-xl py-3.5 items-center ml-2"
                >
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-sm">
                      Continue
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color="#FFFFFF"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <AppHeader
        title="Profile"
        showMenu
        onMenuPress={() => navigation.openDrawer()}
      />

      {/* ================================================== */}
      {/* CONTENT */}
      {/* ================================================== */}

      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 28 : 20,
          paddingTop: 8,
          paddingBottom: 42,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isDesktop ? 760 : isTablet ? 620 : "100%",
            alignSelf: "center",
          }}
        >
          {/* ================================================== */}
          {/* PAGE INTRO */}
          {/* ================================================== */}

          <View className="mb-5">
            <Text
              className="text-slate-900 font-extrabold"
              style={{
                fontSize: isTablet ? 34 : 28,
                letterSpacing: -0.8,
              }}
            >
              Your profile
            </Text>

            <Text className="text-slate-500 text-sm mt-1.5">
              Manage your account and financial activity.
            </Text>
          </View>

          {/* ================================================== */}
          {/* PREMIUM USER CARD */}
          {/* ================================================== */}

          <View
            className="rounded-[26px] overflow-hidden mb-7"
            style={{
              backgroundColor: "#071D3A",

              shadowColor: "#071D3A",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.16,
              shadowRadius: 22,
              elevation: 6,
            }}
          >
            {/* Decorative background */}

            <View
              className="absolute rounded-full"
              style={{
                width: 170,
                height: 170,
                right: -70,
                top: -80,
                backgroundColor: "rgba(59,130,246,0.12)",
              }}
            />

            <View
              className="absolute rounded-full"
              style={{
                width: 130,
                height: 130,
                right: -55,
                bottom: -75,
                backgroundColor: "rgba(99,102,241,0.10)",
              }}
            />

            <View className="p-5">
              {/* USER */}

              <View className="flex-row items-center">
                <View className="w-[66px] h-[66px] rounded-[20px] bg-[#EEF4FF] items-center justify-center">
                  <Text
                    className="text-blue-600 font-extrabold"
                    style={{
                      fontSize: 21,
                      letterSpacing: -0.5,
                    }}
                  >
                    {initials}
                  </Text>
                </View>

                <View className="flex-1 ml-4 pr-2">
                  <Text
                    className="text-white font-extrabold"
                    numberOfLines={1}
                    style={{
                      fontSize: isTablet ? 23 : 20,
                      letterSpacing: -0.4,
                    }}
                  >
                    {user?.name}
                  </Text>

                  <Text
                    className="text-blue-100/70 text-xs mt-1"
                    numberOfLines={1}
                  >
                    {user?.email}
                  </Text>
                </View>

                <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#60A5FA"
                  />
                </View>
              </View>

              {/* DIVIDER */}

              <View
                className="h-px my-5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.10)",
                }}
              />

              {/* META */}

              <View className="flex-row">
                <View className="flex-1 flex-row items-center">
                  <View className="w-9 h-9 rounded-xl bg-emerald-400/10 items-center justify-center mr-3">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </View>

                  <View>
                    <Text className="text-blue-100/50 text-[10px] font-semibold uppercase tracking-wider">
                      Account
                    </Text>

                    <Text className="text-white text-sm font-semibold mt-0.5">
                      Active
                    </Text>
                  </View>
                </View>

                <View className="flex-1 flex-row items-center">
                  <View className="w-9 h-9 rounded-xl bg-white/10 items-center justify-center mr-3">
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color="#BFDBFE"
                    />
                  </View>

                  <View>
                    <Text className="text-blue-100/50 text-[10px] font-semibold uppercase tracking-wider">
                      Member since
                    </Text>

                    <Text className="text-white text-sm font-semibold mt-0.5">
                      {joinedDate}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ================================================== */}
          {/* FINANCIAL OVERVIEW */}
          {/* ================================================== */}

          <View className="mb-4">
            <Text className="text-blue-600 text-[10px] font-extrabold tracking-[1.5px]">
              YOUR FINANCES
            </Text>

            <Text
              className="text-slate-900 font-extrabold mt-1"
              style={{
                fontSize: isTablet ? 25 : 22,
                letterSpacing: -0.5,
              }}
            >
              Financial overview
            </Text>

            <Text className="text-slate-400 text-sm mt-1">
              A quick look at what you're tracking.
            </Text>
          </View>

          {/* ================================================== */}
          {/* FINANCIAL CARDS */}
          {/* ================================================== */}

          <View className="flex-row flex-wrap justify-between mb-7">
            <StatCard
              icon="wallet-outline"
              color="#2563EB"
              label="Budgets"
              value={stats?.budgetsCount ?? 0}
              background="#EEF4FF"
              accent="#2563EB"
              onPress={() => router.push("/budgets")}
            />

            <StatCard
              icon="receipt-outline"
              color="#EF4444"
              label="Expenses"
              value={stats?.expensesCount ?? 0}
              background="#FFF1F2"
              accent="#EF4444"
              onPress={() => router.push("/expenses")}
            />

            <StatCard
              icon="trending-up-outline"
              color="#16A34A"
              label="Income"
              value={stats?.incomeCount ?? 0}
              background="#ECFDF5"
              accent="#16A34A"
              onPress={() => router.push("/income")}
            />

            <StatCard
              icon="leaf-outline"
              color="#059669"
              label="Savings"
              value={stats?.savingsCount ?? 0}
              background="#ECFDF5"
              accent="#059669"
              onPress={() => router.push("/savings")}
            />
          </View>

          {/* ================================================== */}
          {/* QUICK ACTIONS */}
          {/* ================================================== */}

          <View className="mb-7">
            <Text className="text-blue-600 text-[10px] font-extrabold tracking-[1.5px]">
              SHORTCUTS
            </Text>

            <Text
              className="text-slate-900 font-extrabold mt-1"
              style={{
                fontSize: isTablet ? 25 : 22,
                letterSpacing: -0.5,
              }}
            >
              Quick actions
            </Text>

            <Text className="text-slate-400 text-sm mt-1 mb-4">
              Jump straight into your finances.
            </Text>

            <View className="flex-row flex-wrap justify-between">
              <QuickAction
                label="Income"
                description="Add income"
                icon="arrow-down-circle-outline"
                color="#16A34A"
                background="#ECFDF5"
                onPress={() => router.push("/income")}
              />

              <QuickAction
                label="Expense"
                description="Record spending"
                icon="arrow-up-circle-outline"
                color="#EF4444"
                background="#FFF1F2"
                onPress={() => router.push("/expenses")}
              />

              <QuickAction
                label="Budget"
                description="Plan your spending"
                icon="wallet-outline"
                color="#2563EB"
                background="#EEF4FF"
                onPress={() => router.push("/budgets")}
              />

              <QuickAction
                label="Savings"
                description="Track your goals"
                icon="leaf-outline"
                color="#059669"
                background="#ECFDF5"
                onPress={() => router.push("/savings")}
              />
            </View>
          </View>

          {/* ================================================== */}
          {/* ACCOUNT / PREFERENCES */}
          {/* ================================================== */}

          <View className="mb-7">
            <Text className="text-blue-600 text-[10px] font-extrabold tracking-[1.5px] mb-1">
              ACCOUNT
            </Text>

            <Text
              className="text-slate-900 font-extrabold mb-4"
              style={{
                fontSize: isTablet ? 25 : 22,
                letterSpacing: -0.5,
              }}
            >
              Preferences
            </Text>

            <View
              className="bg-white rounded-[24px] overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "#E8EDF4",

                shadowColor: "#0F172A",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.045,
                shadowRadius: 16,
                elevation: 2,
              }}
            >
              <ProfileItem
                icon="notifications-outline"
                label="Notifications"
                description="Manage financial reminders"
                color="#6366F1"
                background="#EEF2FF"
                onPress={() => router.push("/notifications")}
              />

              <Divider />

              <ProfileItem
                icon="settings-outline"
                label="Settings"
                description="App preferences and controls"
                color="#64748B"
                background="#F1F5F9"
                onPress={() => router.push("/settings")}
              />

              <Divider />

              {/* CHANGE PASSWORD */}

              <ProfileItem
                icon="lock-closed-outline"
                label="Change Password"
                description="Keep your account secure"
                color="#8B5CF6"
                background="#F5F3FF"
                onPress={() => handleWebpagePress("Change Password")}
              />

              <Divider />

              {/* HELP & SUPPORT */}

              <ProfileItem
                icon="help-circle-outline"
                label="Help & Support"
                description="Get help with FinTrack"
                color="#0891B2"
                background="#ECFEFF"
                onPress={() => handleWebpagePress("Help & Support")}
              />

              <Divider />

              {/* PRIVACY POLICY */}

              <ProfileItem
                icon="document-text-outline"
                label="Privacy Policy"
                description="Learn how your data is handled"
                color="#475569"
                background="#F1F5F9"
                onPress={() => handleWebpagePress("Privacy Policy")}
              />
            </View>
          </View>

          {/* ================================================== */}
          {/* SECURITY CARD */}
          {/* ================================================== */}

          <View
            className="bg-white rounded-[24px] p-4 mb-7"
            style={{
              borderWidth: 1,
              borderColor: "#E7ECF3",

              shadowColor: "#0F172A",
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.045,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              {/* ICON */}

              <View className="w-11 h-11 rounded-[15px] bg-emerald-50 items-center justify-center">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#059669"
                />
              </View>

              {/* TEXT */}

              <View className="flex-1 ml-3.5 pr-2">
                <Text className="text-slate-800 font-bold text-[13px]">
                  Your account is protected
                </Text>

                <Text
                  className="text-slate-400 text-[11px] mt-1"
                  numberOfLines={2}
                >
                  Your financial data is secured and accessible only to you.
                </Text>
              </View>

              {/* STATUS */}

              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </View>
            </View>
          </View>

          {/* ================================================== */}
          {/* FINTRACK BRANDING */}
          {/* ================================================== */}

          <View className="items-center mb-6">
            {/* LOGO */}

            <View className="w-11 h-11 rounded-[15px] bg-[#071D3A] items-center justify-center mb-3">
              <Ionicons name="wallet-outline" size={21} color="#FFFFFF" />
            </View>

            <Text className="text-slate-800 font-bold text-sm">FinTrack</Text>

            <Text className="text-slate-400 text-[10px] mt-1">
              Smart money management, made simple.
            </Text>

            {/* VERSION */}

            <Text className="text-slate-300 text-[9px] font-semibold uppercase tracking-[1px] mt-3">
              Version {appVersion} • Build {buildNumber}
            </Text>
          </View>

          {/* ================================================== */}
          {/* LOGOUT */}
          {/* ================================================== */}

          <Pressable
            onPress={handleLogout}
            android_ripple={{ color: "#FEE2E2" }}
            className="bg-white rounded-[20px] py-4 flex-row items-center justify-center"
            style={{
              borderWidth: 1,
              borderColor: "#FECACA",

              shadowColor: "#EF4444",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.035,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center">
              <Ionicons name="log-out-outline" size={19} color="#EF4444" />
            </View>

            <Text className="text-red-500 font-bold text-sm ml-2">
              Log out of FinTrack
            </Text>
          </Pressable>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <Text className="text-center text-slate-300 text-[9px] mt-5">
            Secure • Private • Built for you
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ====================================================== */
/* FINANCIAL STAT CARD */
/* ====================================================== */

function StatCard({
  icon,
  color,
  label,
  value,
  background,
  accent,
  onPress,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#F1F5F9" }}
      style={{
        width: "48.5%",
      }}
      className="mb-3"
    >
      <View
        className="bg-white rounded-[22px] p-[17px] min-h-[150px]"
        style={{
          borderWidth: 1,
          borderColor: "#E7ECF3",

          shadowColor: "#0F172A",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.05,
          shadowRadius: 15,
          elevation: 2,
        }}
      >
        {/* TOP */}

        <View className="flex-row items-center justify-between">
          <View
            className="w-11 h-11 rounded-[15px] items-center justify-center"
            style={{
              backgroundColor: background,
            }}
          >
            <Ionicons name={icon} size={21} color={color} />
          </View>

          <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
            <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
          </View>
        </View>

        {/* LABEL */}

        <Text className="text-slate-400 text-[11px] font-semibold mt-4">
          {label}
        </Text>

        {/* VALUE */}

        <Text
          className="text-slate-900 font-extrabold mt-1"
          style={{
            fontSize: 25,
            letterSpacing: -0.7,
          }}
        >
          {value}
        </Text>

        {/* FOOTER */}

        <View className="flex-row items-center mt-3">
          <View
            className="w-1.5 h-1.5 rounded-full mr-1.5"
            style={{
              backgroundColor: accent,
            }}
          />

          <Text className="text-slate-300 text-[9px] font-medium">Tracked</Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ====================================================== */
/* QUICK ACTION */
/* ====================================================== */

function QuickAction({
  label,
  description,
  icon,
  color,
  background,
  onPress,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#F1F5F9" }}
      style={{
        width: "48.5%",
      }}
      className="mb-3"
    >
      <View
        className="bg-white rounded-[22px] p-[17px]"
        style={{
          borderWidth: 1,
          borderColor: "#E7ECF3",

          shadowColor: "#0F172A",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.045,
          shadowRadius: 15,
          elevation: 2,
        }}
      >
        {/* TOP */}

        <View className="flex-row items-center justify-between">
          <View
            className="w-11 h-11 rounded-[15px] items-center justify-center"
            style={{
              backgroundColor: background,
            }}
          >
            <Ionicons name={icon} size={21} color={color} />
          </View>

          <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
            <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
          </View>
        </View>

        {/* TEXT */}

        <Text className="text-slate-900 text-[14px] font-bold mt-4">
          {label}
        </Text>

        <Text className="text-slate-400 text-[11px] mt-1">{description}</Text>

        {/* ACCENT LINE */}

        <View className="flex-row items-center mt-4">
          <View
            className="h-[3px] rounded-full"
            style={{
              width: 25,
              backgroundColor: color,
            }}
          />

          <View className="h-[3px] flex-1 rounded-full bg-slate-100 ml-1.5" />
        </View>
      </View>
    </Pressable>
  );
}

/* ====================================================== */
/* PROFILE ITEM */
/* ====================================================== */

function ProfileItem({
  icon,
  label,
  description,
  color,
  background,
  onPress,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#F1F5F9" }}
      className="flex-row items-center px-4 py-[15px]"
    >
      {/* ICON */}

      <View
        className="w-10 h-10 rounded-[13px] items-center justify-center"
        style={{
          backgroundColor: background,
        }}
      >
        <Ionicons name={icon} size={19} color={color} />
      </View>

      {/* TEXT */}

      <View className="flex-1 ml-3.5">
        <Text className="text-slate-800 font-semibold text-[13px]">
          {label}
        </Text>

        <Text className="text-slate-400 text-[10px] mt-0.5" numberOfLines={1}>
          {description}
        </Text>
      </View>

      {/* CHEVRON */}

      <View className="w-7 h-7 rounded-full bg-slate-50 items-center justify-center">
        <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
      </View>
    </Pressable>
  );
}

/* ====================================================== */
/* DIVIDER */
/* ====================================================== */

function Divider() {
  return (
    <View
      className="h-px bg-slate-100"
      style={{
        marginLeft: 68,
        marginRight: 16,
      }}
    />
  );
}
