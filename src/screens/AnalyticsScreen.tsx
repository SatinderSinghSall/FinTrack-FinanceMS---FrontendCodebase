import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/auth.store";
import api from "../services/api";

export default function AnalyticsScreen() {
  const user = useAuthStore((s) => s.user);

  const router = useRouter();
  const navigation = useNavigation();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ====================================================== */
  /* FETCH DATA */
  /* ====================================================== */

  const fetchData = async () => {
    try {
      const [expRes, incRes, budRes, savRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/income"),
        api.get("/budgets"),
        api.get("/savings"),
      ]);

      setExpenses(expRes.data || []);
      setIncome(incRes.data?.data || []);
      setBudgets(budRes.data || []);
      setSavings(savRes.data || []);
    } catch (err) {
      console.log("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  /* ====================================================== */
  /* CORE CALCULATIONS */
  /* ====================================================== */

  const totalIncome = useMemo(
    () => income.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [income],
  );

  const totalExpense = useMemo(
    () => expenses.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [expenses],
  );

  const totalBudget = useMemo(
    () => budgets.reduce((acc, item) => acc + Number(item.limit || 0), 0),
    [budgets],
  );

  const totalSavings = useMemo(
    () => savings.reduce((acc, item) => acc + Number(item.amount || 0), 0),
    [savings],
  );

  const balance = totalIncome - totalExpense;

  const budgetPercent =
    totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  const cashFlowTotal = totalIncome + totalExpense;

  const incomeShare =
    cashFlowTotal > 0 ? (totalIncome / cashFlowTotal) * 100 : 0;

  const expenseShare =
    cashFlowTotal > 0 ? (totalExpense / cashFlowTotal) * 100 : 0;

  /* ====================================================== */
  /* CATEGORY ANALYSIS */
  /* ====================================================== */

  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Other";

      map[category] = (map[category] || 0) + Number(expense.amount || 0);
    });

    const total = Object.values(map).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [expenses]);

  const maxCategoryAmount =
    categoryStats.length > 0
      ? Math.max(...categoryStats.map((item) => item.amount))
      : 0;

  /* ====================================================== */
  /* FINANCIAL HEALTH */
  /* ====================================================== */

  const health = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) {
      return {
        label: "Getting started",
        description:
          "Add some income and expenses to understand your financial health.",
        icon: "analytics-outline" as const,
        color: "#64748B",
        background: "#F1F5F9",
      };
    }

    if (totalBudget > 0 && totalExpense > totalBudget) {
      return {
        label: "Needs attention",
        description: "Your spending has moved above your current budget.",
        icon: "warning-outline" as const,
        color: "#DC2626",
        background: "#FEF2F2",
      };
    }

    if (totalExpense > totalIncome) {
      return {
        label: "Watch your spending",
        description: "Your expenses are currently higher than your income.",
        icon: "trending-down-outline" as const,
        color: "#EA580C",
        background: "#FFF7ED",
      };
    }

    if (savingsRate >= 20) {
      return {
        label: "Looking strong",
        description: "You're maintaining a healthy savings habit.",
        icon: "shield-checkmark-outline" as const,
        color: "#059669",
        background: "#ECFDF5",
      };
    }

    return {
      label: "On track",
      description: "Your income currently covers your recorded spending.",
      icon: "checkmark-circle-outline" as const,
      color: "#2563EB",
      background: "#EFF6FF",
    };
  }, [totalIncome, totalExpense, totalBudget, savingsRate]);

  /* ====================================================== */
  /* INSIGHT */
  /* ====================================================== */

  const insight = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) {
      return {
        icon: "bulb-outline" as const,
        title: "Build your financial picture",
        text: "Start recording transactions to unlock more useful spending insights.",
        color: "#2563EB",
        background: "#EFF6FF",
      };
    }

    if (totalBudget > 0 && budgetPercent > 100) {
      return {
        icon: "alert-circle-outline" as const,
        title: "Budget exceeded",
        text: "Your recorded expenses are above your total budget.",
        color: "#DC2626",
        background: "#FEF2F2",
      };
    }

    if (totalIncome > 0 && expenseRatio > 70) {
      return {
        icon: "trending-up-outline" as const,
        title: "High spending ratio",
        text: "More than 70% of your recorded income is going toward expenses.",
        color: "#EA580C",
        background: "#FFF7ED",
      };
    }

    if (savingsRate >= 20) {
      return {
        icon: "sparkles-outline" as const,
        title: "Great savings momentum",
        text: "Your savings currently represent 20% or more of recorded income.",
        color: "#059669",
        background: "#ECFDF5",
      };
    }

    if (categoryStats.length > 0) {
      return {
        icon: "pie-chart-outline" as const,
        title: `${categoryStats[0].category} is your top category`,
        text: `${formatCurrency(
          categoryStats[0].amount,
        )} has been recorded in this category.`,
        color: "#6366F1",
        background: "#EEF2FF",
      };
    }

    return {
      icon: "analytics-outline" as const,
      title: "Your finances are being tracked",
      text: "Keep adding transactions to make these insights more useful.",
      color: "#2563EB",
      background: "#EFF6FF",
    };
  }, [
    totalIncome,
    totalExpense,
    totalBudget,
    budgetPercent,
    expenseRatio,
    savingsRate,
    categoryStats,
  ]);

  // USER GREETING
  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }

  function getInitials(name?: string | null) {
    if (!name) return "U";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  /* ====================================================== */
  /* LOADING */
  /* ====================================================== */

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
          <ActivityIndicator size="small" color="#2563EB" />
        </View>

        <Text className="text-slate-800 font-semibold mt-4">
          Preparing your analytics
        </Text>

        <Text className="text-slate-400 text-xs mt-1">
          Analyzing your finances...
        </Text>
      </SafeAreaView>
    );
  }

  /* ====================================================== */
  /* SCREEN */
  /* ====================================================== */

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <AppHeader
        title="Analytics"
        showMenu
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 42,
        }}
      >
        {/* ================================================== */}
        {/* INTRO */}
        {/* ================================================== */}

        {/* ================================================== */}
        {/* PERSONAL + ANALYTICS INTRO */}
        {/* ================================================== */}

        <View className="mb-6">
          {/* PERSONAL GREETING */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-slate-400 text-[11px] font-medium">
                {getGreeting()},
              </Text>

              <Text
                className="text-slate-950 font-extrabold mt-1"
                style={{
                  fontSize: 27,
                  letterSpacing: -0.9,
                }}
                numberOfLines={1}
              >
                {user?.name || "there"} 👋
              </Text>
            </View>

            {/* PROFILE INITIAL */}
            <View
              className="w-12 h-12 rounded-[16px] items-center justify-center"
              style={{
                backgroundColor: "#EAF2FF",
                borderWidth: 1,
                borderColor: "#D9E7FF",
              }}
            >
              <Text className="text-blue-600 font-extrabold text-base">
                {getInitials(user?.name)}
              </Text>
            </View>
          </View>

          {/* PERSONAL TAGLINE */}
          <View className="mt-4">
            <Text
              className="text-slate-900 font-extrabold"
              style={{
                fontSize: 20,
                letterSpacing: -0.45,
              }}
            >
              Your money, clearly understood.
            </Text>

            <Text className="text-slate-400 text-xs mt-1.5 leading-5">
              A clear view of your financial health, spending and progress.
            </Text>
          </View>

          {/* DIVIDER */}
          <View className="h-px bg-slate-200/80 my-5" />

          {/* ANALYTICS INTRO */}
          <View>
            <Text className="text-blue-600 text-[10px] font-extrabold tracking-[1.7px]">
              FINANCIAL INSIGHTS
            </Text>

            <Text
              className="text-slate-900 font-extrabold mt-1"
              style={{
                fontSize: 28,
                letterSpacing: -0.8,
              }}
            >
              Your financial picture
            </Text>

            <Text className="text-slate-500 text-sm mt-1">
              Understand where your money is going and how you're doing.
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* FINANCIAL HEALTH */}
        {/* ================================================== */}

        <View
          className="bg-white rounded-[22px] p-4 mb-5 flex-row items-center"
          style={cardShadow}
        >
          <View
            className="w-11 h-11 rounded-[14px] items-center justify-center"
            style={{
              backgroundColor: health.background,
            }}
          >
            <Ionicons name={health.icon} size={21} color={health.color} />
          </View>

          <View className="flex-1 ml-3.5">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Financial health
            </Text>

            <Text
              className="text-slate-900 font-bold text-[15px] mt-0.5"
              style={{
                color: health.color,
              }}
            >
              {health.label}
            </Text>

            <Text className="text-slate-400 text-[11px] mt-1">
              {health.description}
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* BALANCE HERO */}
        {/* ================================================== */}

        <View
          className="rounded-[28px] p-5 mb-5 overflow-hidden"
          style={{
            backgroundColor: "#071D3A",
            shadowColor: "#071D3A",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.16,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          {/* decorative circles */}

          <View
            className="absolute rounded-full"
            style={{
              width: 180,
              height: 180,
              right: -80,
              top: -95,
              backgroundColor: "rgba(59,130,246,0.13)",
            }}
          />

          <View
            className="absolute rounded-full"
            style={{
              width: 120,
              height: 120,
              left: -65,
              bottom: -70,
              backgroundColor: "rgba(96,165,250,0.08)",
            }}
          />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-blue-100/60 text-xs font-medium">
                Net balance
              </Text>

              <Text
                className="text-white font-extrabold mt-1"
                style={{
                  fontSize: 32,
                  letterSpacing: -1,
                }}
              >
                {formatCurrency(balance)}
              </Text>
            </View>

            <View className="w-11 h-11 rounded-[15px] bg-white/10 items-center justify-center">
              <Ionicons name="analytics-outline" size={22} color="#BFDBFE" />
            </View>
          </View>

          {/* mini metrics */}

          <View
            className="h-px my-5"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
            }}
          />

          <View className="flex-row">
            <HeroMetric
              label="Income"
              value={totalIncome}
              icon="arrow-down"
              color="#34D399"
            />

            <HeroMetric
              label="Expenses"
              value={totalExpense}
              icon="arrow-up"
              color="#FB7185"
            />
          </View>
        </View>

        {/* ================================================== */}
        {/* CASH FLOW */}
        {/* ================================================== */}

        <SectionHeader
          eyebrow="CASH FLOW"
          title="Income vs expenses"
          description="How your recorded money flows compare."
        />

        <View className="bg-white rounded-[24px] p-5 mb-6" style={cardShadow}>
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-slate-400 text-[11px] font-medium">
                Total income
              </Text>

              <Text className="text-emerald-600 font-extrabold text-xl mt-1">
                {formatCurrency(totalIncome)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-slate-400 text-[11px] font-medium">
                Total expenses
              </Text>

              <Text className="text-red-500 font-extrabold text-xl mt-1">
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>

          {/* FLOW BAR */}

          <View className="mt-5">
            <View className="h-4 bg-slate-100 rounded-full overflow-hidden flex-row">
              <View
                style={{
                  width: `${incomeShare}%`,
                  backgroundColor: "#22C55E",
                }}
              />

              <View
                style={{
                  width: `${expenseShare}%`,
                  backgroundColor: "#F43F5E",
                }}
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />

              <Text className="text-slate-400 text-[10px]">
                Income {incomeShare.toFixed(0)}%
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />

              <Text className="text-slate-400 text-[10px]">
                Expenses {expenseShare.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* RESULT */}

          <View className="mt-5 rounded-[16px] bg-slate-50 p-3.5 flex-row items-center">
            <View className="w-9 h-9 rounded-xl bg-white items-center justify-center">
              <Ionicons
                name={
                  balance >= 0 ? "trending-up-outline" : "trending-down-outline"
                }
                size={18}
                color={balance >= 0 ? "#16A34A" : "#DC2626"}
              />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-slate-700 text-xs font-semibold">
                Net cash position
              </Text>

              <Text className="text-slate-400 text-[10px] mt-0.5">
                {balance >= 0
                  ? "You're currently spending less than your recorded income."
                  : "Your recorded expenses currently exceed your income."}
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* BUDGET + SAVINGS */}
        {/* ================================================== */}

        <SectionHeader
          eyebrow="PERFORMANCE"
          title="Budget & savings"
          description="See how effectively you're managing your money."
        />

        {/* BUDGET */}

        <View className="bg-white rounded-[24px] p-5 mb-4" style={cardShadow}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-[14px] bg-blue-50 items-center justify-center">
                <Ionicons name="wallet-outline" size={21} color="#2563EB" />
              </View>

              <View className="ml-3">
                <Text className="text-slate-900 font-bold text-sm">
                  Budget usage
                </Text>

                <Text className="text-slate-400 text-[10px] mt-1">
                  {totalBudget > 0
                    ? `${budgetPercent.toFixed(0)}% of budget used`
                    : "No budget configured"}
                </Text>
              </View>
            </View>

            <Text
              className="font-extrabold text-xl"
              style={{
                color:
                  budgetPercent > 100
                    ? "#DC2626"
                    : budgetPercent > 80
                      ? "#EA580C"
                      : "#2563EB",
              }}
            >
              {budgetPercent.toFixed(0)}%
            </Text>
          </View>

          <View className="h-3 bg-slate-100 rounded-full overflow-hidden mt-5">
            <View
              style={{
                width: `${Math.min(budgetPercent, 100)}%`,
                backgroundColor:
                  budgetPercent > 100
                    ? "#EF4444"
                    : budgetPercent > 80
                      ? "#F97316"
                      : "#2563EB",
              }}
              className="h-full rounded-full"
            />
          </View>

          <View className="flex-row justify-between mt-3">
            <Text className="text-slate-400 text-[10px]">
              {formatCurrency(totalExpense)} spent
            </Text>

            <Text className="text-slate-500 text-[10px] font-semibold">
              {formatCurrency(totalBudget)}
            </Text>
          </View>

          {totalBudget === 0 && (
            <Pressable
              onPress={() => router.push("/add-budget")}
              className="mt-4 bg-blue-50 rounded-xl py-3 items-center"
            >
              <Text className="text-blue-600 text-xs font-bold">
                Create a budget
              </Text>
            </Pressable>
          )}
        </View>

        {/* SAVINGS */}

        <View className="bg-white rounded-[24px] p-5 mb-6" style={cardShadow}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-[14px] bg-emerald-50 items-center justify-center">
                <Ionicons name="leaf-outline" size={21} color="#059669" />
              </View>

              <View className="ml-3">
                <Text className="text-slate-900 font-bold text-sm">
                  Savings performance
                </Text>

                <Text className="text-slate-400 text-[10px] mt-1">
                  {formatCurrency(totalSavings)} saved
                </Text>
              </View>
            </View>

            <Text className="text-emerald-600 font-extrabold text-xl">
              {savingsRate.toFixed(1)}%
            </Text>
          </View>

          <View className="h-3 bg-slate-100 rounded-full overflow-hidden mt-5">
            <View
              style={{
                width: `${Math.min(savingsRate, 100)}%`,
              }}
              className="h-full rounded-full bg-emerald-500"
            />
          </View>

          <View className="flex-row items-center mt-4">
            <Ionicons
              name={
                savingsRate >= 20
                  ? "checkmark-circle"
                  : "information-circle-outline"
              }
              size={16}
              color={savingsRate >= 20 ? "#059669" : "#64748B"}
            />

            <Text className="text-slate-400 text-[10px] ml-2 flex-1">
              {savingsRate >= 20
                ? "You're maintaining a strong savings rate."
                : "Consider increasing your savings contribution over time."}
            </Text>
          </View>

          {totalSavings === 0 && (
            <Pressable
              onPress={() => router.push("/add-saving")}
              className="mt-4 bg-emerald-50 rounded-xl py-3 items-center"
            >
              <Text className="text-emerald-600 text-xs font-bold">
                Start saving
              </Text>
            </Pressable>
          )}
        </View>

        {/* ================================================== */}
        {/* SPENDING ANALYSIS */}
        {/* ================================================== */}

        <SectionHeader
          eyebrow="SPENDING ANALYSIS"
          title="Where your money goes"
          description="Your largest recorded expense categories."
        />

        <View className="bg-white rounded-[24px] p-5 mb-6" style={cardShadow}>
          {categoryStats.length === 0 ? (
            <EmptyAnalytics
              icon="pie-chart-outline"
              title="No spending data yet"
              description="Record some expenses to see your spending breakdown."
              buttonLabel="Add expense"
              onPress={() => router.push("/add-expense")}
            />
          ) : (
            <>
              {/* SUMMARY */}

              <View className="flex-row items-end justify-between mb-5">
                <View>
                  <Text className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                    Top category
                  </Text>

                  <Text className="text-slate-900 font-extrabold text-lg mt-1">
                    {categoryStats[0].category}
                  </Text>
                </View>

                <Text className="text-slate-900 font-extrabold text-lg">
                  {formatCurrency(categoryStats[0].amount)}
                </Text>
              </View>

              {/* CATEGORIES */}

              {categoryStats.map((item, index) => {
                const width =
                  maxCategoryAmount > 0
                    ? (item.amount / maxCategoryAmount) * 100
                    : 0;

                return (
                  <View key={item.category} className="mb-5">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-7 h-7 rounded-lg items-center justify-center mr-2.5"
                          style={{
                            backgroundColor: getCategoryBackground(index),
                          }}
                        >
                          <Text
                            style={{
                              color: getCategoryColor(index),
                              fontSize: 10,
                              fontWeight: "800",
                            }}
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <Text
                          className="text-slate-700 text-xs font-semibold"
                          numberOfLines={1}
                        >
                          {item.category}
                        </Text>
                      </View>

                      <View className="items-end ml-3">
                        <Text className="text-slate-900 text-xs font-bold">
                          {formatCurrency(item.amount)}
                        </Text>

                        <Text className="text-slate-400 text-[9px] mt-0.5">
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>

                    <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <View
                        style={{
                          width: `${width}%`,
                          backgroundColor: getCategoryColor(index),
                        }}
                        className="h-full rounded-full"
                      />
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>

        {/* ================================================== */}
        {/* INSIGHT */}
        {/* ================================================== */}

        <SectionHeader
          eyebrow="SMART INSIGHT"
          title="What stands out"
          description="A quick interpretation of your current numbers."
        />

        <View className="bg-white rounded-[24px] p-5 mb-4" style={cardShadow}>
          <View className="flex-row items-start">
            <View
              className="w-11 h-11 rounded-[14px] items-center justify-center"
              style={{
                backgroundColor: insight.background,
              }}
            >
              <Ionicons name={insight.icon} size={21} color={insight.color} />
            </View>

            <View className="flex-1 ml-3.5">
              <Text className="text-slate-900 font-bold text-sm">
                {insight.title}
              </Text>

              <Text className="text-slate-500 text-xs leading-5 mt-1.5">
                {insight.text}
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* KEY METRICS */}
        {/* ================================================== */}

        <View className="flex-row justify-between mt-1">
          <MiniMetric
            label="Transactions"
            value={expenses.length + income.length}
            icon="swap-horizontal-outline"
          />

          <MiniMetric
            label="Categories"
            value={categoryStats.length}
            icon="grid-outline"
          />

          <MiniMetric
            label="Savings rate"
            value={`${savingsRate.toFixed(0)}%`}
            icon="leaf-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ====================================================== */
/* SECTION HEADER */
/* ====================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <View className="mb-3">
      <Text className="text-blue-600 text-[9px] font-extrabold tracking-[1.6px]">
        {eyebrow}
      </Text>

      <Text
        className="text-slate-900 font-extrabold mt-1"
        style={{
          fontSize: 21,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>

      <Text className="text-slate-400 text-[11px] mt-1">{description}</Text>
    </View>
  );
}

/* ====================================================== */
/* HERO METRIC */
/* ====================================================== */

function HeroMetric({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <View className="flex-1 flex-row items-center">
      <View
        className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
        style={{
          backgroundColor: `${color}18`,
        }}
      >
        <Ionicons name={icon as any} size={15} color={color} />
      </View>

      <View>
        <Text className="text-blue-100/50 text-[9px] uppercase tracking-wider">
          {label}
        </Text>

        <Text className="text-white font-bold text-sm mt-0.5">
          {formatCurrency(value)}
        </Text>
      </View>
    </View>
  );
}

/* ====================================================== */
/* MINI METRIC */
/* ====================================================== */

function MiniMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <View
      className="bg-white rounded-[18px] p-3.5"
      style={{
        width: "31.5%",
        borderWidth: 1,
        borderColor: "#E8EDF4",
      }}
    >
      <Ionicons name={icon as any} size={17} color="#64748B" />

      <Text className="text-slate-900 font-extrabold text-base mt-2">
        {value}
      </Text>

      <Text className="text-slate-400 text-[9px] mt-0.5">{label}</Text>
    </View>
  );
}

/* ====================================================== */
/* EMPTY STATE */
/* ====================================================== */

function EmptyAnalytics({
  icon,
  title,
  description,
  buttonLabel,
  onPress,
}: any) {
  return (
    <View className="items-center py-5">
      <View className="w-14 h-14 rounded-[18px] bg-slate-50 items-center justify-center">
        <Ionicons name={icon} size={25} color="#94A3B8" />
      </View>

      <Text className="text-slate-800 font-bold text-sm mt-4">{title}</Text>

      <Text className="text-slate-400 text-[11px] text-center leading-5 mt-1 max-w-[260px]">
        {description}
      </Text>

      <Pressable
        onPress={onPress}
        className="bg-blue-600 rounded-xl px-5 py-2.5 mt-4"
      >
        <Text className="text-white text-xs font-bold">{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

/* ====================================================== */
/* CATEGORY COLORS */
/* ====================================================== */

function getCategoryColor(index: number) {
  const colors = [
    "#2563EB",
    "#8B5CF6",
    "#059669",
    "#F97316",
    "#E11D48",
    "#0891B2",
  ];

  return colors[index % colors.length];
}

function getCategoryBackground(index: number) {
  const colors = [
    "#EFF6FF",
    "#F5F3FF",
    "#ECFDF5",
    "#FFF7ED",
    "#FFF1F2",
    "#ECFEFF",
  ];

  return colors[index % colors.length];
}

/* ====================================================== */
/* CURRENCY */
/* ====================================================== */

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/* ====================================================== */
/* CARD SHADOW */
/* ====================================================== */

const cardShadow = {
  borderWidth: 1,
  borderColor: "#E8EDF4",

  shadowColor: "#0F172A",
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.045,
  shadowRadius: 16,

  elevation: 2,
};
