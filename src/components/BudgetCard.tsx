import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

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
  const router = useRouter();

  const percentage = Math.min((spent / limit) * 100, 100);
  const isOver = spent > limit;

  return (
    <Pressable
      onPress={() => router.push(`/edit-budget/${id}`)}
      className="bg-white rounded-2xl p-5 mb-4"
    >
      {/* Header */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-lg font-semibold">{category}</Text>
        <Text
          className={`font-semibold ${
            isOver ? "text-red-600" : "text-gray-900"
          }`}
        >
          ₹{spent} / ₹{limit}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <View
          style={{ width: `${percentage}%` }}
          className={`h-full ${isOver ? "bg-red-500" : "bg-blue-600"}`}
        />
      </View>

      {/* Footer */}
      <Text className="text-gray-500 text-sm mt-2">
        {isOver ? "Budget exceeded" : `₹${limit - spent} remaining`}
      </Text>
    </Pressable>
  );
}
