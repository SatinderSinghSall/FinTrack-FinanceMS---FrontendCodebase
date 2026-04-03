import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightContent?: React.ReactNode;
};

export default function AppHeader({
  title,
  showBack,
  showMenu,
  onBackPress,
  onMenuPress,
  rightContent,
}: Props) {
  return (
    <View className="bg-white border-b border-gray-100 shadow-sm">
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* LEFT */}
        <View className="w-10">
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              className="p-2 rounded-full active:bg-gray-100"
            >
              <Ionicons name="arrow-back" size={22} />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity
              onPress={onMenuPress}
              className="p-2 rounded-full active:bg-gray-100"
            >
              <Ionicons name="menu" size={22} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* CENTER */}
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>

        {/* RIGHT */}
        <View className="w-10 items-end">{rightContent}</View>
      </View>
    </View>
  );
}
