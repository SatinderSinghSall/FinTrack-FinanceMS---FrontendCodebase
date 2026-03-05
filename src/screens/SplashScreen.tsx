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
      colors={["#0F172A", "#1E293B"]}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 420,
          alignItems: "center",
        }}
      >
        {/* App Logo */}
        <View
          style={{
            width: isLargeScreen ? 110 : 90,
            height: isLargeScreen ? 110 : 90,
            borderRadius: 24,
            backgroundColor: "#334155",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="wallet-outline"
            size={isLargeScreen ? 52 : 42}
            color="white"
          />
        </View>

        {/* App Name */}
        <Text
          style={{
            color: "white",
            fontWeight: "800",
            fontSize: isLargeScreen ? 40 : 32,
            letterSpacing: -1,
          }}
        >
          FinTrack
        </Text>

        <Text
          style={{
            color: "#CBD5F5",
            marginTop: 8,
            marginBottom: 30,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Smart finance tracking
        </Text>

        {/* Loader */}
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    </LinearGradient>
  );
}
