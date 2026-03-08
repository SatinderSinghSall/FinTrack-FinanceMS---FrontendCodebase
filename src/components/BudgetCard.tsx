import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BudgetCardProps {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export default function BudgetCard({
  id,
  category,
  limit,
  spent,
}: BudgetCardProps) {
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

  const isOver = spent > limit;
  const remaining = limit - spent;

  return (
    <Pressable className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
      {/* HEADER */}

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <Ionicons name="wallet-outline" size={18} color="#2563eb" />
          </View>

          <Text className="text-lg font-semibold text-gray-900">
            {category}
          </Text>
        </View>

        <Text
          className={`font-semibold ${
            isOver ? "text-red-600" : "text-gray-900"
          }`}
        >
          ₹{spent} / ₹{limit}
        </Text>
      </View>

      {/* PROGRESS */}

      <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <View
          style={{ width: `${percentage}%` }}
          className={`h-full ${isOver ? "bg-red-500" : "bg-blue-600"}`}
        />
      </View>

      {/* FOOTER */}

      <View className="flex-row justify-between mt-2">
        <Text
          className={`text-sm ${isOver ? "text-red-600" : "text-gray-500"}`}
        >
          {isOver ? "Budget exceeded" : `₹${remaining} remaining`}
        </Text>

        <Text className="text-xs text-gray-400">{Math.round(percentage)}%</Text>
      </View>
    </Pressable>
  );
}
