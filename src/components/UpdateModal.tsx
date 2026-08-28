import {
  Modal,
  View,
  Text,
  Pressable,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  visible: boolean;
  storeUrl: string;
  force?: boolean;
  updateMessage?: string;
  onClose?: () => void;
};

export default function UpdateModal({
  visible,
  storeUrl,
  force = false,
  updateMessage,
  onClose,
}: Props) {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const openStore = async () => {
    try {
      const supported = await Linking.canOpenURL(storeUrl);

      if (supported) {
        await Linking.openURL(storeUrl);
      }
    } catch (error) {
      console.warn("Unable to open Play Store:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={force ? undefined : onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View
          style={{
            width: "100%",
            maxWidth: isDesktop ? 420 : isTablet ? 380 : "100%",
            borderRadius: 28,
            overflow: "hidden",

            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          {/* GLASS / GRADIENT CARD */}
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 28,
              borderRadius: 28,
            }}
          >
            {/* ICON */}
            <View className="items-center mb-6">
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",

                  backgroundColor: "rgba(37,99,235,0.08)",
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",

                    backgroundColor: "#2563eb",
                  }}
                >
                  <Ionicons
                    name="cloud-download-outline"
                    size={26}
                    color="#fff"
                  />
                </View>
              </View>
            </View>

            {/* TITLE */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                textAlign: "center",
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              {force ? "Update Required" : "Update Available"}
            </Text>

            {/* DESCRIPTION */}
            <Text
              style={{
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 24,
                paddingHorizontal: 8,
              }}
            >
              {force
                ? "Your current version of FinTrack is no longer supported. Please update to continue."
                : updateMessage ||
                  "A new version of FinTrack is available with improvements and new features."}
            </Text>

            {/* CTA BUTTON */}
            <Pressable
              onPress={openStore}
              accessibilityRole="button"
              accessibilityLabel={
                force ? "Update FinTrack to continue" : "Update FinTrack"
              }
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <LinearGradient
                colors={["#2563eb", "#3b82f6"]}
                style={{
                  paddingVertical: 14,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",

                  shadowColor: "#2563eb",
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Ionicons name="download-outline" size={18} color="#fff" />

                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  {force ? "Update to Continue" : "Update Now"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* SECONDARY */}
            {!force && (
              <Pressable
                onPress={onClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Maybe later"
                className="mt-5 items-center"
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: "500",
                  }}
                >
                  Maybe later
                </Text>
              </Pressable>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}
