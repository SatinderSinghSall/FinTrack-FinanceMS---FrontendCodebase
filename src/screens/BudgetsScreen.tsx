import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
  Modal,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect, useRouter } from "expo-router";
import api from "../services/api";
import BudgetCard from "../components/BudgetCard";
import Toast from "react-native-toast-message";

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");

  // Calendar / Date Range Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<
    "dateDesc" | "dateAsc" | "limitDesc" | "limitAsc"
  >("dateDesc");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  /* ---------------- FETCH ---------------- */

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBudgets();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`/budgets/${selectedId}`);

      Toast.show({
        type: "success",
        text1: "Budget deleted",
        text2: "The budget was removed successfully",
        position: "top",
      });

      fetchBudgets();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: "Unable to delete this budget",
        position: "top",
      });
    } finally {
      setConfirmDelete(false);
      setSelectedId(null);
    }
  };

  /* ---------------- FILTER + SEARCH + SORT ---------------- */

  const filteredBudgets = useMemo(() => {
    const filtered = budgets.filter((b) => {
      const matchesSearch = b.category
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesMonth = monthFilter === "All" || b.month === monthFilter;

      // Date Range Filtering logic
      const itemDate = new Date(b.date || b.createdAt || 0).setHours(
        0,
        0,
        0,
        0,
      );
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      let matchesDate = true;
      if (start && end) {
        matchesDate = itemDate >= start && itemDate <= end;
      } else if (start) {
        matchesDate = itemDate >= start;
      } else if (end) {
        matchesDate = itemDate <= end;
      }

      return matchesSearch && matchesMonth && matchesDate;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();

      if (sortBy === "limitDesc") return b.limit - a.limit;
      if (sortBy === "limitAsc") return a.limit - b.limit;
      if (sortBy === "dateAsc") return dateA - dateB;
      return dateB - dateA;
    });
  }, [budgets, search, monthFilter, startDate, endDate, sortBy]);

  const totalPages = Math.ceil(filteredBudgets.length / PAGE_SIZE) || 1;

  const paginatedBudgets = filteredBudgets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalAmount = filteredBudgets.reduce((sum, b) => sum + b.limit, 0);

  const months = [
    "All",
    ...Array.from(new Set(budgets.map((b) => b.month).filter(Boolean))),
  ];

  const renderRightActions = (id: string) => (
    <Pressable
      onPress={() => {
        setSelectedId(id);
        setConfirmDelete(true);
      }}
      className="bg-red-500 justify-center items-center w-24 rounded-2xl mb-3 mr-1 shadow-sm"
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text className="text-white text-xs font-bold mt-1">Delete</Text>
    </Pressable>
  );

  const renderLeftActions = (id: string) => (
    <Pressable
      onPress={() => router.push(`/edit-budget/${id}`)}
      className="bg-blue-600 justify-center items-center w-24 rounded-2xl mb-3 ml-1 shadow-sm"
    >
      <Ionicons name="pencil-outline" size={20} color="#fff" />
      <Text className="text-white text-xs font-bold mt-1">Edit</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-400 font-medium mt-3">
          Loading budgets...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* TOP HEADER */}
      <View className="flex-row items-center justify-between px-6 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center active:bg-slate-200"
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>

        <Text className="text-base font-bold text-slate-900 tracking-tight">
          Budgets
        </Text>

        <Pressable
          onPress={() => setShowFilterModal(true)}
          className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center active:bg-blue-100 border border-blue-100 relative"
        >
          <Ionicons name="options-outline" size={20} color="#2563eb" />
          {(startDate ||
            endDate ||
            monthFilter !== "All" ||
            sortBy !== "dateDesc") && (
            <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white" />
          )}
        </Pressable>
      </View>

      {/* RICH FILTER MODAL WITH CALENDAR/DATE RANGE */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[38px] px-6 pt-4 pb-12 shadow-2xl max-h-[90%]">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="items-center pt-1 pb-4">
                <View className="w-12 h-1.5 rounded-full bg-slate-300" />
              </View>

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">
                  Filter & Sort
                </Text>
                <Pressable
                  onPress={() => {
                    setSortBy("dateDesc");
                    setMonthFilter("All");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  <Text className="text-blue-600 font-bold text-xs">
                    Reset All
                  </Text>
                </Pressable>
              </View>

              {/* DATE RANGE / CALENDAR SECTION */}
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                Date Range Filter (YYYY-MM-DD)
              </Text>
              <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 flex-row items-center">
                  <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  <TextInput
                    placeholder="Start Date"
                    placeholderTextColor="#94a3b8"
                    value={startDate}
                    onChangeText={setStartDate}
                    className="ml-2.5 flex-1 text-slate-900 font-medium text-xs"
                  />
                  {startDate ? (
                    <Pressable onPress={() => setStartDate("")}>
                      <Ionicons name="close-circle" size={16} color="#94a3b8" />
                    </Pressable>
                  ) : null}
                </View>

                <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 flex-row items-center">
                  <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  <TextInput
                    placeholder="End Date"
                    placeholderTextColor="#94a3b8"
                    value={endDate}
                    onChangeText={setEndDate}
                    className="ml-2.5 flex-1 text-slate-900 font-medium text-xs"
                  />
                  {endDate ? (
                    <Pressable onPress={() => setEndDate("")}>
                      <Ionicons name="close-circle" size={16} color="#94a3b8" />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                Sort By
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {[
                  { id: "dateDesc", label: "Newest First" },
                  { id: "dateAsc", label: "Oldest First" },
                  { id: "limitDesc", label: "Highest Limit" },
                  { id: "limitAsc", label: "Lowest Limit" },
                ].map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => setSortBy(s.id as any)}
                    className={`px-4 py-2.5 rounded-xl border ${
                      sortBy === s.id
                        ? "bg-blue-600 border-blue-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${
                        sortBy === s.id ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => setShowFilterModal(false)}
                className="bg-slate-900 py-4 rounded-2xl items-center shadow-lg mt-2"
              >
                <Text className="text-white font-bold text-sm">
                  Apply Configuration
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DELETE MODAL */}
      <Modal transparent visible={confirmDelete} animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl items-center">
            <View className="w-16 h-16 rounded-2xl bg-red-100 items-center justify-center mb-4">
              <Ionicons name="trash-outline" size={28} color="#dc2626" />
            </View>
            <Text className="text-xl font-black text-slate-900 mb-2 text-center">
              Delete Budget
            </Text>
            <Text className="text-slate-500 text-sm mb-6 text-center leading-relaxed">
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </Text>

            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => setConfirmDelete(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 items-center active:bg-slate-200"
              >
                <Text className="text-slate-700 font-bold text-sm">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="flex-1 bg-red-600 py-3.5 rounded-2xl items-center shadow-md shadow-red-600/30 active:bg-red-700"
              >
                <Text className="text-white font-bold text-sm">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* BUDGET DETAILS MODAL WITH ADDED & UPDATED TIMESTAMPS */}
      <Modal visible={showDetails} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-50 rounded-t-[38px] overflow-hidden max-h-[90%] w-full shadow-2xl">
            {selectedBudget && (
              <>
                <View className="flex-row justify-end px-6 pt-5 pb-1 bg-transparent z-10">
                  <Pressable
                    onPress={() => setShowDetails(false)}
                    className="w-10 h-10 rounded-full bg-slate-200/80 items-center justify-center active:bg-slate-300"
                  >
                    <Ionicons name="close" size={20} color="#0f172a" />
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 0,
                    paddingBottom: 40,
                  }}
                >
                  <View className="items-center mt-1">
                    <View className="w-20 h-20 rounded-3xl bg-blue-600 items-center justify-center shadow-xl shadow-blue-600/30 mb-4">
                      <Ionicons name="wallet" size={36} color="white" />
                    </View>

                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Monthly Budget Limit
                    </Text>
                    <Text className="text-slate-900 text-4xl font-black mt-1">
                      ₹{selectedBudget.limit}
                    </Text>

                    <Text className="text-slate-700 text-base font-bold mt-2 text-center px-4">
                      {selectedBudget.category}
                    </Text>

                    <View className="flex-row items-center bg-blue-100 px-4 py-1.5 rounded-full mt-3">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#2563eb"
                      />
                      <Text className="text-blue-700 text-xs font-bold uppercase tracking-wider ml-1.5">
                        Active Allocation
                      </Text>
                    </View>
                  </View>

                  <View className="bg-white rounded-3xl p-5 mt-6 border border-slate-100 shadow-sm">
                    <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="grid-outline"
                            size={18}
                            color="#2563eb"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Category
                        </Text>
                      </View>
                      <Text className="text-slate-900 font-black text-base">
                        {selectedBudget.category}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-red-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="trending-down-outline"
                            size={18}
                            color="#dc2626"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Spent
                        </Text>
                      </View>
                      <Text className="text-red-600 font-black text-base">
                        ₹{selectedBudget.spent || 0}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-emerald-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="sparkles-outline"
                            size={18}
                            color="#059669"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Remaining
                        </Text>
                      </View>
                      <Text className="text-emerald-600 font-black text-base">
                        ₹{selectedBudget.limit - (selectedBudget.spent || 0)}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-orange-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#ea580c"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Month
                        </Text>
                      </View>
                      <Text className="text-slate-900 font-bold text-sm">
                        {selectedBudget.month}
                      </Text>
                    </View>

                    {/* ADDED ON TIMESTAMP */}
                    <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-sky-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color="#0284c7"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Added On
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-slate-900 font-bold text-sm">
                          {new Date(
                            selectedBudget.date ||
                              selectedBudget.createdAt ||
                              Date.now(),
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                        <Text className="text-slate-400 text-xs font-medium mt-0.5">
                          {new Date(
                            selectedBudget.date ||
                              selectedBudget.createdAt ||
                              Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* LAST UPDATED TIMESTAMP */}
                    <View className="flex-row items-center justify-between pt-3.5">
                      <View className="flex-row items-center">
                        <View className="bg-indigo-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="sync-outline"
                            size={18}
                            color="#4f46e5"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Last Updated
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-slate-900 font-bold text-sm">
                          {new Date(
                            selectedBudget.updatedAt ||
                              selectedBudget.date ||
                              selectedBudget.createdAt ||
                              Date.now(),
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                        <Text className="text-slate-400 text-xs font-medium mt-0.5">
                          {new Date(
                            selectedBudget.updatedAt ||
                              selectedBudget.date ||
                              selectedBudget.createdAt ||
                              Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* USAGE PROGRESS CARD */}
                  <View className="bg-white rounded-3xl p-5 mt-4 border border-slate-100 shadow-sm">
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-slate-500 font-medium text-sm">
                        Budget Usage
                      </Text>
                      <Text className="text-slate-900 font-black text-sm">
                        {Math.round(
                          ((selectedBudget.spent || 0) / selectedBudget.limit) *
                            100,
                        )}
                        %
                      </Text>
                    </View>

                    <View className="bg-slate-100 h-3 rounded-full overflow-hidden">
                      <View
                        style={{
                          width: `${Math.min(
                            ((selectedBudget.spent || 0) /
                              selectedBudget.limit) *
                              100,
                            100,
                          )}%`,
                        }}
                        className={`h-full rounded-full ${
                          (selectedBudget.spent || 0) / selectedBudget.limit >
                          0.8
                            ? "bg-red-500"
                            : "bg-blue-600"
                        }`}
                      />
                    </View>
                  </View>

                  <View className="flex-row mt-6 gap-4">
                    <Pressable
                      onPress={() => {
                        setShowDetails(false);
                        router.push(`/edit-budget/${selectedBudget._id}`);
                      }}
                      className="flex-1 bg-blue-600 rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-blue-600/30 active:bg-blue-700"
                    >
                      <Ionicons name="create-outline" size={18} color="white" />
                      <Text className="text-white font-bold text-sm ml-2">
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setShowDetails(false);
                        setSelectedId(selectedBudget._id);
                        setConfirmDelete(true);
                      }}
                      className="flex-1 bg-red-500 rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-red-500/30 active:bg-red-600"
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />
                      <Text className="text-white font-bold text-sm ml-2">
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MAIN UI */}
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
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isLargeScreen ? 900 : "100%",
            alignSelf: "center",
          }}
        >
          <View className="mb-5">
            <Text
              className="font-black text-slate-900 tracking-tight"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Budgets
            </Text>
            <Text className="text-slate-500 font-medium text-sm mt-0.5">
              Manage your monthly limits seamlessly
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-5 mb-5 flex-row justify-between items-center border border-slate-100 shadow-sm">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Total Allocated Limit
              </Text>
              <Text className="text-slate-900 text-2xl font-black mt-0.5">
                ₹{totalAmount}
              </Text>
            </View>
            <View className="bg-blue-50 px-3.5 py-1.5 rounded-2xl border border-blue-100">
              <Text className="text-blue-600 text-xs font-bold">
                {filteredBudgets.length} Records
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl px-4 py-3 mb-4 flex-row items-center border border-slate-100 shadow-sm">
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search budgets by category..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setPage(1);
              }}
              className="ml-3 flex-1 text-slate-900 font-medium text-sm"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-5"
          >
            {months.map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  setMonthFilter(m);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-2xl mr-2 shadow-sm ${
                  monthFilter === m
                    ? "bg-blue-600 shadow-blue-600/30"
                    : "bg-white border border-slate-100"
                }`}
              >
                <Text
                  className={`font-bold text-xs ${
                    monthFilter === m ? "text-white" : "text-slate-600"
                  }`}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => router.push("/add-budget")}
            className="bg-blue-600 py-4 rounded-2xl mb-6 flex-row items-center justify-center shadow-lg shadow-blue-600/30 active:opacity-90"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Add New Budget
            </Text>
          </Pressable>

          {paginatedBudgets.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm my-2">
              <View className="w-16 h-16 rounded-3xl bg-slate-50 items-center justify-center mb-3">
                <Ionicons name="wallet-outline" size={30} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-bold text-base mt-1">
                No matching budgets
              </Text>
              <Text className="text-slate-400 text-xs mt-1 text-center max-w-[220px] leading-relaxed">
                Try adjusting your search queries, date ranges, or filters.
              </Text>
            </View>
          ) : (
            paginatedBudgets.map((b) => (
              <Swipeable
                key={b._id}
                renderLeftActions={() => renderLeftActions(b._id)}
                renderRightActions={() => renderRightActions(b._id)}
                overshootLeft={false}
                overshootRight={false}
              >
                <BudgetCard
                  id={b._id}
                  category={b.category}
                  limit={b.limit}
                  spent={b.spent || 0}
                  onPress={() => {
                    setSelectedBudget(b);
                    setShowDetails(true);
                  }}
                />
              </Swipeable>
            ))
          )}

          {totalPages > 1 && (
            <View className="flex-row justify-between items-center mt-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <Pressable
                disabled={page === 1}
                onPress={() => setPage(page - 1)}
                className={`px-4 py-2 rounded-xl ${
                  page === 1
                    ? "opacity-40 bg-slate-50"
                    : "bg-slate-100 active:bg-slate-200"
                }`}
              >
                <Text className="text-slate-700 font-bold text-xs">
                  Previous
                </Text>
              </Pressable>

              <Text className="text-slate-500 font-bold text-xs">
                Page {page} of {totalPages}
              </Text>

              <Pressable
                disabled={page === totalPages}
                onPress={() => setPage(page + 1)}
                className={`px-4 py-2 rounded-xl ${
                  page === totalPages
                    ? "opacity-40 bg-slate-50"
                    : "bg-slate-100 active:bg-slate-200"
                }`}
              >
                <Text className="text-slate-700 font-bold text-xs">Next</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
