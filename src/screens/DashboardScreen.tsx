import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "../services/api";

export default function DashboardScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-500">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  /* ---------- Calculations ---------- */

  const spentPercentage =
    summary.totalBudget > 0
      ? Math.min((summary.totalExpenses / summary.totalBudget) * 100, 100)
      : 0;

  const isOverBudget = summary.totalExpenses > summary.totalBudget;

  const daysPassed = new Date().getDate();

  const dailyAverage =
    summary.totalExpenses > 0
      ? Math.round(summary.totalExpenses / daysPassed)
      : 0;

  const remainingBudget = summary.totalBudget - summary.totalExpenses;

  /* ---------- UI ---------- */

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 900,
            alignSelf: "center",
          }}
        >
          {/* Header */}

          <Text
            className="font-bold mb-1"
            style={{ fontSize: isLargeScreen ? 34 : 28 }}
          >
            This Month
          </Text>

          <Text className="text-gray-500 mb-6">Your financial overview</Text>

          {/* Remaining Balance */}

          <View className="bg-blue-600 rounded-2xl p-6 mb-6">
            <Text className="text-white text-sm opacity-80">
              Remaining Balance
            </Text>

            <Text className="text-white text-3xl font-bold mt-2">
              ₹{summary.remainingBalance}
            </Text>
          </View>

          {/* Stats Grid */}

          <View className="flex-row flex-wrap justify-between mb-6">
            {/* Total Budget */}

            <View className="bg-white rounded-xl p-4 w-[48%] mb-3">
              <Ionicons name="wallet-outline" size={22} color="#2563eb" />
              <Text className="text-gray-500 mt-2 text-sm">Total Budget</Text>
              <Text className="text-lg font-semibold">
                ₹{summary.totalBudget}
              </Text>
            </View>

            {/* Total Expenses */}

            <View className="bg-white rounded-xl p-4 w-[48%] mb-3">
              <Ionicons name="cash-outline" size={22} color="#dc2626" />
              <Text className="text-gray-500 mt-2 text-sm">Total Expenses</Text>
              <Text className="text-lg font-semibold">
                ₹{summary.totalExpenses}
              </Text>
            </View>

            {/* Daily Average */}

            <View className="bg-white rounded-xl p-4 w-[48%] mb-3">
              <Ionicons name="calendar-outline" size={22} color="#9333ea" />
              <Text className="text-gray-500 mt-2 text-sm">Daily Average</Text>
              <Text className="text-lg font-semibold">₹{dailyAverage}</Text>
            </View>

            {/* Remaining Budget */}

            <View className="bg-white rounded-xl p-4 w-[48%] mb-3">
              <Ionicons name="analytics-outline" size={22} color="#16a34a" />
              <Text className="text-gray-500 mt-2 text-sm">
                Budget Remaining
              </Text>
              <Text className="text-lg font-semibold">₹{remainingBudget}</Text>
            </View>
          </View>

          {/* Spending Insights */}

          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-lg font-semibold mb-4">
              Spending Insights
            </Text>

            {/* Progress */}

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

          {/* Recent Expenses */}

          <View className="bg-white rounded-2xl p-5">
            <Text className="text-lg font-semibold mb-4">Recent Expenses</Text>

            {(!summary.recentExpenses ||
              summary.recentExpenses.length === 0) && (
              <View className="items-center py-8">
                <Ionicons name="receipt-outline" size={40} color="#9ca3af" />

                <Text className="text-gray-600 mt-3 text-sm font-medium">
                  No expenses yet
                </Text>

                <Text className="text-gray-400 text-xs mt-1 text-center px-6">
                  Start tracking your spending by adding your first expense.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push("/add-expense")}
                  className="flex-row items-center bg-blue-600 px-5 py-3 rounded-lg mt-5"
                >
                  <Ionicons name="add-circle-outline" size={18} color="white" />

                  <Text className="text-white font-semibold ml-2">
                    Add Expense
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {summary.recentExpenses?.length > 0 &&
              summary.recentExpenses.map((expense: any) => (
                <View
                  key={expense._id}
                  className="flex-row justify-between items-center mb-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="receipt-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text className="ml-2 text-gray-700">{expense.title}</Text>
                  </View>

                  <Text className="font-semibold">₹{expense.amount}</Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
