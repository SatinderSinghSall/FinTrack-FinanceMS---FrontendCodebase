import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <LinearGradient colors={["#F8FAFC", "#E2E8F0"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* TRUE CENTERING CONTAINER */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Width constraint for web/tablet */}
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              alignItems: "center",
            }}
          >
            {/* App Icon */}
            <View
              className="bg-slate-900/5 rounded-2xl items-center justify-center mb-6 shadow-sm"
              style={{
                width: isLargeScreen ? 96 : 80,
                height: isLargeScreen ? 96 : 80,
              }}
            >
              <Ionicons
                name="wallet-outline"
                size={isLargeScreen ? 44 : 36}
                color="#0F172A"
              />
            </View>

            {/* Branding */}
            <Text
              className="font-extrabold text-slate-900 tracking-tight text-center"
              style={{ fontSize: isLargeScreen ? 42 : 36 }}
            >
              FinTrack
            </Text>

            <Text className="text-slate-500 mt-3 mb-12 text-center text-base">
              Track smarter. Spend better. Grow faster.
            </Text>

            {/* Actions */}
            <Pressable
              className="bg-slate-900 py-4 rounded-xl mb-4 active:opacity-90 shadow-md w-full"
              onPress={() => router.push("/register")}
            >
              <Text className="text-white text-center font-semibold text-base">
                Get Started
              </Text>
            </Pressable>

            <Pressable
              className="border border-slate-300 py-4 rounded-xl w-full"
              onPress={() => router.push("/login")}
            >
              <Text className="text-slate-700 text-center font-medium">
                I already have an account
              </Text>
            </Pressable>

            {/* Footer */}
            <Text className="text-slate-400 text-xs mt-10 text-center">
              Secure • Private • Built for you
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
