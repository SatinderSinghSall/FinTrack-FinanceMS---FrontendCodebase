import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <LinearGradient
      colors={["#020617", "#0F172A", "#1E293B"]}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 80,
        paddingHorizontal: 24,
      }}
    >
      {/* TOP EMPTY SPACE */}
      <View />

      {/* CENTER CONTENT */}
      <View
        style={{
          width: "100%",
          maxWidth: 420,
          alignItems: "center",
        }}
      >
        {/* LOGO WITH GLOW */}
        <View
          style={{
            width: isLargeScreen ? 120 : 100,
            height: isLargeScreen ? 120 : 100,
            borderRadius: 30,
            backgroundColor: "#1E293B",
            alignItems: "center",
            justifyContent: "center",

            // Premium glow
            shadowColor: "#38BDF8",
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 12,

            marginBottom: 24,
          }}
        >
          <Ionicons
            name="wallet-outline"
            size={isLargeScreen ? 58 : 46}
            color="#38BDF8"
          />
        </View>

        {/* APP NAME */}
        <Text
          style={{
            color: "white",
            fontWeight: "900",
            fontSize: isLargeScreen ? 42 : 34,
            letterSpacing: -1,
          }}
        >
          FinTrack
        </Text>

        {/* TAGLINE */}
        <Text
          style={{
            color: "#94A3B8",
            marginTop: 10,
            marginBottom: 36,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Smart • Simple • Powerful Finance Tracking
        </Text>

        {/* LOADER */}
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>

      {/* FOOTER (DEVELOPER CREDIT) */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            color: "#64748B",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          DEVELOPED BY
        </Text>

        <Text
          style={{
            color: "#E2E8F0",
            fontSize: 14,
            fontWeight: "600",
            marginTop: 4,
          }}
        >
          Satinder Singh Sall
        </Text>
      </View>
    </LinearGradient>
  );
}
