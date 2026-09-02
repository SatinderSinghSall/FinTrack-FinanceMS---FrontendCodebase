import React, { useState } from "react";
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

  // Dropdown state for Support & Feedback
  const [isSupportOpen, setIsSupportOpen] = useState(
    pathname.includes("feedback"),
  );

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
      }, 300);
    };

    if (Platform.OS === "web") {
      if (window.confirm("Logout?")) {
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

  const initials = getInitials(user?.name);

  return (
    <DrawerContentScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    >
      <View className="flex-1 bg-white px-5 pt-12 pb-5">
        {/* ========================================================= */}
        {/* BRAND HEADER */}
        {/* ========================================================= */}

        <View className="flex-row items-center justify-between mb-7">
          <View className="flex-row items-center">
            {/* LOGO */}
            <View
              className="w-12 h-12 rounded-[15px] items-center justify-center"
              style={{
                backgroundColor: "#0F2747",
                shadowColor: "#0F2747",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </View>

            {/* BRAND */}
            <View className="ml-3">
              <Text className="text-[20px] font-extrabold tracking-[-0.5px] text-[#0F172A]">
                FinTrack
              </Text>

              <Text className="text-[11px] font-medium text-[#94A3B8] mt-[1px]">
                Personal finance
              </Text>
            </View>
          </View>

          {/* CLOSE */}
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#EEF2F7] items-center justify-center"
          >
            <Ionicons name="close-outline" size={21} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* PROFILE CARD */}
        {/* ========================================================= */}

        <View
          className="rounded-[20px] px-4 py-4 mb-8"
          style={{
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#E8EEF5",
          }}
        >
          <View className="flex-row items-center">
            {/* AVATAR */}
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: "#EAF1FF",
              }}
            >
              <Text className="text-[16px] font-bold text-[#2563EB]">
                {initials}
              </Text>
            </View>

            {/* USER */}
            <View className="flex-1 ml-3">
              <Text className="text-[11px] font-medium text-[#94A3B8]">
                Welcome back
              </Text>

              <Text
                numberOfLines={1}
                className="text-[16px] font-bold text-[#0F172A] mt-[2px]"
              >
                {user?.name || "User"}
              </Text>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-[11px] text-[#94A3B8] mt-[2px]"
              >
                {user?.email || ""}
              </Text>
            </View>

            {/* VERIFIED */}
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color="#22C55E"
              />
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* FINANCES */}
        {/* ========================================================= */}

        <Text className="text-[11px] font-bold tracking-[1.2px] text-[#94A3B8] mb-3 px-1">
          FINANCES
        </Text>

        <View>
          <DrawerItem
            label="Dashboard"
            icon="home-outline"
            route="(tabs)/dashboard"
            active={pathname.includes("dashboard")}
            {...props}
          />

          <DrawerItem
            label="Announcements"
            icon="megaphone-outline"
            route="announcements/AnnouncementScreen"
            active={pathname.includes("announcements")}
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
            icon="arrow-down-circle-outline"
            route="(tabs)/expenses"
            active={pathname.includes("expenses")}
            {...props}
          />

          <DrawerItem
            label="Income"
            icon="arrow-up-circle-outline"
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
            label="Savings"
            icon="leaf-outline"
            route="(tabs)/savings"
            active={pathname.includes("savings")}
            {...props}
          />

          <DrawerItem
            label="Subscriptions"
            icon="repeat-outline"
            route="(tabs)/subscriptions"
            active={pathname.includes("subscriptions")}
            {...props}
          />

          <DrawerItem
            label="Analytics"
            icon="bar-chart-outline"
            route="(tabs)/analytics"
            active={pathname.includes("analytics")}
            {...props}
          />
        </View>

        {/* ========================================================= */}
        {/* ACCOUNT */}
        {/* ========================================================= */}

        <Text className="text-[11px] font-bold tracking-[1.2px] text-[#94A3B8] mb-3 mt-7 px-1">
          ACCOUNT
        </Text>

        <DrawerItem
          label="Settings"
          icon="settings-outline"
          route="settings"
          active={pathname.includes("settings")}
          {...props}
        />

        {/* SUPPORT & FEEDBACK DROPDOWN */}
        <View className="mt-1">
          <TouchableOpacity
            onPress={() => setIsSupportOpen(!isSupportOpen)}
            activeOpacity={0.78}
            className="relative flex-row items-center"
            style={{
              height: 54,
              paddingHorizontal: 10,
              marginBottom: 3,
              borderRadius: 15,
              backgroundColor: pathname.includes("feedback")
                ? "#EEF4FF"
                : "transparent",
            }}
          >
            {pathname.includes("feedback") && (
              <View
                className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-full"
                style={{ backgroundColor: "#2563EB" }}
              />
            )}
            <View
              className="w-10 h-10 rounded-[12px] items-center justify-center"
              style={{
                backgroundColor: pathname.includes("feedback")
                  ? "#FFFFFF"
                  : "transparent",
              }}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={23}
                color={pathname.includes("feedback") ? "#2563EB" : "#94A3B8"}
              />
            </View>
            <Text
              className={`ml-3 text-[15px] flex-1 ${
                pathname.includes("feedback")
                  ? "font-bold text-[#0F172A]"
                  : "font-medium text-[#64748B]"
              }`}
            >
              Support & Feedback
            </Text>
            <Ionicons
              name={isSupportOpen ? "chevron-down" : "chevron-forward"}
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {/* DROPDOWN SUB-ITEMS */}
          {isSupportOpen && (
            <View className="pl-6 ml-4 border-l border-[#EEF2F7] my-1 space-y-1">
              <TouchableOpacity
                onPress={() => {
                  router.push("/feedback/FeedbackScreen");
                  props.navigation.closeDrawer();
                }}
                className="py-2.5 px-3 rounded-xl flex-row items-center"
                style={{
                  backgroundColor: pathname.includes("FeedbackScreen")
                    ? "#EEF4FF"
                    : "transparent",
                }}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={
                    pathname.includes("FeedbackScreen") ? "#2563EB" : "#64748B"
                  }
                />
                <Text
                  className={`ml-3 text-[14px] ${
                    pathname.includes("FeedbackScreen")
                      ? "font-bold text-[#2563EB]"
                      : "font-medium text-[#64748B]"
                  }`}
                >
                  Help & Feedback
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  router.push("/feedback/my-feedback");
                  props.navigation.closeDrawer();
                }}
                className="py-2.5 px-3 rounded-xl flex-row items-center"
                style={{
                  backgroundColor: pathname.includes("my-feedback")
                    ? "#EEF4FF"
                    : "transparent",
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={
                    pathname.includes("my-feedback") ? "#2563EB" : "#64748B"
                  }
                />
                <Text
                  className={`ml-3 text-[14px] ${
                    pathname.includes("my-feedback")
                      ? "font-bold text-[#2563EB]"
                      : "font-medium text-[#64748B]"
                  }`}
                >
                  Check Submissions
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ========================================================= */}
        {/* DEVELOPER CARD */}
        {/* ========================================================= */}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => props.navigation.navigate("developer")}
          className="mt-5 rounded-[20px] overflow-hidden"
          style={{
            backgroundColor: "#F8FAFF",
            borderWidth: 1,
            borderColor: "#DCE7FF",
            shadowColor: "#2563EB",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          {/* BLUE ACCENT */}
          <View
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{
              backgroundColor: "#2563EB",
            }}
          />

          <View className="px-4 py-4">
            <View className="flex-row items-center">
              {/* ICON */}
              <View
                className="w-11 h-11 rounded-[14px] items-center justify-center"
                style={{
                  backgroundColor: "#EAF1FF",
                }}
              >
                <Ionicons name="sparkles-outline" size={21} color="#2563EB" />
              </View>

              {/* CONTENT */}
              <View className="flex-1 ml-3">
                <Text className="text-[14px] font-bold text-[#0F172A]">
                  Meet the Developer
                </Text>

                <Text
                  numberOfLines={1}
                  className="text-[11px] text-[#64748B] mt-[3px]"
                >
                  Skills, AI/ML, projects & tech
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            </View>
          </View>
        </TouchableOpacity>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <View className="mt-auto pt-7">
          {/* DIVIDER */}
          <View className="h-px bg-[#EEF2F7] mb-5" />

          {/* VERSION */}
          <View className="flex-row items-center justify-center mb-5">
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#22C55E"
            />

            <Text className="text-[11px] font-medium text-[#94A3B8] ml-1.5">
              v{Constants.expoConfig?.version} • build{" "}
              {Platform.OS === "android"
                ? Constants.expoConfig?.android?.versionCode
                : Constants.expoConfig?.ios?.buildNumber}
            </Text>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="py-[14px] rounded-[17px] flex-row items-center justify-center"
            style={{
              backgroundColor: "#FFF7F7",
              borderWidth: 1,
              borderColor: "#FEE2E2",
            }}
          >
            <Ionicons name="log-out-outline" size={19} color="#EF4444" />

            <Text className="ml-2 text-[14px] font-bold text-[#EF4444]">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

/* =============================================================== */
/* DRAWER ITEM */
/* =============================================================== */

function DrawerItem({ label, icon, route, active, ...props }: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/${route}`);
        props.navigation.closeDrawer();
      }}
      activeOpacity={0.78}
      className="relative flex-row items-center"
      style={{
        height: 54,
        paddingHorizontal: 10,
        marginBottom: 3,
        borderRadius: 15,
        backgroundColor: active ? "#EEF4FF" : "transparent",
      }}
    >
      {/* ACTIVE LEFT INDICATOR */}
      {active && (
        <View
          className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-full"
          style={{
            backgroundColor: "#2563EB",
          }}
        />
      )}

      {/* ICON CONTAINER */}
      <View
        className="w-10 h-10 rounded-[12px] items-center justify-center"
        style={{
          backgroundColor: active ? "#FFFFFF" : "transparent",
        }}
      >
        <Ionicons
          name={icon}
          size={23}
          color={active ? "#2563EB" : "#94A3B8"}
        />
      </View>

      {/* LABEL */}
      <Text
        className={`ml-3 text-[15px] ${
          active ? "font-bold text-[#0F172A]" : "font-medium text-[#64748B]"
        }`}
      >
        {label}
      </Text>

      {/* ACTIVE DOT */}
      {active && (
        <View
          className="ml-auto w-[6px] h-[6px] rounded-full"
          style={{
            backgroundColor: "#2563EB",
          }}
        />
      )}
    </TouchableOpacity>
  );
}

/* =============================================================== */
/* HELPERS */
/* =============================================================== */

function getInitials(name: string | null | undefined) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
