import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function DashboardScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    const res = await api.get("/dashboard/summary");
    setSummary(res.data);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  }, []);

  if (!summary) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500">Loading dashboard...</Text>
      </View>
    );
  }

  const spentPercentage = Math.min(
    (summary.totalExpenses / summary.totalBudget) * 100,
    100,
  );

  const isOverBudget = summary.totalExpenses > summary.totalBudget;

  return (
    <ScrollView
      className="flex-1 bg-gray-100 px-6 pt-12"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2563eb"
        />
      }
    >
      {/* Header */}
      <Text className="text-3xl font-bold mb-1">This Month</Text>
      <Text className="text-gray-500 mb-6">Your financial overview</Text>

      {/* Remaining Balance */}
      <View className="bg-blue-600 rounded-2xl p-6 mb-6">
        <Text className="text-white text-sm opacity-80">Remaining Balance</Text>
        <Text className="text-white text-3xl font-bold mt-2">
          ₹{summary.remainingBalance}
        </Text>
      </View>

      {/* Budget + Expense Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-white rounded-xl p-4 w-[48%]">
          <Ionicons name="wallet-outline" size={22} color="#2563eb" />
          <Text className="text-gray-500 mt-2 text-sm">Total Budget</Text>
          <Text className="text-lg font-semibold">₹{summary.totalBudget}</Text>
        </View>

        <View className="bg-white rounded-xl p-4 w-[48%]">
          <Ionicons name="cash-outline" size={22} color="#dc2626" />
          <Text className="text-gray-500 mt-2 text-sm">Total Expenses</Text>
          <Text className="text-lg font-semibold">
            ₹{summary.totalExpenses}
          </Text>
        </View>
      </View>

      {/* Spending Insights */}
      <View className="bg-white rounded-2xl p-5 mb-6">
        <Text className="text-lg font-semibold mb-4">Spending Insights</Text>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500 text-sm">Budget Used</Text>
            <Text className="text-gray-500 text-sm">
              {Math.round(spentPercentage)}%
            </Text>
          </View>

          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <View
              style={{ width: `${spentPercentage}%` }}
              className={`h-full ${
                isOverBudget ? "bg-red-500" : "bg-green-500"
              }`}
            />
          </View>
        </View>

        {/* Status */}
        <View className="flex-row items-center mt-4">
          <Ionicons
            name={isOverBudget ? "alert-circle" : "checkmark-circle"}
            size={18}
            color={isOverBudget ? "#dc2626" : "#16a34a"}
          />
          <Text
            className={`ml-2 text-sm ${
              isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            {isOverBudget
              ? "You have exceeded your budget"
              : "Your spending is under control"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
