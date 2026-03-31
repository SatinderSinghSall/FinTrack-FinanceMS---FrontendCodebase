import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes, budRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/income"),
        api.get("/budgets"),
      ]);

      setExpenses(expRes.data || []);
      setIncome(incRes.data?.data || []);
      setBudgets(budRes.data || []);
    } catch (err) {
      console.log("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // 💰 CALCULATIONS
  const totalIncome = useMemo(
    () => income.reduce((acc, i) => acc + i.amount, 0),
    [income],
  );

  const totalExpense = useMemo(
    () => expenses.reduce((acc, e) => acc + e.amount, 0),
    [expenses],
  );

  const totalBudget = useMemo(
    () => budgets.reduce((acc, b) => acc + b.amount, 0),
    [budgets],
  );

  const balance = totalIncome - totalExpense;

  const budgetPercent =
    totalBudget === 0 ? 0 : (totalExpense / totalBudget) * 100;

  const categoryStats = useMemo(() => {
    const map: any = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 4);
  }, [expenses]);

  // ⏳ LOADING SCREEN
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-2">Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="px-4 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {/* 🔷 BALANCE CARD */}
        <View className="bg-blue-600 rounded-3xl p-6 mb-5">
          <Text className="text-white/80 text-sm">Total Balance</Text>
          <Text className="text-white text-3xl font-bold mt-1">₹{balance}</Text>

          <View className="flex-row justify-between mt-5">
            <View>
              <Text className="text-white/60 text-xs">Income</Text>
              <Text className="text-white font-semibold">₹{totalIncome}</Text>
            </View>

            <View>
              <Text className="text-white/60 text-xs">Expense</Text>
              <Text className="text-white font-semibold">₹{totalExpense}</Text>
            </View>

            <View>
              <Text className="text-white/60 text-xs">Budget</Text>
              <Text className="text-white font-semibold">₹{totalBudget}</Text>
            </View>
          </View>
        </View>

        {/* 📊 CASH FLOW */}
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="font-semibold mb-3">Cash Flow</Text>

          <View className="h-3 bg-gray-200 rounded-full overflow-hidden flex-row">
            <View
              style={{
                width: `${
                  (totalIncome / (totalIncome + totalExpense || 1)) * 100
                }%`,
              }}
              className="bg-green-500"
            />
            <View
              style={{
                width: `${
                  (totalExpense / (totalIncome + totalExpense || 1)) * 100
                }%`,
              }}
              className="bg-red-500"
            />
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="text-green-600 text-xs">Income</Text>
            <Text className="text-red-500 text-xs">Expense</Text>
          </View>
        </View>

        {/* 💰 BUDGET */}
        {totalBudget === 0 ? (
          <View className="bg-white rounded-2xl p-5 mb-5 items-center">
            <Ionicons name="wallet-outline" size={28} color="#9ca3af" />
            <Text className="mt-3 text-gray-700 font-semibold">
              No budget set
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1 mb-3">
              Set a budget to track your spending
            </Text>

            <Pressable
              onPress={() => router.push("/add-budget")}
              className="bg-blue-600 px-5 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Add Budget</Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <Text className="font-semibold mb-3">Budget Usage</Text>

            <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
              <View
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                className={`h-3 ${
                  budgetPercent > 80 ? "bg-red-500" : "bg-green-500"
                }`}
              />
            </View>

            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-500 text-xs">
                ₹{totalExpense} spent
              </Text>
              <Text className="text-gray-500 text-xs">₹{totalBudget}</Text>
            </View>
          </View>
        )}

        {/* 📊 CATEGORY */}
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="font-semibold mb-3">Top Spending</Text>

          {categoryStats.length === 0 ? (
            <Text className="text-gray-400 text-sm">No expense data</Text>
          ) : (
            categoryStats.map((item: any, i) => (
              <View
                key={i}
                className="flex-row justify-between items-center mb-3"
              >
                <Text className="text-gray-700">{item.category}</Text>
                <Text className="font-semibold">₹{item.amount}</Text>
              </View>
            ))
          )}
        </View>

        {/* 🧠 INSIGHTS */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="font-semibold mb-2">Insights</Text>

          {totalExpense === 0 ? (
            <Text className="text-gray-400 text-sm">
              Add transactions to see insights
            </Text>
          ) : totalExpense > totalBudget && totalBudget > 0 ? (
            <Text className="text-red-500 text-sm">
              ⚠️ You exceeded your budget
            </Text>
          ) : totalExpense > totalIncome ? (
            <Text className="text-orange-500 text-sm">
              ⚠️ Spending is higher than income
            </Text>
          ) : (
            <Text className="text-green-600 text-sm">
              ✅ You are financially healthy
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
