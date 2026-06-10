import { View, Text, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { getDaysRemaining } from "@/src/utils/getDaysRemaining";

interface Props {
  item: any;
  onPress: () => void;
}

export default function SubscriptionCard({ item, onPress }: Props) {
  const daysRemaining = getDaysRemaining(item.nextRenewalDate);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-[28px] p-5 mb-4 border border-zinc-200"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-indigo-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
            <Ionicons name="logo-youtube" size={24} color="#4F46E5" />
          </View>

          <View className="flex-1">
            <Text className="text-zinc-900 text-xl font-black">
              {item.name}
            </Text>

            <Text className="text-zinc-500 mt-1">{item.category}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-zinc-900 text-2xl font-black">
            ₹{item.amount}
          </Text>

          <Text className="text-zinc-400 text-xs mt-1 uppercase">
            {item.billingCycle}
          </Text>
        </View>
      </View>

      <View className="border-t border-zinc-200 mt-5 pt-4 flex-row items-center justify-between">
        <View>
          <Text className="text-zinc-400 text-xs font-medium">
            NEXT RENEWAL
          </Text>

          <Text className="text-zinc-900 mt-1 font-bold">
            {new Date(item.nextRenewalDate).toDateString()}
          </Text>
        </View>

        <View className="bg-emerald-100 px-4 py-2 rounded-2xl">
          <Text className="text-emerald-700 font-bold">Active</Text>
          <Text className="text-emerald-700 font-bold">
            {daysRemaining} days left
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
