import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

type IconName = keyof typeof Ionicons.glyphMap;

const FEATURES: {
  icon: IconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "receipt-outline",
    title: "Expenses",
    description:
      "Track every expense and understand exactly where your money goes.",
  },
  {
    icon: "pie-chart-outline",
    title: "Smart Budgets",
    description:
      "Set budgets and stay ahead of your spending with intelligent insights.",
  },
  {
    icon: "trending-up-outline",
    title: "Analytics",
    description:
      "See spending trends, savings growth and your financial performance.",
  },
  {
    icon: "wallet-outline",
    title: "Income",
    description:
      "Keep every income source organized with a complete financial overview.",
  },
  {
    icon: "flag-outline",
    title: "Savings Goals",
    description: "Create meaningful goals and track your progress toward them.",
  },
  {
    icon: "repeat-outline",
    title: "Subscriptions",
    description:
      "Keep recurring subscriptions visible and avoid unwanted renewals.",
  },
  {
    icon: "calendar-outline",
    title: "Recurring Payments",
    description:
      "Track bills and scheduled payments so important due dates never slip.",
  },
  {
    icon: "notifications-outline",
    title: "Smart Reminders",
    description:
      "Stay informed about budgets, bills and important financial activity.",
  },
];

export default function LandingScreen() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? 40 : 20;
  const maxContentWidth = isTablet ? 900 : 520;

  const [isHeroVisible, setIsHeroVisible] = useState(true);

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar
        style={isHeroVisible ? "light" : "dark"}
        backgroundColor={isHeroVisible ? "#020617" : "#F8FAFC"}
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          setIsHeroVisible(y < 80);
        }}
        scrollEventThrottle={16}
      >
        <LinearGradient
          colors={["#020617", "#07152D", "#111A45", "#1E2357"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{
                width: "100%",
                maxWidth: maxContentWidth,
                alignSelf: "center",
                paddingHorizontal: horizontalPadding,
              }}
            >
              {/* Top Bar */}
              <View className="flex-row items-center justify-between pt-2">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <Ionicons name="wallet-outline" size={21} color="#FFFFFF" />
                  </View>

                  <Text className="ml-3 text-base font-bold text-white">
                    FinTrack
                  </Text>
                </View>

                <View className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Text className="text-[11px] font-semibold text-slate-200">
                    Personal Finance
                  </Text>
                </View>
              </View>

              {/* Hero Content */}
              <View
                className="items-center"
                style={{
                  paddingTop: isTablet ? 90 : 64,
                  paddingBottom: isTablet ? 64 : 48,
                }}
              >
                {/* Eyebrow */}
                <View className="mb-5 flex-row items-center rounded-full border border-indigo-300/20 bg-indigo-300/10 px-4 py-2">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                    Your finances. Simplified.
                  </Text>
                </View>

                {/* Main Heading */}
                <Text
                  className="text-center font-extrabold text-white"
                  style={{
                    fontSize: isTablet ? 54 : 39,
                    lineHeight: isTablet ? 60 : 46,
                    letterSpacing: -1.2,
                    maxWidth: 760,
                  }}
                >
                  Take control of{"\n"}
                  <Text className="text-indigo-300">your money.</Text>
                </Text>

                {/* Description */}
                <Text
                  className="mt-5 text-center text-slate-300"
                  style={{
                    fontSize: isTablet ? 17 : 15,
                    lineHeight: isTablet ? 27 : 23,
                    maxWidth: 650,
                  }}
                >
                  Track expenses, manage budgets, grow your savings and
                  understand your financial life — all in one place.
                </Text>

                {/* Primary CTA */}
                <Pressable
                  onPress={() => router.push("/register")}
                  className="mt-8 w-full overflow-hidden rounded-2xl active:opacity-90"
                  style={{
                    maxWidth: 430,
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={["#FFFFFF", "#F8FAFC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-row items-center justify-center rounded-2xl py-4"
                  >
                    <Text className="text-base font-bold text-slate-900">
                      Get Started Free
                    </Text>

                    <View className="ml-3 h-7 w-7 items-center justify-center rounded-full bg-slate-900">
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color="#FFFFFF"
                      />
                    </View>
                  </LinearGradient>
                </Pressable>

                {/* Login */}
                <Pressable
                  onPress={() => router.push("/login")}
                  className="mt-5 rounded-xl px-5 py-2 active:opacity-70"
                >
                  <Text className="text-sm text-slate-300">
                    Already have an account?{" "}
                    <Text className="font-bold text-white">Sign in</Text>
                  </Text>
                </Pressable>

                {/* Trust */}
                <View className="mt-7 flex-row items-center">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color="#94A3B8"
                  />

                  <Text className="ml-2 text-[11px] text-slate-400">
                    Secure • Private • Built for you
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ============================================================
            FEATURES
        ============================================================ */}

        <View className="bg-slate-50">
          <View
            style={{
              width: "100%",
              maxWidth: maxContentWidth,
              alignSelf: "center",
              paddingHorizontal: horizontalPadding,
              paddingTop: isTablet ? 72 : 48,
              paddingBottom: isTablet ? 64 : 48,
            }}
          >
            {/* Section Header */}
            <View className="mb-8">
              <Text className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500">
                Everything in one place
              </Text>

              <Text
                className="mt-3 font-extrabold text-slate-900"
                style={{
                  fontSize: isTablet ? 38 : 30,
                  lineHeight: isTablet ? 44 : 36,
                  letterSpacing: -0.7,
                }}
              >
                Everything you need to{"\n"}
                manage your finances.
              </Text>

              <Text className="mt-4 max-w-2xl text-[15px] leading-6 text-slate-500">
                FinTrack brings your income, expenses, budgets, savings,
                subscriptions and recurring payments together into one simple
                financial experience.
              </Text>
            </View>

            {/* Feature Grid */}
            <View
              className="flex-row flex-wrap"
              style={{
                marginHorizontal: -6,
              }}
            >
              {FEATURES.map((feature, index) => (
                <View
                  key={feature.title}
                  style={{
                    width: isTablet ? "25%" : "50%",
                    paddingHorizontal: 6,
                    marginBottom: 12,
                  }}
                >
                  <View
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                    style={{
                      minHeight: isTablet ? 205 : 185,
                      shadowColor: "#0F172A",
                      shadowOpacity: 0.055,
                      shadowRadius: 10,
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      elevation: 2,
                    }}
                  >
                    {/* Icon */}
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Ionicons name={feature.icon} size={20} color="#6366F1" />
                    </View>

                    {/* Title */}
                    <Text className="mt-4 text-[14px] font-bold text-slate-900">
                      {feature.title}
                    </Text>

                    {/* Description */}
                    <Text className="mt-2 text-[12px] leading-5 text-slate-500">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ========================================================
                INSIGHT CARD
            ======================================================== */}

            <View
              className="mt-7 overflow-hidden rounded-3xl"
              style={{
                shadowColor: "#0F172A",
                shadowOpacity: 0.1,
                shadowRadius: 18,
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={["#0F172A", "#172554", "#312E81"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-3xl p-6"
              >
                <View className="flex-row items-start">
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
                    <Ionicons
                      name="sparkles-outline"
                      size={21}
                      color="#C7D2FE"
                    />
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">
                      Smart financial insights
                    </Text>

                    <Text className="mt-2 text-lg font-extrabold text-white">
                      Understand your money, not just your numbers.
                    </Text>

                    <Text className="mt-2 text-[13px] leading-5 text-slate-300">
                      Turn your financial activity into clearer spending
                      patterns, savings progress and actionable insights.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* ========================================================
                FINAL CTA
            ======================================================== */}

            <View className="items-center pt-12">
              <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
                <Ionicons name="wallet-outline" size={23} color="#FFFFFF" />
              </View>

              <Text
                className="text-center font-extrabold text-slate-900"
                style={{
                  fontSize: isTablet ? 30 : 26,
                  letterSpacing: -0.5,
                }}
              >
                Your money deserves{"\n"}a better system.
              </Text>

              <Text className="mt-3 max-w-md text-center text-sm leading-5 text-slate-500">
                Start building better financial habits with FinTrack.
              </Text>

              <Pressable
                onPress={() => router.push("/register")}
                className="mt-6 w-full max-w-sm rounded-2xl bg-slate-900 py-4 active:opacity-90"
                style={{
                  shadowColor: "#0F172A",
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  shadowOffset: {
                    width: 0,
                    height: 6,
                  },
                  elevation: 5,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Text className="text-base font-bold text-white">
                    Start Using FinTrack
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginLeft: 9 }}
                  />
                </View>
              </Pressable>
            </View>

            {/* Footer */}
            <View className="items-center pb-3 pt-10">
              <View className="mb-3 h-px w-16 bg-slate-200" />

              <Text className="text-[11px] text-slate-400">
                FinTrack • Personal Finance
              </Text>

              <Text className="mt-1 text-[10px] text-slate-300">
                Secure • Private • Built for you
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
