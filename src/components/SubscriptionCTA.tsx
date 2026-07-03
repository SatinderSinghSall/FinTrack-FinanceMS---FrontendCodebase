import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SubscriptionCTA() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmall = width < 360;

  const padding = isTablet ? 26 : 22;
  const iconSize = isTablet ? 72 : 62;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push("/subscriptions")}
      className="mt-5 mb-6"
    >
      <LinearGradient
        colors={["#6366F1", "#4F46E5", "#312E81"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32,
          overflow: "hidden",
        }}
      >
        {/* Decorative Background */}
        <View
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 200,
            backgroundColor: "rgba(255,255,255,0.08)",
            top: -70,
            right: -60,
          }}
        />

        <View
          style={{
            position: "absolute",
            width: 170,
            height: 170,
            borderRadius: 150,
            backgroundColor: "rgba(255,255,255,0.05)",
            bottom: -80,
            left: -50,
          }}
        />

        <View style={{ padding }}>
          {/* Premium Badge */}

          <View className="self-start flex-row items-center bg-white/15 border border-white/10 rounded-full px-3 py-2">
            <Ionicons name="sparkles" size={14} color="#FACC15" />
            <Text className="text-white text-xs font-semibold ml-2">
              Premium Feature
            </Text>
          </View>

          {/* Header */}

          <View className="flex-row justify-between mt-5">
            <View className="flex-1 pr-4">
              <View
                style={{
                  width: iconSize,
                  height: iconSize,
                }}
                className="rounded-3xl bg-white/15 border border-white/10 items-center justify-center"
              >
                <Ionicons
                  name="repeat"
                  size={isTablet ? 36 : 30}
                  color="white"
                />
              </View>

              <Text
                style={{
                  fontSize: isTablet ? 30 : isSmall ? 22 : 28,
                }}
                className="text-white font-black mt-5 leading-8"
              >
                Manage Your{"\n"}Subscriptions
              </Text>

              <Text
                style={{
                  fontSize: isTablet ? 16 : 14,
                  lineHeight: isTablet ? 24 : 21,
                }}
                className="text-indigo-100 mt-3"
              >
                Never miss a renewal. Track recurring payments, receive smart
                reminders and monitor all your subscriptions in one place.
              </Text>

              {/* Feature Chips */}

              <View className="flex-row flex-wrap mt-5">
                {["Smart Alerts", "Auto Renew", "Insights"].map((item) => (
                  <View
                    key={item}
                    className="bg-white/15 border border-white/10 rounded-full px-4 py-2 mr-2 mb-2"
                  >
                    <Text className="text-white text-xs font-semibold">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Arrow */}

            <View className="justify-start">
              <View className="w-16 h-16 rounded-full bg-white/15 items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
                  <Ionicons name="arrow-forward" size={22} color="#4F46E5" />
                </View>
              </View>
            </View>
          </View>

          {/* Divider */}

          <View className="h-px bg-white/10 my-6" />

          {/* CTA */}

          <View className="bg-white/10 border border-white/10 rounded-2xl px-5 py-4 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-base">
                Open Subscription Dashboard
              </Text>

              <Text className="text-indigo-200 text-xs mt-1">
                Track every recurring payment
              </Text>
            </View>

            <Ionicons name="arrow-forward-circle" size={34} color="white" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
