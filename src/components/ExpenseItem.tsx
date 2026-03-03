import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ExpenseItemProps {
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpenseItem({
  title,
  amount,
  category,
  date,
}: ExpenseItemProps) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      {/* Top Row */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="bg-red-100 p-2 rounded-full mr-3">
            <Ionicons name="cash-outline" size={16} color="#dc2626" />
          </View>
          <Text className="font-semibold text-base">{title}</Text>
        </View>

        <Text className="font-semibold text-red-600">- ₹{amount}</Text>
      </View>

      {/* Bottom Row */}
      <View className="flex-row justify-between mt-2 ml-11">
        <Text className="text-gray-500 text-sm">{category}</Text>
        <Text className="text-gray-400 text-sm">
          {new Date(date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}
