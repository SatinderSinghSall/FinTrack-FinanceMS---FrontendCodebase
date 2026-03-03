import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyticsScreen() {
  return (
    <View className="flex-1 bg-slate-50 items-center justify-center px-6">
      {/* Icon */}
      <Ionicons name="bar-chart-outline" size={44} color="#64748b" />

      {/* Title */}
      <Text className="text-xl font-semibold text-slate-800 mt-5">
        Analytics
      </Text>

      {/* Status */}
      <Text className="text-slate-500 text-sm mt-1">Coming soon</Text>

      {/* Description */}
      <Text className="text-slate-400 text-center text-sm mt-4 leading-5 max-w-xs">
        Insights and reports to help you better understand your spending.
      </Text>
    </View>
  );
}
