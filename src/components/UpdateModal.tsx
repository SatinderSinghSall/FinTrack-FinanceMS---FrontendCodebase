import {
  Modal,
  View,
  Text,
  Pressable,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  storeUrl: string;
  force?: boolean;
  onClose?: () => void;
};

export default function UpdateModal({
  visible,
  storeUrl,
  force,
  onClose,
}: Props) {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View
          className="bg-white rounded-[28px] px-6 py-7"
          style={{
            width: "100%",
            maxWidth: isDesktop ? 420 : isTablet ? 380 : "100%",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* ICON */}
          <View className="items-center mb-5">
            <View className="bg-blue-100 p-4 rounded-full">
              <Ionicons
                name="cloud-download-outline"
                size={30}
                color="#2563eb"
              />
            </View>
          </View>

          {/* TITLE */}
          <Text className="text-[20px] font-semibold text-center text-gray-900 mb-2">
            Update Available
          </Text>

          {/* DESCRIPTION */}
          <Text className="text-gray-500 text-center text-[14px] leading-5 mb-6 px-2">
            A new version of FinTrack is available with performance improvements
            and new features.
          </Text>

          {/* PRIMARY BUTTON */}
          <Pressable
            onPress={() => Linking.openURL(storeUrl)}
            className="bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center active:opacity-80"
          >
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text className="text-white font-semibold text-[15px] ml-2">
              Update Now
            </Text>
          </Pressable>

          {/* SECONDARY BUTTON */}
          {!force && (
            <Pressable
              onPress={onClose}
              className="mt-4 items-center active:opacity-60"
            >
              <Text className="text-gray-400 text-[13px] font-medium">
                Maybe Later
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
