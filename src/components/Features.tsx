import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Feature = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  route: string;
};

type SecurityFeature = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const FEATURES: Feature[] = [
  {
    label: "Expenses",
    icon: "receipt-outline",
    iconColor: "#dc2626",
    iconBg: "bg-red-50",
    route: "/(drawer)/(tabs)/expenses",
  },
  {
    label: "Income",
    icon: "cash-outline",
    iconColor: "#059669",
    iconBg: "bg-emerald-50",
    route: "/(drawer)/(tabs)/income",
  },
  {
    label: "Budgets",
    icon: "pie-chart-outline",
    iconColor: "#2563eb",
    iconBg: "bg-blue-50",
    route: "/(drawer)/(tabs)/budgets",
  },
  {
    label: "Savings",
    icon: "wallet-outline",
    iconColor: "#d97706",
    iconBg: "bg-amber-50",
    route: "/(drawer)/(tabs)/savings",
  },
  {
    label: "Subscriptions",
    icon: "card-outline",
    iconColor: "#7c3aed",
    iconBg: "bg-violet-50",
    route: "/(drawer)/(tabs)/subscriptions",
  },
  {
    label: "Analytics",
    icon: "bar-chart-outline",
    iconColor: "#0891b2",
    iconBg: "bg-cyan-50",
    route: "/(drawer)/(tabs)/analytics",
  },
  {
    label: "Transactions",
    icon: "swap-horizontal-outline",
    iconColor: "#4f46e5",
    iconBg: "bg-indigo-50",
    route: "/(drawer)/(tabs)/transactions",
  },
  {
    label: "Profile",
    icon: "person-outline",
    iconColor: "#475569",
    iconBg: "bg-slate-100",
    route: "/(drawer)/(tabs)/profile",
  },
  {
    label: "Announcements",
    icon: "megaphone-outline",
    iconColor: "#ea580c",
    iconBg: "bg-orange-50",
    route: "/announcements/AnnouncementScreen",
  },
  {
    label: "Financial Tips",
    icon: "bulb-outline",
    iconColor: "#ca8a04",
    iconBg: "bg-yellow-50",
    route: "/financial-tips/FinancialTipsScreen",
  },
  {
    label: "Notifications",
    icon: "notifications-outline",
    iconColor: "#db2777",
    iconBg: "bg-pink-50",
    route: "/notifications",
  },
  {
    label: "Feedback",
    icon: "chatbubble-ellipses-outline",
    iconColor: "#9333ea",
    iconBg: "bg-purple-50",
    route: "/feedback/FeedbackScreen",
  },
  {
    label: "Settings",
    icon: "settings-outline",
    iconColor: "#52525b",
    iconBg: "bg-zinc-100",
    route: "/settings",
  },
];

const SECURITY_FEATURES: SecurityFeature[] = [
  {
    label: "Secure Backend",
    icon: "server-outline",
  },
  {
    label: "Protected Database",
    icon: "shield-checkmark-outline",
  },
  {
    label: "Secure Admin",
    icon: "lock-closed-outline",
  },
  {
    label: "Private User Data",
    icon: "eye-off-outline",
  },
];

export default function Features() {
  const router = useRouter();

  const handleFeature = (route: string) => {
    router.navigate(route as never);
  };

  return (
    <View className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <View className="mb-5 flex-row items-center">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
          <Ionicons name="grid-outline" size={20} color="#18181b" />
        </View>

        <View className="flex-1">
          <Text className="text-base font-bold text-zinc-900">
            FinTrack Features
          </Text>

          <Text className="mt-0.5 text-xs text-zinc-500">
            Everything you need to manage your money
          </Text>
        </View>
      </View>

      {/* ========================================================= */}
      {/* FEATURES */}
      {/* ========================================================= */}

      <View className="flex-row flex-wrap">
        {FEATURES.map((feature, index) => {
          const isLastInRow = index % 3 === 2;

          return (
            <Pressable
              key={feature.label}
              onPress={() => handleFeature(feature.route)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${feature.label}`}
              className={`mb-2.5 w-[32%] ${!isLastInRow ? "mr-[2%]" : ""}`}
            >
              {({ pressed }) => (
                <View
                  className={`min-h-[78px] items-center justify-center rounded-2xl border px-1 py-3 ${
                    pressed
                      ? "border-zinc-200 bg-zinc-100"
                      : "border-zinc-100 bg-zinc-50"
                  }`}
                >
                  <View
                    className={`h-9 w-9 items-center justify-center rounded-xl ${feature.iconBg}`}
                  >
                    <Ionicons
                      name={feature.icon}
                      size={17}
                      color={feature.iconColor}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    className="mt-2 text-center text-[10px] font-bold text-zinc-700"
                  >
                    {feature.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ========================================================= */}
      {/* SECURITY */}
      {/* ========================================================= */}

      <View className="my-4 h-px bg-zinc-100" />

      <View className="mb-3 flex-row items-center">
        <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
          <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold text-zinc-900">
            Secure & Reliable
          </Text>

          <Text className="text-[10px] text-zinc-500">
            Built with your financial data in mind
          </Text>
        </View>
      </View>

      {/* Security Features */}
      <View className="flex-row flex-wrap">
        {SECURITY_FEATURES.map((feature, index) => {
          const isLastInRow = index % 2 === 1;

          return (
            <View
              key={feature.label}
              className={`mb-2 w-[49%] ${!isLastInRow ? "mr-[2%]" : ""}`}
            >
              <View className="flex-row items-center rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                <Ionicons name={feature.icon} size={14} color="#059669" />

                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-[10px] font-semibold text-zinc-600"
                >
                  {feature.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
