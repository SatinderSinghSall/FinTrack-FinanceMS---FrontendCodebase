import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LandingScreen() {
  return (
    <LinearGradient
      colors={["#F8FAFC", "#E2E8F0"]}
      className="flex-1 items-center justify-center px-6"
    >
      {/* App Icon */}
      <View className="w-20 h-20 rounded-2xl bg-slate-900/5 items-center justify-center mb-6 shadow-sm">
        <Ionicons name="wallet-outline" size={36} color="#0F172A" />
      </View>

      {/* Branding */}
      <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">
        FinTrack
      </Text>
      <Text className="text-slate-500 mt-3 mb-12 text-center">
        Track smarter. Spend better. Grow faster.
      </Text>

      {/* Actions */}
      <View className="w-full">
        <Pressable
          className="bg-slate-900 py-4 rounded-xl mb-4 active:opacity-90 shadow-md"
          onPress={() => router.push("/register")}
        >
          <Text className="text-white text-center font-semibold text-base">
            Get Started
          </Text>
        </Pressable>

        <Pressable
          className="border border-slate-300 py-4 rounded-xl"
          onPress={() => router.push("/login")}
        >
          <Text className="text-slate-700 text-center font-medium">
            I already have an account
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text className="text-slate-400 text-xs mt-10">
        Secure • Private • Built for you
      </Text>
    </LinearGradient>
  );
}
