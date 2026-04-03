import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import AppHeader from "../components/AppHeader";

export default function DashboardScreen() {
  const router = useRouter();

  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigation = useNavigation();

  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);
  const PAGE_SIZE = 5;

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  /* ---------- Fetch Data ---------- */

  const fetchSummary = async () => {
    const [dashboardRes, incomeRes] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get("/income"),
    ]);

    const dashboard = dashboardRes.data;
    const incomeList = incomeRes.data.data || [];

    const totalIncome = incomeList.reduce(
      (sum: number, i: any) => sum + i.amount,
      0,
    );

    // 🔔 Calculate notifications count
    const now = new Date();

    const expenseCount = (dashboard.recentExpenses || []).filter((e: any) => {
      return new Date(e.date) > new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }).length;

    const incomeCount = incomeList.filter((i: any) => {
      return new Date(i.date) > new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }).length;

    setNotificationCount(expenseCount + incomeCount + 1);

    setSummary({
      ...dashboard,
      totalIncome,
      income: incomeList,
      remainingBalance: totalIncome - dashboard.totalExpenses,
    });
  };

  const fetchProfile = async () => {
    const res = await api.get("/profile");
    setProfile(res.data);
  };

  const loadData = async () => {
    await Promise.all([fetchSummary(), fetchProfile()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  if (!summary || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-500">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  const userName = profile?.user?.name || "User";

  /* ---------- Greeting ---------- */

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

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

  const remainingBalance = (summary.totalIncome || 0) - summary.totalExpenses;

  /* ---------- Pagination ---------- */

  const expenses = summary.recentExpenses || [];

  const expenseStart = (expensePage - 1) * PAGE_SIZE;

  const paginatedExpenses = expenses.slice(
    expenseStart,
    expenseStart + PAGE_SIZE,
  );

  const totalExpensePages = Math.ceil(expenses.length / PAGE_SIZE);
  const hasBudget = summary.totalBudget > 0;

  const incomeList = summary.income || [];
  const incomeStart = (incomePage - 1) * PAGE_SIZE;

  const paginatedIncome = incomeList.slice(
    incomeStart,
    incomeStart + PAGE_SIZE,
  );

  const totalIncomePages = Math.ceil(incomeList.length / PAGE_SIZE);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* ✅ FIXED HEADER */}
      <AppHeader
        title={userName}
        showMenu
        onMenuPress={() => navigation.openDrawer()}
        rightContent={
          <View className="flex-row items-center gap-2">
            {/* Notification */}
            <Pressable
              onPress={() => router.push("/notifications")}
              className="relative"
            >
              <View className="bg-gray-200 p-2 rounded-full">
                <Ionicons name="notifications-outline" size={18} />
              </View>

              {notificationCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-1">
                  <Text className="text-white text-[9px] font-bold">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Profile */}
            <Pressable
              onPress={() => router.push("/profile")}
              className="bg-blue-100 p-2 rounded-full"
            >
              <Ionicons name="person-outline" size={18} color="#2563eb" />
            </Pressable>
          </View>
        }
      />

      {/* ✅ SCROLL CONTENT */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 100, // 👈 breathing space
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
          {/* ---------- HEADER ---------- */}

          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-gray-500 text-sm">{greeting}</Text>

              <Text
                className="font-bold text-gray-900"
                style={{ fontSize: isLargeScreen ? 32 : 26 }}
              >
                {userName}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              {/* 🔔 NOTIFICATION ICON */}
              <Pressable
                onPress={() => router.push("/notifications")}
                className="relative"
              >
                <View className="bg-gray-200 p-3 rounded-full">
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#111"
                  />
                </View>

                {/* 🔴 BADGE */}
                {notificationCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                    <Text className="text-white text-[10px] font-bold">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* 👤 PROFILE */}
              <Pressable
                onPress={() => router.push("/profile")}
                className="bg-blue-100 p-3 rounded-full"
              >
                <Ionicons name="person-outline" size={22} color="#2563eb" />
              </Pressable>
            </View>
          </View>

          {/* ---------- BALANCE CARD ---------- */}

          <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-lg">
            <Text className="text-white text-sm opacity-80">
              Remaining Balance
            </Text>

            <Text className="text-white text-3xl font-bold mt-2">
              ₹{summary.remainingBalance}
            </Text>

            {/* Quick Actions */}

            <View className="flex-row mt-5 justify-between">
              {/* Income */}
              <TouchableOpacity
                onPress={() => router.push("/add-income")}
                className="flex-1 bg-white/20 py-3 rounded-xl flex-row items-center justify-center mr-2"
              >
                <Ionicons name="cash-outline" size={18} color="white" />
                <Text className="text-white ml-2 font-semibold">Income</Text>
              </TouchableOpacity>

              {/* Expense */}
              <TouchableOpacity
                onPress={() => router.push("/add-expense")}
                className="flex-1 bg-white/20 py-3 rounded-xl flex-row items-center justify-center mx-1"
              >
                <Ionicons name="receipt-outline" size={18} color="white" />
                <Text className="text-white ml-2 font-semibold">Expense</Text>
              </TouchableOpacity>

              {/* Budget */}
              <TouchableOpacity
                onPress={() => router.push("/add-budget")}
                className="flex-1 bg-white/20 py-3 rounded-xl flex-row items-center justify-center ml-2"
              >
                <Ionicons name="wallet-outline" size={18} color="white" />
                <Text className="text-white ml-2 font-semibold">Budget</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------- STAT CARDS ---------- */}

          <View className="flex-row flex-wrap justify-between mb-6">
            <StatCard
              icon="wallet-outline"
              color="#2563eb"
              label="Total Budget"
              value={`₹${summary.totalBudget}`}
            />

            <StatCard
              icon="cash-outline"
              color="#16a34a"
              label="Total Income"
              value={`₹${summary.totalIncome || 0}`}
            />

            <StatCard
              icon="receipt-outline"
              color="#dc2626"
              label="Total Expenses"
              value={`₹${summary.totalExpenses}`}
            />

            <StatCard
              icon="calendar-outline"
              color="#9333ea"
              label="Daily Average"
              value={`₹${dailyAverage}`}
            />

            <StatCard
              icon="analytics-outline"
              color="#16a34a"
              label="Remaining"
              value={`₹${remainingBalance}`}
            />
          </View>

          {/* ---------- SPENDING INSIGHT ---------- */}

          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <Text className="text-lg font-semibold mb-4">
              Spending Insights
            </Text>

            {!hasBudget ? (
              /* ---------------- NO BUDGET STATE ---------------- */

              <View className="items-center py-4">
                <View className="bg-gray-100 p-3 rounded-full mb-2">
                  <Ionicons name="wallet-outline" size={22} color="#9ca3af" />
                </View>

                <Text className="text-gray-700 font-medium">No budget set</Text>

                <Text className="text-gray-500 text-sm text-center mt-1 mb-3">
                  Add a budget to track your spending insights.
                </Text>

                <Pressable
                  onPress={() => router.push("/add-budget")}
                  className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                >
                  <Ionicons name="add-outline" size={18} color="#fff" />
                  <Text className="text-white font-semibold ml-1">
                    Add Budget
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* ---------------- NORMAL INSIGHTS ---------------- */

              <>
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
              </>
            )}
          </View>

          {/* ---------- RECENT EXPENSES ---------- */}

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <Text className="text-lg font-semibold mb-4">Recent Expenses</Text>

            {paginatedExpenses.length === 0 ? (
              <View className="items-center py-8">
                <View className="bg-gray-100 p-4 rounded-full mb-3">
                  <Ionicons name="receipt-outline" size={28} color="#9ca3af" />
                </View>

                <Text className="text-gray-700 font-semibold mb-1">
                  No expenses yet
                </Text>

                <Text className="text-gray-500 text-sm text-center mb-4">
                  Start tracking your spending by adding your first expense.
                </Text>

                <Pressable
                  onPress={() => router.push("/add-expense")}
                  className="bg-red-600 px-5 py-2.5 rounded-lg flex-row items-center"
                >
                  <Ionicons name="add-outline" size={18} color="#fff" />
                  <Text className="text-white font-semibold ml-1">
                    Add Expense
                  </Text>
                </Pressable>
              </View>
            ) : (
              paginatedExpenses.map((expense: any) => (
                <View
                  key={expense._id}
                  className="flex-row justify-between items-center mb-4"
                >
                  <View className="flex-row items-center">
                    <View className="bg-gray-100 p-2 rounded-lg">
                      <Ionicons
                        name="receipt-outline"
                        size={18}
                        color="#6b7280"
                      />
                    </View>

                    <Text className="ml-3 text-gray-800">{expense.title}</Text>
                  </View>

                  <Text className="font-semibold text-gray-900">
                    ₹{expense.amount}
                  </Text>
                </View>
              ))
            )}

            {/* Pagination Controls */}

            {totalExpensePages > 1 && (
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  disabled={expensePage === 1}
                  onPress={() => setExpensePage(expensePage - 1)}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700">Previous</Text>
                </TouchableOpacity>

                <Text className="text-gray-500 self-center">
                  Page {expensePage} / {totalExpensePages}
                </Text>

                <TouchableOpacity
                  disabled={expensePage === totalExpensePages}
                  onPress={() => setExpensePage(expensePage + 1)}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700">Next</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ---------- RECENT INCOMES ---------- */}
          <View className="bg-white rounded-2xl p-5 shadow-sm mt-6">
            <Text className="text-lg font-semibold mb-4">Recent Income</Text>

            {paginatedIncome.length === 0 ? (
              <View className="items-center py-8">
                <View className="bg-gray-100 p-4 rounded-full mb-3">
                  <Ionicons name="cash-outline" size={28} color="#9ca3af" />
                </View>

                <Text className="text-gray-700 font-semibold mb-1">
                  No income yet
                </Text>

                <Text className="text-gray-500 text-sm text-center mb-4">
                  Start tracking your earnings by adding your first income.
                </Text>

                <Pressable
                  onPress={() => router.push("/add-income")}
                  className="bg-green-600 px-5 py-2.5 rounded-lg flex-row items-center"
                >
                  <Ionicons name="add-outline" size={18} color="#fff" />
                  <Text className="text-white font-semibold ml-1">
                    Add Income
                  </Text>
                </Pressable>
              </View>
            ) : (
              paginatedIncome.map((income: any) => (
                <View
                  key={income._id}
                  className="flex-row justify-between items-center mb-4"
                >
                  <View className="flex-row items-center">
                    <View className="bg-gray-100 p-2 rounded-lg">
                      <Ionicons name="cash-outline" size={18} color="#16a34a" />
                    </View>

                    <Text className="ml-3 text-gray-800">{income.source}</Text>
                  </View>

                  <Text className="font-semibold text-green-600">
                    +₹{income.amount}
                  </Text>
                </View>
              ))
            )}

            {totalIncomePages > 1 && (
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  disabled={incomePage === 1}
                  onPress={() => setIncomePage(incomePage - 1)}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700">Previous</Text>
                </TouchableOpacity>

                <Text className="text-gray-500 self-center">
                  Page {incomePage} / {totalIncomePages}
                </Text>

                <TouchableOpacity
                  disabled={incomePage === totalIncomePages}
                  onPress={() => setIncomePage(incomePage + 1)}
                  className="bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-700">Next</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Stat Card ---------- */

function StatCard({ icon, color, label, value }: any) {
  return (
    <View className="bg-white rounded-xl p-4 w-[48%] mb-3 shadow-sm">
      <View
        className="p-2 rounded-lg self-start"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text className="text-gray-500 text-sm mt-2">{label}</Text>

      <Text className="text-lg font-semibold text-gray-900">{value}</Text>
    </View>
  );
}
