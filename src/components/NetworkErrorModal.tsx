import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  isSlowConnection?: boolean;
  onRetry: () => void;
};

export default function NetworkErrorModal({
  visible,
  isSlowConnection = false,
  onRetry,
}: Props) {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const title = isSlowConnection
    ? "Slow Network Connection"
    : "No Internet Connection";

  const description = isSlowConnection
    ? "Your network is currently slow. Some features may take longer to load. For the best experience, connect to a faster Wi-Fi or mobile network."
    : "FinTrack requires an active internet connection to securely sync your financial data, transactions, subscriptions and analytics.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/70 justify-center items-center px-5">
        <View
          className="bg-white rounded-[40px] overflow-hidden w-full"
          style={{
            maxWidth: isTablet ? 480 : 420,
          }}
        >
          {/* Decorative Background */}

          <View className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-indigo-50" />

          <View className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-sky-50" />

          {/* Header */}

          <LinearGradient
            colors={
              isSlowConnection ? ["#F59E0B", "#D97706"] : ["#6366F1", "#4338CA"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="items-center pt-10 pb-8"
          >
            <View className="w-28 h-28 rounded-full bg-white/20 items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                <Ionicons
                  name={isSlowConnection ? "speedometer" : "wifi"}
                  size={42}
                  color={isSlowConnection ? "#D97706" : "#4F46E5"}
                />
              </View>
            </View>

            <Text
              className="text-white font-black mt-6"
              style={{
                fontSize: isTablet ? 34 : 30,
              }}
            >
              {title}
            </Text>

            <Text className="text-white/90 text-center px-8 mt-4 leading-6">
              {description}
            </Text>
          </LinearGradient>

          {/* Info */}

          <View className="px-7 py-6">
            <View className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5">
              <Text className="text-zinc-900 font-black text-lg mb-4">
                Why is this happening?
              </Text>

              <View className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />

                <Text className="text-zinc-700 ml-3 flex-1">
                  Dashboard updates require internet
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />

                <Text className="text-zinc-700 ml-3 flex-1">
                  Cloud syncing is unavailable
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />

                <Text className="text-zinc-700 ml-3 flex-1">
                  Analytics may not load correctly
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />

                <Text className="text-zinc-700 ml-3 flex-1">
                  Subscription syncing is paused
                </Text>
              </View>
            </View>

            {/* Retry Button */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onRetry}
              className="mt-7 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={["#6366F1", "#4338CA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  alignItems: "center",
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={22} color="white" />

                  <Text className="text-white font-black text-lg ml-2">
                    Retry Connection
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}

            <Text className="text-center text-zinc-400 mt-5 leading-6">
              Once your connection is restored,
              {"\n"}
              FinTrack will continue automatically.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
