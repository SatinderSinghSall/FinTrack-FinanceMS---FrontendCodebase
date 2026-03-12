import {
  Modal,
  View,
  Text,
  Pressable,
  Linking,
  useWindowDimensions,
} from "react-native";

type Props = {
  visible: boolean;
  storeUrl: string;
  force?: boolean;
};

export default function UpdateModal({ visible, storeUrl, force }: Props) {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View
          className="bg-white rounded-2xl p-6 shadow-lg"
          style={{
            width: "100%",
            maxWidth: isDesktop ? 420 : isTablet ? 380 : "100%",
          }}
        >
          <Text className="text-xl font-bold mb-2 text-gray-900">
            Update Available 🚀
          </Text>

          <Text className="text-gray-600 mb-6">
            A new version of FinTrack is available. Please update your app for
            the best experience.
          </Text>

          <Pressable
            onPress={() => Linking.openURL(storeUrl)}
            className="bg-blue-600 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-base">
              Update App
            </Text>
          </Pressable>

          {!force && (
            <Pressable className="mt-3 items-center">
              <Text className="text-gray-400 text-sm">Later</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
