import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import api from "../services/api";
import AppHeader from "../components/AppHeader";

import SubscriptionFeatureModal from "../components/SubscriptionFeatureModal";
import SubscriptionCTA from "../components/SubscriptionCTA";
import FeedbackCTA from "../components/FeedbackCTA";

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 768;

  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);

  const PAGE_SIZE = 5;

  const [savings, setSavings] = useState<any[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(true);

  /* ============================================================
     FETCH DATA
  ============================================================ */

  const fetchSummary = async () => {
    const [dashboardRes, incomeRes, savingsRes] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get("/income"),
      api.get("/savings"),
    ]);

    const dashboard = dashboardRes.data;
    const incomeList = incomeRes.data?.data || [];
    const savingsList = savingsRes.data || [];

    const totalIncome = incomeList.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0,
    );

    /* Notifications */
    const now = new Date();

    const expenseCount = (dashboard.recentExpenses || []).filter(
      (expense: any) => {
        return (
          new Date(expense.date) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
        );
      },
    ).length;

    const incomeCount = incomeList.filter((income: any) => {
      return (
        new Date(income.date) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
      );
    }).length;

    setNotificationCount(expenseCount + incomeCount + 1);

    setSavings(savingsList);

    setSummary({
      ...dashboard,
      totalIncome,
      income: incomeList,
      remainingBalance: totalIncome - Number(dashboard.totalExpenses || 0),
    });
  };

  const fetchProfile = async () => {
    const res = await api.get("/profile");
    setProfile(res.data);
  };

  const loadData = async () => {
    await Promise.all([fetchSummary(), fetchProfile()]);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const handleCardFlip = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    backfaceVisibility: "hidden" as const,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    backfaceVisibility: "hidden" as const,
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (!summary || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#F6F7FB]">
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="h-20 w-20 rounded-[26px] bg-white items-center justify-center"
            style={{
              shadowColor: "#2563EB",
              shadowOpacity: 0.1,
              shadowRadius: 18,
              shadowOffset: {
                width: 0,
                height: 8,
              },
              elevation: 5,
            }}
          >
            <View className="h-14 w-14 rounded-[20px] bg-blue-600 items-center justify-center">
              <Ionicons name="wallet-outline" size={27} color="#FFFFFF" />
            </View>
          </View>

          <Text className="text-gray-900 text-lg font-bold mt-6">
            Preparing your dashboard
          </Text>

          <Text className="text-gray-400 text-sm text-center mt-2">
            Loading your latest financial activity...
          </Text>

          {/* LOADING DOTS */}
          <View className="flex-row items-center mt-5">
            <View className="h-2 w-2 rounded-full bg-blue-600" />

            <View className="h-2 w-2 rounded-full bg-blue-300 mx-2" />

            <View className="h-2 w-2 rounded-full bg-blue-100" />
          </View>

          {/* LOADING SPINNER */}
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={{
              marginTop: 20,
              transform: [{ scale: 1.25 }],
            }}
          />
        </View>

        <View className="items-center pb-8">
          <View className="flex-row items-center">
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#9CA3AF"
            />

            <Text className="text-gray-400 text-[10px] ml-1.5">
              FinTrack · Secure financial management
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const userName = profile?.user?.name || "User";

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const totalIncome = Number(summary.totalIncome || 0);
  const totalExpenses = Number(summary.totalExpenses || 0);
  const totalBudget = Number(summary.totalBudget || 0);
  const remainingBalance = Number(summary.remainingBalance || 0);

  const spentPercentage =
    totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0;

  const remainingBudget = Math.max(totalBudget - totalExpenses, 0);

  const isOverBudget = totalExpenses > totalBudget;

  const daysPassed = Math.max(new Date().getDate(), 1);

  const dailyAverage =
    totalExpenses > 0 ? Math.round(totalExpenses / daysPassed) : 0;

  const totalSavings = savings.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0),
    0,
  );

  /* ============================================================
     PAGINATION
  ============================================================ */

  const expenses = summary.recentExpenses || [];

  const expenseStart = (expensePage - 1) * PAGE_SIZE;

  const paginatedExpenses = expenses.slice(
    expenseStart,
    expenseStart + PAGE_SIZE,
  );

  const totalExpensePages = Math.ceil(expenses.length / PAGE_SIZE);

  const incomeList = summary.income || [];

  const incomeStart = (incomePage - 1) * PAGE_SIZE;

  const paginatedIncome = incomeList.slice(
    incomeStart,
    incomeStart + PAGE_SIZE,
  );

  const totalIncomePages = Math.ceil(incomeList.length / PAGE_SIZE);

  const hasBudget = totalBudget > 0;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <SafeAreaView className="flex-1 bg-[#F6F7FB]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      {/* ========================================================
          HEADER
      ======================================================== */}

      <AppHeader
        title={userName}
        showMenu
        onMenuPress={() => navigation.openDrawer()}
        rightContent={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push("/notifications")}
              className="relative"
            >
              <View className="h-10 w-10 rounded-full bg-white items-center justify-center border border-gray-100">
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color="#111827"
                />
              </View>

              {notificationCount > 0 && (
                <View className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 rounded-full bg-red-500 items-center justify-center border-2 border-[#F6F7FB]">
                  <Text className="text-white text-[9px] font-bold">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={() => router.push("/profile")}>
              <View className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 items-center justify-center">
                <Ionicons name="person-outline" size={19} color="#2563EB" />
              </View>
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 50,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 920,
            alignSelf: "center",
          }}
        >
          {/* ====================================================
              WELCOME
          ==================================================== */}

          <View className="flex-row items-end justify-between mb-5">
            <View className="flex-1">
              <Text className="text-gray-400 text-[13px] font-medium">
                {greeting}
              </Text>

              <View className="flex-row items-center mt-1">
                <Text
                  className="text-gray-950 font-extrabold"
                  style={{
                    fontSize: isLargeScreen ? 30 : 25,
                    letterSpacing: -0.7,
                  }}
                >
                  {userName}
                </Text>

                <Text className="text-xl ml-2">👋</Text>
              </View>

              <Text className="text-gray-400 text-xs mt-1">
                Here's your financial overview
              </Text>
            </View>
          </View>

          {/* ====================================================
              PREMIUM BALANCE HERO
          ==================================================== */}

          {/* ====================================================
              FLIPPABLE VIRTUAL CARD HERO
          ==================================================== */}
          <Pressable onPress={handleCardFlip} className="mb-6">
            <View style={{ height: 215 }}>
              {/* FRONT OF THE CARD */}
              <Animated.View
                className="rounded-[28px] p-6 bg-slate-900 border border-slate-800 h-full justify-between overflow-hidden"
                style={[
                  frontAnimatedStyle,
                  {
                    shadowColor: "#0F172A",
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 8,
                  },
                ]}
              >
                {/* Top Row: Chip & Live Badge */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-7 rounded-md bg-amber-400/90 border border-amber-300/50 justify-center px-1">
                      <View className="w-full h-[1px] bg-amber-600/40 my-[2px]" />
                      <View className="w-full h-[1px] bg-amber-600/40 my-[2px]" />
                    </View>
                    <Ionicons
                      name="wifi"
                      size={16}
                      color="#94A3B8"
                      style={{
                        transform: [{ rotate: "90deg" }],
                        marginLeft: 10,
                      }}
                    />
                  </View>

                  <View className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-row items-center">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    <Text className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                      Secure
                    </Text>
                  </View>
                </View>

                {/* Balance Label & Amount */}
                <View className="my-2 pb-3 border-b border-slate-800">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Available Liquid Balance
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-slate-500 text-[9px] mr-1">
                        Tap to flip
                      </Text>
                      <Ionicons
                        name="repeat-outline"
                        size={11}
                        color="#64748B"
                      />
                    </View>
                  </View>
                  <Text
                    className="text-white font-black tracking-tight mt-1"
                    style={{ fontSize: isLargeScreen ? 36 : 32 }}
                  >
                    ₹{remainingBalance.toLocaleString("en-IN")}
                  </Text>
                </View>

                {/* Bottom Row: Income / Spending Stats */}
                <View className="flex-row justify-between items-center pt-1">
                  <View className="flex-row items-center flex-1 pr-3">
                    <View className="h-7 w-7 rounded-xl bg-emerald-500/15 items-center justify-center mr-2.5 border border-emerald-500/20">
                      <Ionicons name="arrow-down" size={13} color="#34D399" />
                    </View>
                    <View>
                      <Text className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">
                        Income
                      </Text>
                      <Text className="text-white font-extrabold text-xs mt-0.5">
                        ₹{totalIncome.toLocaleString("en-IN")}
                      </Text>
                    </View>
                  </View>

                  <View className="h-7 w-[1px] bg-slate-700 mx-1" />

                  <View className="flex-row items-center flex-1 pl-3 justify-end">
                    <View className="items-end mr-2.5">
                      <Text className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">
                        Spent
                      </Text>
                      <Text className="text-white font-extrabold text-xs mt-0.5">
                        ₹{totalExpenses.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    <View className="h-7 w-7 rounded-xl bg-rose-500/15 items-center justify-center border border-rose-500/20">
                      <Ionicons name="arrow-up" size={13} color="#F87171" />
                    </View>
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                className="rounded-[28px] p-6 bg-slate-950 border border-slate-800/80 h-full justify-between overflow-hidden"
                style={[
                  backAnimatedStyle,
                  {
                    shadowColor: "#0F172A",
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 8,
                  },
                ]}
              >
                {/* Top Row: Bank-Grade Security & Flip Back (Clean top spacing) */}
                <View className="flex-row items-center justify-between z-10 pt-1">
                  <View className="flex-row items-center">
                    <View className="h-7 w-7 rounded-xl bg-blue-500/10 items-center justify-center mr-2 border border-blue-500/20">
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color="#60A5FA"
                      />
                    </View>
                    <Text className="text-white font-black text-xs tracking-wider uppercase">
                      Bank-Grade Security
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800">
                    <Text className="text-slate-400 text-[9px] mr-1 font-medium">
                      Flip back
                    </Text>
                    <Ionicons name="repeat-outline" size={10} color="#94A3B8" />
                  </View>
                </View>

                {/* Middle Security Description Card */}
                <View className="z-10 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 my-auto">
                  <Text className="text-slate-300 text-[11px] leading-4 font-medium text-center">
                    Your financial vault is protected with end-to-end
                    encryption. Our backend servers secure your database entries
                    permanently.
                  </Text>
                </View>

                {/* Bottom Row: Encryption status & version */}
                <View className="flex-row items-center justify-between z-10 pt-3 border-t border-slate-900/80">
                  <View className="flex-row items-center">
                    <Ionicons name="lock-closed" size={11} color="#34D399" />
                    <Text className="text-emerald-400 text-[9px] font-bold ml-1.5 uppercase tracking-wider">
                      AES-256 Bit Encryption Active
                    </Text>
                  </View>
                  <Text className="text-slate-500 text-[9px] font-mono font-semibold">
                    FinTrack
                  </Text>
                </View>
              </Animated.View>
            </View>
          </Pressable>

          {/* ====================================================
              QUICK ACTIONS
          ==================================================== */}

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-gray-900 text-base font-bold">
                Quick Actions
              </Text>

              <Text className="text-gray-400 text-[10px]">Manage finances</Text>
            </View>

            <View className="flex-row gap-2.5">
              <QuickAction
                icon="arrow-down"
                label="Income"
                bg="#ECFDF5"
                iconColor="#059669"
                onPress={() => router.push("/add-income")}
              />

              <QuickAction
                icon="arrow-up"
                label="Expense"
                bg="#FEF2F2"
                iconColor="#DC2626"
                onPress={() => router.push("/add-expense")}
              />

              <QuickAction
                icon="wallet-outline"
                label="Budget"
                bg="#EFF6FF"
                iconColor="#2563EB"
                onPress={() => router.push("/add-budget")}
              />

              <QuickAction
                icon="leaf-outline"
                label="Savings"
                bg="#ECFDF5"
                iconColor="#059669"
                onPress={() => router.push("/add-saving")}
              />
            </View>
          </View>

          {/* ====================================================
              FINANCIAL OVERVIEW
          ==================================================== */}

          <SectionHeader
            title="Financial Overview"
            subtitle="Your numbers at a glance"
          />

          <View className="flex-row flex-wrap justify-between mb-6">
            <OverviewCard
              icon="wallet-outline"
              color="#2563EB"
              label="Budget"
              value={`₹${totalBudget.toLocaleString("en-IN")}`}
              caption={
                hasBudget ? `${Math.round(spentPercentage)}% used` : "Not set"
              }
            />

            <OverviewCard
              icon="trending-up-outline"
              color="#059669"
              label="Income"
              value={`₹${totalIncome.toLocaleString("en-IN")}`}
              caption="Total received"
            />

            <OverviewCard
              icon="receipt-outline"
              color="#DC2626"
              label="Expenses"
              value={`₹${totalExpenses.toLocaleString("en-IN")}`}
              caption="Total spent"
            />

            <OverviewCard
              icon="calendar-outline"
              color="#7C3AED"
              label="Daily Average"
              value={`₹${dailyAverage.toLocaleString("en-IN")}`}
              caption="Average per day"
            />

            <OverviewCard
              icon="pie-chart-outline"
              color="#0891B2"
              label="Remaining"
              value={`₹${remainingBudget.toLocaleString("en-IN")}`}
              caption={hasBudget ? "Budget remaining" : "Available"}
            />

            <OverviewCard
              icon="leaf-outline"
              color="#059669"
              label="Savings"
              value={`₹${totalSavings.toLocaleString("en-IN")}`}
              caption="Total saved"
            />
          </View>

          {/* ====================================================
              SPENDING INSIGHTS
          ==================================================== */}

          <SectionHeader
            title="Spending Insights"
            subtitle="How you're tracking this month"
          />

          <View
            className="bg-white rounded-[26px] p-5 mb-6 border border-gray-100"
            style={{
              shadowColor: "#111827",
              shadowOpacity: 0.04,
              shadowRadius: 16,
              shadowOffset: {
                width: 0,
                height: 6,
              },
              elevation: 2,
            }}
          >
            {!hasBudget ? (
              <View className="items-center py-5">
                <View className="h-14 w-14 rounded-2xl bg-blue-50 items-center justify-center">
                  <Ionicons name="wallet-outline" size={25} color="#2563EB" />
                </View>

                <Text className="text-gray-900 font-bold text-base mt-4">
                  Set your monthly budget
                </Text>

                <Text className="text-gray-400 text-xs text-center mt-1.5 max-w-[280px]">
                  Create a budget to unlock spending insights and track your
                  progress.
                </Text>

                <Pressable
                  onPress={() => router.push("/add-budget")}
                  className="bg-blue-600 px-5 py-3 rounded-xl flex-row items-center mt-4"
                >
                  <Ionicons name="add-outline" size={17} color="#FFFFFF" />

                  <Text className="text-white font-bold text-xs ml-1.5">
                    Add Budget
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-gray-400 text-[11px]">
                      Budget used
                    </Text>

                    <Text className="text-gray-950 text-2xl font-extrabold mt-1">
                      {Math.round(spentPercentage)}%
                    </Text>
                  </View>

                  <View
                    className={`px-3 py-1.5 rounded-full ${
                      isOverBudget ? "bg-red-50" : "bg-emerald-50"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        isOverBudget ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isOverBudget ? "Over budget" : "On track"}
                    </Text>
                  </View>
                </View>

                <View className="h-3 bg-gray-100 rounded-full overflow-hidden mt-5">
                  <View
                    style={{
                      width: `${spentPercentage}%`,
                    }}
                    className={`h-full rounded-full ${
                      isOverBudget ? "bg-red-500" : "bg-blue-600"
                    }`}
                  />
                </View>

                <View className="flex-row justify-between mt-3">
                  <Text className="text-gray-400 text-[10px]">
                    ₹{totalExpenses.toLocaleString("en-IN")} spent
                  </Text>

                  <Text className="text-gray-400 text-[10px]">
                    ₹{remainingBudget.toLocaleString("en-IN")} remaining
                  </Text>
                </View>

                <View
                  className={`flex-row items-center mt-5 p-3 rounded-xl ${
                    isOverBudget ? "bg-red-50" : "bg-emerald-50"
                  }`}
                >
                  <Ionicons
                    name={
                      isOverBudget
                        ? "alert-circle-outline"
                        : "checkmark-circle-outline"
                    }
                    size={19}
                    color={isOverBudget ? "#DC2626" : "#059669"}
                  />

                  <Text
                    className={`text-xs font-medium ml-2 flex-1 ${
                      isOverBudget ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {isOverBudget
                      ? "Your spending has exceeded the current budget."
                      : "Nice work! Your spending is currently under control."}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* ====================================================
              SUBSCRIPTION CTA
          ==================================================== */}

          <View className="mb-6">
            <SubscriptionCTA />
          </View>

          <View className="mb-8">
            <FeedbackCTA />
          </View>

          {/* ====================================================
              RECENT EXPENSES
          ==================================================== */}

          <SectionHeader
            title="Recent Expenses"
            subtitle="Latest spending activity"
            action="View all"
            onAction={() => router.push("/transactions")}
          />

          <ActivityCard>
            {paginatedExpenses.length === 0 ? (
              <EmptyState
                icon="receipt-outline"
                title="No expenses yet"
                subtitle="Start tracking your spending by adding your first expense."
                buttonText="Add Expense"
                color="#DC2626"
                onPress={() => router.push("/add-expense")}
              />
            ) : (
              <>
                {paginatedExpenses.map((expense: any, index: number) => (
                  <TransactionRow
                    key={expense._id}
                    icon="receipt-outline"
                    iconColor="#DC2626"
                    iconBg="#FEF2F2"
                    title={expense.title || "Expense"}
                    subtitle={
                      expense.date
                        ? new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Recent"
                    }
                    amount={`-₹${Number(expense.amount || 0).toLocaleString(
                      "en-IN",
                    )}`}
                    amountColor="#DC2626"
                    showDivider={index < paginatedExpenses.length - 1}
                  />
                ))}

                <Pagination
                  page={expensePage}
                  totalPages={totalExpensePages}
                  onPrevious={() =>
                    setExpensePage(Math.max(expensePage - 1, 1))
                  }
                  onNext={() =>
                    setExpensePage(Math.min(expensePage + 1, totalExpensePages))
                  }
                />
              </>
            )}
          </ActivityCard>

          {/* ====================================================
              RECENT INCOME
          ==================================================== */}

          <View className="mt-6">
            <SectionHeader
              title="Recent Income"
              subtitle="Latest money received"
              action="View all"
              onAction={() => router.push("/transactions")}
            />

            <ActivityCard>
              {paginatedIncome.length === 0 ? (
                <EmptyState
                  icon="cash-outline"
                  title="No income yet"
                  subtitle="Start tracking your earnings by adding your first income."
                  buttonText="Add Income"
                  color="#059669"
                  onPress={() => router.push("/add-income")}
                />
              ) : (
                <>
                  {paginatedIncome.map((income: any, index: number) => (
                    <TransactionRow
                      key={income._id}
                      icon="arrow-down"
                      iconColor="#059669"
                      iconBg="#ECFDF5"
                      title={income.source || "Income"}
                      subtitle={
                        income.date
                          ? new Date(income.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Recent"
                      }
                      amount={`+₹${Number(income.amount || 0).toLocaleString(
                        "en-IN",
                      )}`}
                      amountColor="#059669"
                      showDivider={index < paginatedIncome.length - 1}
                    />
                  ))}

                  <Pagination
                    page={incomePage}
                    totalPages={totalIncomePages}
                    onPrevious={() =>
                      setIncomePage(Math.max(incomePage - 1, 1))
                    }
                    onNext={() =>
                      setIncomePage(Math.min(incomePage + 1, totalIncomePages))
                    }
                  />
                </>
              )}
            </ActivityCard>
          </View>

          {/* ====================================================
              SAVINGS
          ==================================================== */}

          <View className="mt-6">
            <SectionHeader
              title="Savings"
              subtitle="Building your financial future"
              action="Manage"
              onAction={() => router.push("/savings")}
            />

            <ActivityCard>
              {savings.length === 0 ? (
                <EmptyState
                  icon="leaf-outline"
                  title="No savings yet"
                  subtitle="Start building your financial future by creating your first savings goal."
                  buttonText="Add Saving"
                  color="#059669"
                  onPress={() => router.push("/add-saving")}
                />
              ) : (
                savings.slice(0, 5).map((saving: any, index: number) => (
                  <View key={saving._id}>
                    <View className="flex-row items-center py-1">
                      <View className="h-11 w-11 rounded-xl bg-emerald-50 items-center justify-center">
                        <Ionicons
                          name="leaf-outline"
                          size={19}
                          color="#059669"
                        />
                      </View>

                      <View className="flex-1 ml-3">
                        <Text
                          className="text-gray-900 font-semibold text-sm"
                          numberOfLines={1}
                        >
                          {saving.goal || "Savings Goal"}
                        </Text>

                        <Text className="text-gray-400 text-[10px] mt-1">
                          Savings contribution
                        </Text>
                      </View>

                      <Text className="text-emerald-600 font-extrabold text-sm">
                        +₹
                        {Number(saving.amount || 0).toLocaleString("en-IN")}
                      </Text>
                    </View>

                    {index < Math.min(savings.length, 5) - 1 && (
                      <View className="h-px bg-gray-100 my-3 ml-14" />
                    )}
                  </View>
                ))
              )}
            </ActivityCard>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================
          SUBSCRIPTION MODAL
      ======================================================== */}

      <SubscriptionFeatureModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </SafeAreaView>
  );
}

/* ================================================================
   QUICK ACTION
================================================================ */

function QuickAction({ icon, label, bg, iconColor, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.78} onPress={onPress} className="flex-1">
      <View className="bg-white rounded-2xl py-3.5 items-center border border-gray-100">
        <View
          className="h-9 w-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>

        <Text className="text-gray-700 text-[10px] font-semibold mt-2">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ================================================================
   SECTION HEADER
================================================================ */

function SectionHeader({ title, subtitle, action, onAction }: any) {
  return (
    <View className="flex-row items-end justify-between mb-3 px-1">
      <View className="flex-1">
        <Text className="text-gray-950 text-[17px] font-extrabold">
          {title}
        </Text>

        {subtitle && (
          <Text className="text-gray-400 text-[10px] mt-1">{subtitle}</Text>
        )}
      </View>

      {action && (
        <Pressable onPress={onAction} className="flex-row items-center">
          <Text className="text-blue-600 text-[10px] font-bold">{action}</Text>

          <Ionicons name="chevron-forward" size={12} color="#2563EB" />
        </Pressable>
      )}
    </View>
  );
}

/* ================================================================
   OVERVIEW CARD
================================================================ */

function OverviewCard({ icon, color, label, value, caption }: any) {
  return (
    <View
      className="bg-white rounded-[22px] p-4 mb-3 border border-gray-100"
      style={{
        width: "48.5%",
        shadowColor: "#111827",
        shadowOpacity: 0.035,
        shadowRadius: 12,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        elevation: 1,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View
          className="h-9 w-9 rounded-xl items-center justify-center"
          style={{
            backgroundColor: `${color}12`,
          }}
        >
          <Ionicons name={icon} size={17} color={color} />
        </View>

        <Ionicons name="ellipsis-horizontal" size={15} color="#D1D5DB" />
      </View>

      <Text className="text-gray-400 text-[10px] font-medium mt-3">
        {label}
      </Text>

      <Text
        className="text-gray-950 font-extrabold mt-1"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <Text className="text-gray-400 text-[9px] mt-1">{caption}</Text>
    </View>
  );
}

/* ================================================================
   ACTIVITY CARD
================================================================ */

function ActivityCard({ children }: any) {
  return (
    <View
      className="bg-white rounded-[26px] p-4 border border-gray-100"
      style={{
        shadowColor: "#111827",
        shadowOpacity: 0.035,
        shadowRadius: 16,
        shadowOffset: {
          width: 0,
          height: 6,
        },
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

/* ================================================================
   TRANSACTION ROW
================================================================ */

function TransactionRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  amount,
  amountColor,
  showDivider,
}: any) {
  return (
    <View>
      <View className="flex-row items-center py-2">
        <View
          className="h-11 w-11 rounded-xl items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        <View className="flex-1 ml-3 pr-3">
          <Text
            className="text-gray-900 text-sm font-semibold"
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text className="text-gray-400 text-[10px] mt-1">{subtitle}</Text>
        </View>

        <Text className="font-extrabold text-sm" style={{ color: amountColor }}>
          {amount}
        </Text>
      </View>

      {showDivider && <View className="h-px bg-gray-100 ml-14 my-2" />}
    </View>
  );
}

/* ================================================================
   PAGINATION
================================================================ */

function Pagination({ page, totalPages, onPrevious, onNext }: any) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <View className="flex-row items-center justify-between border-t border-gray-100 mt-3 pt-4">
      <Pressable
        disabled={page === 1}
        onPress={onPrevious}
        className={`h-9 px-3.5 rounded-xl flex-row items-center justify-center ${
          page === 1 ? "bg-gray-50" : "bg-blue-50"
        }`}
      >
        <Ionicons
          name="chevron-back"
          size={14}
          color={page === 1 ? "#D1D5DB" : "#2563EB"}
        />

        <Text
          className={`text-[10px] font-bold ml-1 ${
            page === 1 ? "text-gray-300" : "text-blue-600"
          }`}
        >
          Previous
        </Text>
      </Pressable>

      <View className="px-3 py-1.5 rounded-full bg-gray-50">
        <Text className="text-gray-500 text-[10px] font-semibold">
          {page} / {totalPages}
        </Text>
      </View>

      <Pressable
        disabled={page === totalPages}
        onPress={onNext}
        className={`h-9 px-3.5 rounded-xl flex-row items-center justify-center ${
          page === totalPages ? "bg-gray-50" : "bg-blue-50"
        }`}
      >
        <Text
          className={`text-[10px] font-bold mr-1 ${
            page === totalPages ? "text-gray-300" : "text-blue-600"
          }`}
        >
          Next
        </Text>

        <Ionicons
          name="chevron-forward"
          size={14}
          color={page === totalPages ? "#D1D5DB" : "#2563EB"}
        />
      </Pressable>
    </View>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({
  icon,
  title,
  subtitle,
  buttonText,
  color,
  onPress,
}: any) {
  return (
    <View className="items-center py-7 px-5">
      <View
        className="h-14 w-14 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: `${color}12`,
        }}
      >
        <Ionicons name={icon} size={25} color={color} />
      </View>

      <Text className="text-gray-900 font-bold text-sm mt-4">{title}</Text>

      <Text className="text-gray-400 text-[11px] text-center mt-1.5 leading-4">
        {subtitle}
      </Text>

      <Pressable
        onPress={onPress}
        className="px-4 py-2.5 rounded-xl flex-row items-center mt-4"
        style={{ backgroundColor: color }}
      >
        <Ionicons name="add-outline" size={16} color="#FFFFFF" />

        <Text className="text-white text-[10px] font-bold ml-1">
          {buttonText}
        </Text>
      </Pressable>
    </View>
  );
}
