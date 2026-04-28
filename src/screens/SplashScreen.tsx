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
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      <LinearGradient
        colors={["#020617", "#0B1220", "#111827"]}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      <LinearGradient
        colors={["rgba(56,189,248,0.12)", "transparent"]}
        style={{
          position: "absolute",
          top: "25%",
          alignSelf: "center",
          width: 300,
          height: 300,
          borderRadius: 200,
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 28,
        }}
      >
        <View
          style={{
            width: isLargeScreen ? 100 : 84,
            height: isLargeScreen ? 100 : 84,
            borderRadius: 26,
            backgroundColor: "rgba(15,23,42,0.9)",
            alignItems: "center",
            justifyContent: "center",

            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",

            shadowColor: "#000",
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 10,

            marginBottom: 26,
          }}
        >
          <Ionicons
            name="wallet-outline"
            size={isLargeScreen ? 50 : 40}
            color="#38BDF8"
          />
        </View>

        <Text
          style={{
            color: "#F8FAFC",
            fontSize: isLargeScreen ? 40 : 32,
            fontWeight: "800",
            letterSpacing: -0.4,
          }}
        >
          FinTrack
        </Text>

        <Text
          style={{
            color: "#94A3B8",
            marginTop: 14,
            fontSize: 15,
            textAlign: "center",
            maxWidth: 240,
            lineHeight: 22,
          }}
        >
          Smart finance tracking, simplified.
        </Text>

        <View style={{ marginTop: 44 }}>
          <ActivityIndicator size="large" color="#38BDF8" />
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 48,
          alignSelf: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#475569",
            fontSize: 11,
            letterSpacing: 2,
          }}
        >
          DEVELOPED BY
        </Text>

        <Text
          style={{
            color: "#E2E8F0",
            fontSize: 17,
            fontWeight: "700",
            marginTop: 6,
          }}
        >
          Satinder Singh Sall
        </Text>
      </View>
    </View>
  );
}
