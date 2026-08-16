import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Pressable,
  Modal,
} from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import api from "../services/api";
import AppHeader from "../components/AppHeader";

type TransactionType = "income" | "expense";
type FilterType = "All" | "Income" | "Expense";
type ViewMode = "list" | "calendar";
type DateFilter = "all" | "today" | "week" | "month";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  type: TransactionType;
  source?: string;
  title?: string;
  category?: string;
  description?: string;
}

const PAGE_SIZE = 10;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function TransactionsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // =====================================================
  // DATA
  // =====================================================

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // SEARCH / FILTER
  // =====================================================

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const [categoryFilter, setCategoryFilter] = useState("All");

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const [filterVisible, setFilterVisible] = useState(false);

  // =====================================================
  // VIEW
  // =====================================================

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [page, setPage] = useState(1);

  // =====================================================
  // CALENDAR
  // =====================================================

  const now = new Date();

  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());

  const [calendarYear, setCalendarYear] = useState(now.getFullYear());

  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateKey(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  // =====================================================
  // FETCH
  // =====================================================

  const fetchData = async () => {
    try {
      const [expenseRes, incomeRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/income"),
      ]);

      const expenses = (expenseRes.data || []).map((item: any) => ({
        ...item,
        type: "expense",
      }));

      const income = (incomeRes.data?.data || []).map((item: any) => ({
        ...item,
        type: "income",
      }));

      const merged = [...expenses, ...income].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setTransactions(merged);
    } catch (error) {
      console.log("Transactions error:", error);
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

  // =====================================================
  // HELPERS
  // =====================================================

  function formatDateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`;
  }

  const getDateKey = (date: string) => {
    const d = new Date(date);

    return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const currency = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const transactionName = (item: Transaction) =>
    item.source || item.title || "Transaction";

  const categoryName = (item: Transaction) =>
    item.category || (item.type === "income" ? "Income" : "Expense");

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatLongDate = (dateKey: string) => {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isToday = (dateKey: string) => {
    const today = new Date();

    return (
      dateKey ===
      formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  const iconFor = (item: Transaction): any => {
    if (item.type === "income") {
      return "arrow-down";
    }

    const category = item.category?.toLowerCase() || "";

    if (category.includes("food") || category.includes("restaurant"))
      return "restaurant-outline";

    if (category.includes("transport") || category.includes("travel"))
      return "car-outline";

    if (category.includes("shopping") || category.includes("shop"))
      return "bag-handle-outline";

    if (category.includes("bill") || category.includes("utility"))
      return "receipt-outline";

    if (category.includes("health") || category.includes("medical"))
      return "medkit-outline";

    if (category.includes("entertainment")) return "game-controller-outline";

    if (category.includes("education")) return "school-outline";

    if (category.includes("home") || category.includes("rent"))
      return "home-outline";

    return "arrow-up";
  };

  // =====================================================
  // TOTALS
  // =====================================================

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [transactions],
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [transactions],
  );

  const balance = totalIncome - totalExpense;

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const values = transactions
      .map((item) => item.category)
      .filter(Boolean) as string[];

    return ["All", ...Array.from(new Set(values))];
  }, [transactions]);

  // =====================================================
  // DATE FILTER
  // =====================================================

  const matchesDateFilter = (dateString: string) => {
    if (dateFilter === "all") {
      return true;
    }

    const transactionDate = new Date(dateString);

    const today = new Date();

    if (dateFilter === "today") {
      return transactionDate.toDateString() === today.toDateString();
    }

    if (dateFilter === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      start.setHours(0, 0, 0, 0);

      return transactionDate >= start;
    }

    if (dateFilter === "month") {
      return (
        transactionDate.getMonth() === today.getMonth() &&
        transactionDate.getFullYear() === today.getFullYear()
      );
    }

    return true;
  };

  // =====================================================
  // FILTERED TRANSACTIONS
  // =====================================================

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesType =
        filter === "All" || item.type === filter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const text = [item.source, item.title, item.category, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || text.includes(query);

      const matchesDate = matchesDateFilter(item.date);

      return matchesType && matchesCategory && matchesSearch && matchesDate;
    });
  }, [transactions, filter, categoryFilter, search, dateFilter]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  const firstItem =
    filteredTransactions.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    currentPage * PAGE_SIZE,
    filteredTransactions.length,
  );

  // =====================================================
  // CALENDAR DATA
  // =====================================================

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();

    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [calendarMonth, calendarYear]);

  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};

    transactions.forEach((item) => {
      const key = getDateKey(item.date);

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(item);
    });

    return map;
  }, [transactions]);

  const selectedDateTransactions = useMemo(() => {
    return (transactionsByDate[selectedDate] || []).filter((item) => {
      const matchesType =
        filter === "All" || item.type === filter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesType && matchesCategory;
    });
  }, [transactionsByDate, selectedDate, filter, categoryFilter]);

  // =====================================================
  // CALENDAR NAVIGATION
  // =====================================================

  const previousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();

    setCalendarMonth(today.getMonth());

    setCalendarYear(today.getFullYear());

    setSelectedDate(
      formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  };

  // =====================================================
  // FILTER ACTIONS
  // =====================================================

  const changeFilter = (value: FilterType) => {
    setFilter(value);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilter("All");
    setCategoryFilter("All");
    setDateFilter("all");
    setSearch("");
    setPage(1);
  };

  const activeFilterCount =
    (filter !== "All" ? 1 : 0) +
    (categoryFilter !== "All" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F6F7FB]">
        <View className="flex-1 items-center justify-center px-8">
          {/* PREMIUM LOADER */}
          <View className="items-center justify-center">
            {/* Outer glow */}
            <View className="absolute h-32 w-32 rounded-full bg-blue-100/40" />

            {/* Outer loading ring */}
            <View className="h-28 w-28 rounded-full border-[3px] border-blue-100 items-center justify-center">
              {/* Inner blue ring */}
              <View
                className="h-24 w-24 rounded-full border-[3px] border-blue-500 border-t-transparent border-r-transparent items-center justify-center"
                style={{
                  shadowColor: "#2563EB",
                  shadowOpacity: 0.25,
                  shadowRadius: 15,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  elevation: 6,
                }}
              >
                {/* Wallet */}
                <View className="h-16 w-16 rounded-[22px] bg-blue-600 items-center justify-center">
                  <Ionicons name="wallet-outline" size={30} color="#FFFFFF" />

                  {/* Small status dot */}
                  <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-blue-600" />
                </View>
              </View>
            </View>

            {/* Floating dots */}
            <View className="absolute -right-1 top-2 h-3 w-3 rounded-full bg-blue-400" />
            <View className="absolute -left-1 bottom-5 h-2 w-2 rounded-full bg-blue-200" />
          </View>

          {/* TITLE */}
          <Text className="text-gray-900 text-[18px] font-bold mt-8">
            Loading your transactions
          </Text>

          {/* SUBTITLE */}
          <Text className="text-gray-400 text-[13px] text-center mt-2 leading-5">
            We're preparing your financial activity
          </Text>

          {/* LOADING DOTS */}
          <View className="flex-row items-center mt-5">
            <View className="h-2 w-2 rounded-full bg-blue-600" />

            <View className="h-2 w-2 rounded-full bg-blue-400 mx-2" />

            <View className="h-2 w-2 rounded-full bg-blue-200" />
          </View>

          {/* STATUS */}
          <View className="flex-row items-center mt-6 px-4 py-2.5 rounded-full bg-white border border-gray-100">
            <Ionicons name="sync-outline" size={13} color="#2563EB" />

            <Text className="text-gray-500 text-[10px] font-medium ml-2">
              Syncing your latest activity
            </Text>
          </View>

          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={{
              marginLeft: 8,
              marginTop: 20,
              transform: [{ scale: 1.5 }],
            }}
          />
        </View>

        {/* BOTTOM BRANDING */}
        <View className="items-center pb-8">
          <View className="flex-row items-center">
            <View className="h-7 w-7 rounded-lg bg-blue-50 items-center justify-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#2563EB"
              />
            </View>

            <View className="ml-2">
              <Text className="text-gray-700 text-[10px] font-semibold">
                FinTrack
              </Text>

              <Text className="text-gray-400 text-[9px]">
                Your finances, securely organized
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <SafeAreaView className="flex-1 bg-[#F6F7FB]">
      <AppHeader
        title="Transactions"
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
          paddingBottom: 125,
        }}
      >
        {/* ================================================= */}
        {/* BALANCE HERO */}
        {/* ================================================= */}

        <View className="mx-4 mt-4">
          <View
            className="bg-blue-600 rounded-[28px] overflow-hidden"
            style={{
              elevation: 8,
              shadowColor: "#2563EB",
              shadowOpacity: 0.2,
              shadowRadius: 18,
              shadowOffset: {
                width: 0,
                height: 8,
              },
            }}
          >
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

            <View className="absolute right-8 -bottom-24 h-40 w-40 rounded-full bg-white/5" />

            <View className="px-5 pt-5 pb-5">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-blue-100 text-xs font-medium">
                    TOTAL BALANCE
                  </Text>

                  <Text className="text-white text-[34px] font-bold mt-1">
                    {currency(balance)}
                  </Text>
                </View>

                <View className="h-11 w-11 rounded-2xl bg-white/15 items-center justify-center">
                  <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
                </View>
              </View>

              <View className="flex-row mt-5">
                <View className="flex-1 mr-1.5 rounded-2xl bg-white/10 p-3">
                  <View className="flex-row items-center">
                    <View className="h-7 w-7 rounded-full bg-green-400/20 items-center justify-center">
                      <Ionicons name="trending-up" size={14} color="#86EFAC" />
                    </View>

                    <Text className="text-blue-100 text-xs ml-2">Income</Text>
                  </View>

                  <Text className="text-white font-bold text-base mt-2">
                    {currency(totalIncome)}
                  </Text>
                </View>

                <View className="flex-1 ml-1.5 rounded-2xl bg-white/10 p-3">
                  <View className="flex-row items-center">
                    <View className="h-7 w-7 rounded-full bg-red-400/20 items-center justify-center">
                      <Ionicons
                        name="trending-down"
                        size={14}
                        color="#FCA5A5"
                      />
                    </View>

                    <Text className="text-blue-100 text-xs ml-2">Expenses</Text>
                  </View>

                  <Text className="text-white font-bold text-base mt-2">
                    {currency(totalExpense)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* SEARCH + FILTER */}
        {/* ================================================= */}

        <View className="mx-4 mt-5 flex-row">
          <View
            className="flex-1 h-14 bg-white rounded-2xl px-3 flex-row items-center border border-gray-100"
            style={{
              elevation: 2,
            }}
          >
            <View className="h-10 w-10 rounded-xl bg-gray-50 items-center justify-center">
              <Ionicons name="search-outline" size={19} color="#6B7280" />
            </View>

            <TextInput
              value={search}
              onChangeText={changeSearch}
              placeholder="Search transactions..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2.5 text-gray-900 text-[15px]"
            />

            {search.length > 0 && (
              <Pressable onPress={() => changeSearch("")} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => setFilterVisible(true)}
            className="h-14 w-14 bg-white rounded-2xl ml-2 items-center justify-center border border-gray-100"
            style={{
              elevation: 2,
            }}
          >
            <Ionicons name="options-outline" size={21} color="#2563EB" />

            {activeFilterCount > 0 && (
              <View className="absolute -right-1 -top-1 h-5 min-w-[20px] px-1 rounded-full bg-blue-600 items-center justify-center border-2 border-[#F6F7FB]">
                <Text className="text-white text-[9px] font-bold">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ================================================= */}
        {/* VIEW SWITCHER */}
        {/* ================================================= */}

        <View className="mx-4 mt-4">
          <View className="flex-row bg-gray-200/70 p-1 rounded-2xl">
            <Pressable
              onPress={() => setViewMode("list")}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                viewMode === "list" ? "bg-white" : ""
              }`}
              style={
                viewMode === "list"
                  ? {
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={viewMode === "list" ? "#2563EB" : "#6B7280"}
              />

              <Text
                className={`ml-1.5 text-xs font-bold ${
                  viewMode === "list" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Transactions
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setViewMode("calendar")}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                viewMode === "calendar" ? "bg-white" : ""
              }`}
              style={
                viewMode === "calendar"
                  ? {
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={viewMode === "calendar" ? "#2563EB" : "#6B7280"}
              />

              <Text
                className={`ml-1.5 text-xs font-bold ${
                  viewMode === "calendar" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Calendar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <View className="mx-4 mt-6">
          <Text className="text-gray-900 text-lg font-bold">Quick Actions</Text>

          <Text className="text-gray-400 text-xs mt-0.5 mb-3">
            Manage your money
          </Text>

          <View className="flex-row">
            <QuickAction
              icon="arrow-up"
              iconColor="#DC2626"
              bg="bg-red-50"
              title="Expense"
              subtitle="Add spending"
              onPress={() => router.push("/add-expense")}
            />

            <QuickAction
              icon="arrow-down"
              iconColor="#16A34A"
              bg="bg-green-50"
              title="Income"
              subtitle="Add earnings"
              onPress={() => router.push("/add-income")}
              right
            />
          </View>

          <View className="flex-row mt-3">
            <QuickAction
              icon="wallet-outline"
              iconColor="#2563EB"
              bg="bg-blue-50"
              title="Budget"
              subtitle="Plan spending"
              onPress={() => router.push("/add-budget")}
            />

            <QuickAction
              icon="leaf-outline"
              iconColor="#059669"
              bg="bg-emerald-50"
              title="Savings"
              subtitle="Build goals"
              onPress={() => router.push("/add-saving")}
              right
            />
          </View>
        </View>

        {/* 🚀 QUICK ACTION BUTTONS */}
        <View className="px-4 mt-3">
          <View className="flex-row justify-between gap-3">
            {/* 💸 EXPENSE BUTTON */}
            <View className="flex-1">
              <Text
                onPress={() => router.push("/expenses")}
                className="bg-red-500 py-3 rounded-2xl text-white text-center font-semibold flex-row"
              >
                <Ionicons name="arrow-up" size={16} color="white" /> Expense
              </Text>
            </View>

            {/* 💰 INCOME BUTTON */}
            <View className="flex-1">
              <Text
                onPress={() => router.push("/income")}
                className="bg-green-500 py-3 rounded-2xl text-white text-center font-semibold"
              >
                <Ionicons name="arrow-down" size={16} color="white" /> Income
              </Text>
            </View>
          </View>

          {/* 💳 BUDGET BUTTON */}
          <Pressable
            onPress={() => router.push("/budgets")}
            className="w-full mt-4 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="wallet-outline" size={18} color="#fff" />

            <Text className="text-white font-semibold ml-2">Add Budget</Text>
          </Pressable>

          {/* 💚 SAVINGS BUTTON */}
          <Pressable
            onPress={() => router.push("/savings")}
            className="w-full mt-3 bg-emerald-600 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="leaf-outline" size={18} color="#fff" />

            <Text className="text-white font-semibold ml-2">Add Savings</Text>
          </Pressable>
        </View>

        {/* ================================================= */}
        {/* LIST MODE */}
        {/* ================================================= */}

        {viewMode === "list" && (
          <>
            <View className="mx-4 mt-7 flex-row items-end justify-between">
              <View>
                <Text className="text-gray-900 text-xl font-bold">
                  Recent Activity
                </Text>

                <Text className="text-gray-400 text-xs mt-1">
                  {filteredTransactions.length}{" "}
                  {filteredTransactions.length === 1
                    ? "transaction"
                    : "transactions"}
                </Text>
              </View>

              {filteredTransactions.length > 0 && (
                <View className="bg-white border border-gray-100 rounded-xl px-3 py-2">
                  <Text className="text-gray-500 text-[11px] font-semibold">
                    {firstItem}–{lastItem}
                  </Text>
                </View>
              )}
            </View>

            <View className="mx-4 mt-3">
              {paginatedTransactions.length === 0 ? (
                <EmptyState
                  search={search}
                  onAdd={() => router.push("/add-expense")}
                />
              ) : (
                <View
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100"
                  style={{
                    elevation: 2,
                  }}
                >
                  {paginatedTransactions.map((item, index) => (
                    <TransactionRow
                      key={item._id}
                      item={item}
                      last={index === paginatedTransactions.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* PAGINATION */}

            {filteredTransactions.length > PAGE_SIZE && (
              <View className="mx-4 mt-5">
                <View className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-400 text-[11px]">
                      Showing{" "}
                      <Text className="text-gray-700 font-bold">
                        {firstItem}–{lastItem}
                      </Text>{" "}
                      of{" "}
                      <Text className="text-gray-700 font-bold">
                        {filteredTransactions.length}
                      </Text>
                    </Text>

                    <Text className="text-gray-400 text-[11px]">
                      Page{" "}
                      <Text className="text-gray-700 font-bold">
                        {currentPage}
                      </Text>{" "}
                      / {totalPages}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Pressable
                      disabled={currentPage === 1}
                      onPress={() => setPage((value) => Math.max(1, value - 1))}
                      className={`h-10 w-10 rounded-xl items-center justify-center ${
                        currentPage === 1 ? "bg-gray-100" : "bg-blue-50"
                      }`}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={17}
                        color={currentPage === 1 ? "#D1D5DB" : "#2563EB"}
                      />
                    </Pressable>

                    <View className="flex-row items-center">
                      {Array.from({
                        length: Math.min(totalPages, 5),
                      }).map((_, index) => {
                        let number = index + 1;

                        if (totalPages > 5 && currentPage > 3) {
                          number = currentPage - 2 + index;

                          if (number > totalPages) {
                            number = totalPages - 4 + index;
                          }
                        }

                        const active = number === currentPage;

                        return (
                          <Pressable
                            key={number}
                            onPress={() => setPage(number)}
                            className={`h-9 min-w-[36px] rounded-xl items-center justify-center mx-0.5 ${
                              active ? "bg-blue-600" : ""
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                active ? "text-white" : "text-gray-500"
                              }`}
                            >
                              {number}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Pressable
                      disabled={currentPage === totalPages}
                      onPress={() =>
                        setPage((value) => Math.min(totalPages, value + 1))
                      }
                      className={`h-10 w-10 rounded-xl items-center justify-center ${
                        currentPage === totalPages
                          ? "bg-gray-100"
                          : "bg-blue-50"
                      }`}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={
                          currentPage === totalPages ? "#D1D5DB" : "#2563EB"
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* ================================================= */}
        {/* CALENDAR MODE */}
        {/* ================================================= */}

        {viewMode === "calendar" && (
          <View className="mx-4 mt-7">
            {/* CALENDAR CARD */}

            <View
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
              style={{
                elevation: 2,
              }}
            >
              {/* CALENDAR HEADER */}

              <View className="px-5 pt-5">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-gray-900 text-xl font-bold">
                      {MONTHS[calendarMonth]}
                    </Text>

                    <Text className="text-gray-400 text-xs mt-1">
                      {calendarYear}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Pressable
                      onPress={goToToday}
                      className="px-3 py-2 rounded-xl bg-blue-50 mr-2"
                    >
                      <Text className="text-blue-600 text-xs font-bold">
                        Today
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={previousMonth}
                      className="h-10 w-10 rounded-xl bg-gray-50 items-center justify-center"
                    >
                      <Ionicons name="chevron-back" size={17} color="#374151" />
                    </Pressable>

                    <Pressable
                      onPress={nextMonth}
                      className="h-10 w-10 rounded-xl bg-gray-50 items-center justify-center ml-2"
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#374151"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* WEEK DAYS */}

                <View className="flex-row mt-6 mb-2">
                  {WEEK_DAYS.map((day, index) => (
                    <View
                      key={`${day}-${index}`}
                      className="flex-1 items-center"
                    >
                      <Text className="text-gray-400 text-[10px] font-bold">
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CALENDAR GRID */}

                <View className="flex-row flex-wrap">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={{
                            width: "14.2857%",
                            height: 54,
                          }}
                        />
                      );
                    }

                    const dateKey = formatDateKey(
                      calendarYear,
                      calendarMonth,
                      day,
                    );

                    const dayTransactions = transactionsByDate[dateKey] || [];

                    const hasTransactions = dayTransactions.length > 0;

                    const hasIncome = dayTransactions.some(
                      (item) => item.type === "income",
                    );

                    const hasExpense = dayTransactions.some(
                      (item) => item.type === "expense",
                    );

                    const selected = selectedDate === dateKey;

                    const today = isToday(dateKey);

                    return (
                      <Pressable
                        key={dateKey}
                        onPress={() => setSelectedDate(dateKey)}
                        style={{
                          width: "14.2857%",
                          height: 54,
                        }}
                        className="items-center justify-center"
                      >
                        <View
                          className={`h-10 w-10 rounded-2xl items-center justify-center ${
                            selected ? "bg-blue-600" : today ? "bg-blue-50" : ""
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              selected
                                ? "text-white"
                                : today
                                  ? "text-blue-600"
                                  : "text-gray-700"
                            }`}
                          >
                            {day}
                          </Text>

                          {hasTransactions && (
                            <View className="flex-row mt-1">
                              {hasIncome && (
                                <View
                                  className={`h-1 w-1 rounded-full mr-0.5 ${
                                    selected ? "bg-green-200" : "bg-green-500"
                                  }`}
                                />
                              )}

                              {hasExpense && (
                                <View
                                  className={`h-1 w-1 rounded-full ${
                                    selected ? "bg-red-200" : "bg-red-500"
                                  }`}
                                />
                              )}
                            </View>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* CALENDAR LEGEND */}

              <View className="px-5 py-4 mt-2 border-t border-gray-100">
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-green-500" />

                  <Text className="text-gray-400 text-[10px] ml-1.5">
                    Income
                  </Text>

                  <View className="h-2 w-2 rounded-full bg-red-500 ml-4" />

                  <Text className="text-gray-400 text-[10px] ml-1.5">
                    Expense
                  </Text>

                  <View className="h-2 w-2 rounded-full bg-blue-600 ml-4" />

                  <Text className="text-gray-400 text-[10px] ml-1.5">
                    Selected
                  </Text>
                </View>
              </View>
            </View>

            {/* ================================================= */}
            {/* SELECTED DATE */}
            {/* ================================================= */}

            <View className="mt-5">
              <View className="flex-row items-end justify-between mb-3">
                <View>
                  <Text className="text-gray-900 text-xl font-bold">
                    {isToday(selectedDate)
                      ? "Today"
                      : formatLongDate(selectedDate)}
                  </Text>

                  <Text className="text-gray-400 text-xs mt-1">
                    {selectedDateTransactions.length}{" "}
                    {selectedDateTransactions.length === 1
                      ? "transaction"
                      : "transactions"}
                  </Text>
                </View>

                {selectedDateTransactions.length > 0 && (
                  <View className="bg-white rounded-xl border border-gray-100 px-3 py-2">
                    <Text className="text-gray-500 text-[11px] font-bold">
                      {currency(
                        selectedDateTransactions.reduce(
                          (sum, item) =>
                            item.type === "expense"
                              ? sum + Number(item.amount)
                              : sum,
                          0,
                        ),
                      )}{" "}
                      spent
                    </Text>
                  </View>
                )}
              </View>

              {/* DATE TRANSACTIONS */}

              {selectedDateTransactions.length === 0 ? (
                <View className="bg-white rounded-3xl border border-gray-100 py-12 px-6 items-center">
                  <View className="h-14 w-14 rounded-2xl bg-gray-50 items-center justify-center">
                    <Ionicons
                      name="calendar-clear-outline"
                      size={26}
                      color="#9CA3AF"
                    />
                  </View>

                  <Text className="text-gray-900 font-bold mt-4">
                    No transactions
                  </Text>

                  <Text className="text-gray-400 text-xs text-center mt-1.5">
                    Nothing was recorded on this date.
                  </Text>
                </View>
              ) : (
                <View
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100"
                  style={{
                    elevation: 2,
                  }}
                >
                  {selectedDateTransactions.map((item, index) => (
                    <TransactionRow
                      key={item._id}
                      item={item}
                      last={index === selectedDateTransactions.length - 1}
                      showTime
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================================================= */}
      {/* FILTER MODAL */}
      {/* ================================================= */}

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[32px] px-5 pt-3 pb-8 max-h-[88%]">
            {/* HANDLE */}

            <View className="items-center mb-5">
              <View className="h-1.5 w-12 rounded-full bg-gray-200" />
            </View>

            {/* HEADER */}

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-900 text-xl font-bold">Filters</Text>

                <Text className="text-gray-400 text-xs mt-1">
                  Refine your transactions
                </Text>
              </View>

              <Pressable
                onPress={() => setFilterVisible(false)}
                className="h-10 w-10 rounded-xl bg-gray-50 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
              {/* TRANSACTION TYPE */}

              <Text className="text-gray-900 font-bold text-sm mb-3">
                Transaction Type
              </Text>

              <View className="flex-row">
                {["All", "Income", "Expense"].map((value) => {
                  const active = filter === value;

                  return (
                    <Pressable
                      key={value}
                      onPress={() => changeFilter(value as FilterType)}
                      className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                        active
                          ? "bg-blue-600"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          active ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* CATEGORY */}

              <Text className="text-gray-900 font-bold text-sm mt-6 mb-3">
                Category
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => {
                  const active = categoryFilter === category;

                  return (
                    <Pressable
                      key={category}
                      onPress={() => {
                        setCategoryFilter(category);
                        setPage(1);
                      }}
                      className={`px-4 py-2.5 rounded-full mr-2 ${
                        active
                          ? "bg-blue-600"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* DATE */}

              <Text className="text-gray-900 font-bold text-sm mt-6 mb-3">
                Date
              </Text>

              <View className="flex-row flex-wrap">
                {[
                  {
                    key: "all",
                    label: "All Time",
                  },
                  {
                    key: "today",
                    label: "Today",
                  },
                  {
                    key: "week",
                    label: "This Week",
                  },
                  {
                    key: "month",
                    label: "This Month",
                  },
                ].map((item) => {
                  const active = dateFilter === item.key;

                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => {
                        setDateFilter(item.key as DateFilter);
                        setPage(1);
                      }}
                      className={`w-[48%] py-3 rounded-xl mb-2 mr-[2%] items-center ${
                        active
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          active ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* APPLY */}

              <Pressable
                onPress={() => setFilterVisible(false)}
                className="bg-blue-600 rounded-2xl py-4 items-center mt-5"
              >
                <Text className="text-white font-bold text-sm">
                  Apply Filters
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  clearFilters();
                  setFilterVisible(false);
                }}
                className="py-4 items-center"
              >
                <Text className="text-gray-500 font-semibold text-sm">
                  Clear All Filters
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================= */}
      {/* FLOATING ACTION */}
      {/* ================================================= */}

      <Pressable
        onPress={() => router.push("/add-expense")}
        className="absolute bottom-7 right-5 h-14 w-14 rounded-full bg-blue-600 items-center justify-center"
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 5,
          },
        })}
      >
        <Ionicons name="add" size={29} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

// =======================================================
// QUICK ACTION COMPONENT
// =======================================================

function QuickAction({
  icon,
  iconColor,
  bg,
  title,
  subtitle,
  onPress,
  right = false,
}: {
  icon: any;
  iconColor: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  right?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 bg-white rounded-2xl p-3.5 border border-gray-100 ${
        right ? "ml-1.5" : "mr-1.5"
      }`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View className="flex-row justify-between items-center">
        <View
          className={`h-10 w-10 rounded-xl items-center justify-center ${bg}`}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
      </View>

      <Text className="text-gray-900 font-bold text-xs mt-3">{title}</Text>

      <Text className="text-gray-400 text-[10px] mt-1">{subtitle}</Text>
    </Pressable>
  );
}

// =======================================================
// TRANSACTION ROW
// =======================================================

function TransactionRow({
  item,
  last,
  showTime = false,
}: {
  item: Transaction;
  last: boolean;
  showTime?: boolean;
}) {
  const router = useRouter();

  const income = item.type === "income";

  const currency = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const category = item.category || (income ? "Income" : "Expense");

  const name = item.source || item.title || "Transaction";

  const icon = income ? "arrow-down" : getIcon(item);

  return (
    <Pressable
      onPress={() => {
        // Ready for transaction details.
      }}
      className={`px-4 py-4 ${!last ? "border-b border-gray-100" : ""}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View className="flex-row items-center">
        {/* ICON */}

        <View
          className={`h-12 w-12 rounded-2xl items-center justify-center ${
            income ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={income ? "#16A34A" : "#DC2626"}
          />
        </View>

        {/* DETAILS */}

        <View className="flex-1 ml-3">
          <Text
            className="text-gray-900 text-[15px] font-bold"
            numberOfLines={1}
          >
            {name}
          </Text>

          <View className="flex-row items-center mt-1">
            <Text className="text-gray-400 text-xs" numberOfLines={1}>
              {category}
            </Text>

            <View className="h-1 w-1 rounded-full bg-gray-300 mx-2" />

            <Text className="text-gray-400 text-xs">
              {showTime
                ? new Date(item.date).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : new Date(item.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
            </Text>
          </View>
        </View>

        {/* AMOUNT */}

        <View className="items-end">
          <Text
            className={`text-[15px] font-bold ${
              income ? "text-green-600" : "text-gray-900"
            }`}
          >
            {income ? "+" : "-"}
            {currency(item.amount)}
          </Text>

          <Text
            className={`text-[9px] font-bold mt-1 ${
              income ? "text-green-500" : "text-gray-400"
            }`}
          >
            {income ? "RECEIVED" : "SPENT"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={15}
          color="#D1D5DB"
          style={{
            marginLeft: 8,
          }}
        />
      </View>
    </Pressable>
  );
}

// =======================================================
// EMPTY STATE
// =======================================================

function EmptyState({ search, onAdd }: { search: string; onAdd: () => void }) {
  return (
    <View className="bg-white rounded-3xl border border-gray-100 py-16 px-6 items-center">
      <View className="h-16 w-16 rounded-3xl bg-blue-50 items-center justify-center">
        <Ionicons name="receipt-outline" size={30} color="#2563EB" />
      </View>

      <Text className="text-gray-900 text-base font-bold mt-4">
        No transactions found
      </Text>

      <Text className="text-gray-400 text-sm text-center mt-1.5">
        {search
          ? "Try another search or clear your search."
          : "Your financial activity will appear here."}
      </Text>

      {!search && (
        <Pressable
          onPress={onAdd}
          className="mt-5 bg-blue-600 px-5 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Add Expense</Text>
        </Pressable>
      )}
    </View>
  );
}

// =======================================================
// CATEGORY ICON
// =======================================================

function getIcon(item: Transaction): any {
  const category = item.category?.toLowerCase() || "";

  if (category.includes("food") || category.includes("restaurant"))
    return "restaurant-outline";

  if (category.includes("transport") || category.includes("travel"))
    return "car-outline";

  if (category.includes("shopping") || category.includes("shop"))
    return "bag-handle-outline";

  if (category.includes("bill") || category.includes("utility"))
    return "receipt-outline";

  if (category.includes("health") || category.includes("medical"))
    return "medkit-outline";

  if (category.includes("entertainment")) return "game-controller-outline";

  if (category.includes("education")) return "school-outline";

  if (category.includes("home") || category.includes("rent"))
    return "home-outline";

  return "arrow-up";
}
