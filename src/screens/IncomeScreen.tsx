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
import IncomeItem from "../components/IncomeItem";
import Toast from "react-native-toast-message";

export default function IncomeScreen() {
  const [incomeList, setIncomeList] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIncome, setSelectedIncome] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<
    "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc"
  >("dateDesc");
  const [dateRangeFilter, setDateRangeFilter] = useState<
    "all" | "thisMonth" | "last30Days"
  >("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  /* ---------------- FETCH ---------------- */

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await api.get("/income");
      setIncomeList(res.data.data || res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncome();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncome();
    setRefreshing(false);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`/income/${selectedId}`);

      Toast.show({
        type: "success",
        text1: "Income deleted",
        text2: "The income record was removed successfully",
        position: "top",
      });

      fetchIncome();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: "Unable to delete this income record",
        position: "top",
      });
    } finally {
      setConfirmDelete(false);
      setSelectedId(null);
    }
  };

  /* ---------------- FILTER + SEARCH + SORT ---------------- */

  const filteredIncome = useMemo(() => {
    const now = new Date();

    const filtered = incomeList.filter((i) => {
      const matchesSearch = (i.source || i.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSource = sourceFilter === "All" || i.source === sourceFilter;

      let matchesDate = true;
      const incomeDate = new Date(i.date);

      if (selectedCalendarDay) {
        const incomeDayStr = incomeDate.toISOString().split("T")[0];
        matchesDate = incomeDayStr === selectedCalendarDay;
      } else {
        if (dateRangeFilter === "thisMonth") {
          matchesDate =
            incomeDate.getMonth() === now.getMonth() &&
            incomeDate.getFullYear() === now.getFullYear();
        } else if (dateRangeFilter === "last30Days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = incomeDate >= thirtyDaysAgo;
        }
      }

      return matchesSearch && matchesSource && matchesDate;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "amountDesc") return b.amount - a.amount;
      if (sortBy === "amountAsc") return a.amount - b.amount;
      if (sortBy === "dateAsc")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [
    incomeList,
    search,
    sourceFilter,
    sortBy,
    dateRangeFilter,
    selectedCalendarDay,
  ]);

  /* ---------------- CALENDAR GRID GENERATOR ---------------- */

  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateString: null });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const formattedMonth = String(month + 1).padStart(2, "0");
      const formattedDay = String(d).padStart(2, "0");
      const dateString = `${year}-${formattedMonth}-${formattedDay}`;
      days.push({ dayNum: d, dateString });
    }

    return days;
  }, [currentCalendarDate]);

  const totalPages = Math.ceil(filteredIncome.length / PAGE_SIZE) || 1;

  const paginatedIncome = filteredIncome.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalAmount = filteredIncome.reduce((sum, i) => sum + i.amount, 0);

  const sources = [
    "All",
    ...Array.from(new Set(incomeList.map((i) => i.source))),
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
      onPress={() => router.push(`/edit-income/${id}`)}
      className="bg-blue-600 justify-center items-center w-24 rounded-2xl mb-3 ml-1 shadow-sm"
    >
      <Ionicons name="pencil-outline" size={20} color="#fff" />
      <Text className="text-white text-xs font-bold mt-1">Edit</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-slate-400 font-medium mt-3">
          Loading income records...
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
          Incomes
        </Text>

        <Pressable
          onPress={() => setShowFilterModal(true)}
          className="w-10 h-10 rounded-2xl bg-green-50 items-center justify-center active:bg-green-100 border border-green-100"
        >
          <Ionicons name="options-outline" size={20} color="#16a34a" />
        </Pressable>
      </View>

      {/* RICH FILTER MODAL */}
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
                  Filters & Views
                </Text>
                <Pressable
                  onPress={() => {
                    setSortBy("dateDesc");
                    setDateRangeFilter("all");
                    setSelectedCalendarDay(null);
                    setViewMode("list");
                  }}
                >
                  <Text className="text-green-600 font-bold text-xs">
                    Reset All
                  </Text>
                </Pressable>
              </View>

              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                Display Mode
              </Text>
              <View className="flex-row gap-2 mb-6">
                <Pressable
                  onPress={() => setViewMode("list")}
                  className={`flex-1 py-3 rounded-xl border items-center flex-row justify-center ${
                    viewMode === "list"
                      ? "bg-green-600 border-green-600"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Ionicons
                    name="list-outline"
                    size={16}
                    color={viewMode === "list" ? "#fff" : "#334155"}
                  />
                  <Text
                    className={`font-bold text-xs ml-2 ${
                      viewMode === "list" ? "text-white" : "text-slate-700"
                    }`}
                  >
                    List View
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setViewMode("calendar")}
                  className={`flex-1 py-3 rounded-xl border items-center flex-row justify-center ${
                    viewMode === "calendar"
                      ? "bg-green-600 border-green-600"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={viewMode === "calendar" ? "#fff" : "#334155"}
                  />
                  <Text
                    className={`font-bold text-xs ml-2 ${
                      viewMode === "calendar" ? "text-white" : "text-slate-700"
                    }`}
                  >
                    Calendar View
                  </Text>
                </Pressable>
              </View>

              {viewMode === "calendar" && (
                <View className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Pressable
                      onPress={() =>
                        setCurrentCalendarDate(
                          new Date(
                            currentCalendarDate.getFullYear(),
                            currentCalendarDate.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-white items-center justify-center border border-slate-200"
                    >
                      <Ionicons name="chevron-back" size={16} color="#0f172a" />
                    </Pressable>
                    <Text className="font-bold text-slate-900 text-sm">
                      {currentCalendarDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setCurrentCalendarDate(
                          new Date(
                            currentCalendarDate.getFullYear(),
                            currentCalendarDate.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-white items-center justify-center border border-slate-200"
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#0f172a"
                      />
                    </Pressable>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <Text
                        key={d}
                        style={{ width: "14.28%" }}
                        className="text-center text-[10px] font-bold text-slate-400"
                      >
                        {d}
                      </Text>
                    ))}
                  </View>

                  <View className="flex-row flex-wrap">
                    {calendarDays.map((item, index) => {
                      if (!item.dayNum)
                        return (
                          <View
                            key={index}
                            style={{ width: "14.28%", aspectRatio: 1 }}
                            className="p-1"
                          />
                        );

                      const hasIncomeOnDay = incomeList.some((i) =>
                        i.date?.startsWith(item.dateString),
                      );
                      const isSelected =
                        selectedCalendarDay === item.dateString;

                      return (
                        <View
                          key={index}
                          style={{ width: "14.28%", aspectRatio: 1 }}
                          className="p-0.5"
                        >
                          <Pressable
                            onPress={() => {
                              setSelectedCalendarDay(
                                isSelected ? null : item.dateString,
                              );
                              setShowFilterModal(false);
                            }}
                            style={{ flex: 1 }}
                            className={`items-center justify-center rounded-xl relative ${
                              isSelected
                                ? "bg-green-600 shadow-sm"
                                : hasIncomeOnDay
                                  ? "bg-green-100 border border-green-300"
                                  : "bg-white border border-slate-100"
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected
                                  ? "text-white"
                                  : hasIncomeOnDay
                                    ? "text-green-700"
                                    : "text-slate-700"
                              }`}
                            >
                              {item.dayNum}
                            </Text>
                            {hasIncomeOnDay && !isSelected && (
                              <View className="absolute bottom-1.5 w-1 h-1 rounded-full bg-green-600" />
                            )}
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                  {selectedCalendarDay && (
                    <Pressable
                      onPress={() => setSelectedCalendarDay(null)}
                      className="mt-4 py-2.5 bg-white rounded-xl border border-slate-200 items-center shadow-sm"
                    >
                      <Text className="text-xs font-bold text-green-600">
                        Clear Selected Date Filter
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                Sort By
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {[
                  { id: "dateDesc", label: "Newest First" },
                  { id: "dateAsc", label: "Oldest First" },
                  { id: "amountDesc", label: "Highest Amount" },
                  { id: "amountAsc", label: "Lowest Amount" },
                ].map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => setSortBy(s.id as any)}
                    className={`px-4 py-2.5 rounded-xl border ${
                      sortBy === s.id
                        ? "bg-green-600 border-green-600"
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

              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                Time Period
              </Text>
              <View className="flex-row gap-2 mb-6">
                {[
                  { id: "all", label: "All Time" },
                  { id: "thisMonth", label: "This Month" },
                  { id: "last30Days", label: "Last 30 Days" },
                ].map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => setDateRangeFilter(d.id as any)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      dateRangeFilter === d.id
                        ? "bg-green-600 border-green-600"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${
                        dateRangeFilter === d.id
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {d.label}
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
              Delete Income
            </Text>
            <Text className="text-slate-500 text-sm mb-6 text-center leading-relaxed">
              Are you sure you want to delete this income record? This action
              cannot be undone.
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

      {/* INCOME DETAILS MODAL */}
      <Modal visible={showDetails} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-50 rounded-t-[38px] overflow-hidden max-h-[90%] w-full shadow-2xl">
            {selectedIncome && (
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
                    <View className="w-20 h-20 rounded-3xl bg-green-600 items-center justify-center shadow-xl shadow-green-600/30 mb-4">
                      <Ionicons name="cash" size={36} color="white" />
                    </View>

                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Income Inflow
                    </Text>
                    <Text className="text-slate-900 text-4xl font-black mt-1">
                      ₹{selectedIncome.amount}
                    </Text>

                    <Text className="text-slate-700 text-base font-bold mt-2 text-center px-4">
                      {selectedIncome.source || selectedIncome.title}
                    </Text>

                    <View className="flex-row items-center bg-green-100 px-4 py-1.5 rounded-full mt-3">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#16a34a"
                      />
                      <Text className="text-green-700 text-xs font-bold uppercase tracking-wider ml-1.5">
                        Verified Transaction
                      </Text>
                    </View>
                  </View>

                  <View className="bg-white rounded-3xl p-5 mt-6 border border-slate-100 shadow-sm">
                    <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-green-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="wallet-outline"
                            size={18}
                            color="#16a34a"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Source
                        </Text>
                      </View>
                      <Text className="text-slate-900 font-black text-base">
                        {selectedIncome.source}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#2563eb"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Date Added
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-slate-900 font-bold text-sm">
                          {new Date(selectedIncome.date).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </Text>
                        <Text className="text-slate-400 text-xs font-medium mt-0.5">
                          {new Date(selectedIncome.date).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between py-3.5 border-b border-slate-100">
                      <View className="flex-row items-center">
                        <View className="bg-indigo-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="time-outline"
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
                            selectedIncome.updatedAt || selectedIncome.date,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                        <Text className="text-slate-400 text-xs font-medium mt-0.5">
                          {new Date(
                            selectedIncome.updatedAt || selectedIncome.date,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-3.5">
                      <View className="flex-row items-center">
                        <View className="bg-emerald-50 w-10 h-10 rounded-xl items-center justify-center mr-3">
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={18}
                            color="#059669"
                          />
                        </View>
                        <Text className="text-slate-500 font-medium text-sm">
                          Logged Status
                        </Text>
                      </View>
                      <Text className="text-emerald-600 font-bold text-sm">
                        Completed
                      </Text>
                    </View>
                  </View>

                  {selectedIncome.note || selectedIncome.notes ? (
                    <View className="bg-white rounded-3xl p-5 mt-4 border border-slate-100 shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <Ionicons
                          name="document-text-outline"
                          size={18}
                          color="#ea580c"
                        />
                        <Text className="text-slate-900 font-bold text-sm ml-2">
                          Additional Notes
                        </Text>
                      </View>
                      <Text className="text-slate-600 text-sm leading-relaxed mt-1">
                        {selectedIncome.note || selectedIncome.notes}
                      </Text>
                    </View>
                  ) : null}

                  <View className="flex-row mt-6 gap-4">
                    <Pressable
                      onPress={() => {
                        setShowDetails(false);
                        router.push(`/edit-income/${selectedIncome._id}`);
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
                        setSelectedId(selectedIncome._id);
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
            tintColor="#16a34a"
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
              Income
            </Text>
            <Text className="text-slate-500 font-medium text-sm mt-0.5">
              Track what you earn effortlessly
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-5 mb-5 flex-row justify-between items-center border border-slate-100 shadow-sm">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {selectedCalendarDay
                  ? `Inflow on ${selectedCalendarDay}`
                  : "Filtered Inflow"}
              </Text>
              <Text className="text-slate-900 text-2xl font-black mt-0.5">
                ₹{totalAmount}
              </Text>
            </View>
            <View className="bg-green-50 px-3.5 py-1.5 rounded-2xl border border-green-100">
              <Text className="text-green-600 text-xs font-bold">
                {filteredIncome.length} Records
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl px-4 py-3 mb-4 flex-row items-center border border-slate-100 shadow-sm">
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search income by source..."
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
            {sources.map((src) => (
              <Pressable
                key={src}
                onPress={() => {
                  setSourceFilter(src);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-2xl mr-2 shadow-sm ${
                  sourceFilter === src
                    ? "bg-green-600 shadow-green-600/30"
                    : "bg-white border border-slate-100"
                }`}
              >
                <Text
                  className={`font-bold text-xs ${
                    sourceFilter === src ? "text-white" : "text-slate-600"
                  }`}
                >
                  {src}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => router.push("/add-income")}
            className="bg-green-600 py-4 rounded-2xl mb-6 flex-row items-center justify-center shadow-lg shadow-green-600/30 active:opacity-90"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Add New Income
            </Text>
          </Pressable>

          {paginatedIncome.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm my-2">
              <View className="w-16 h-16 rounded-3xl bg-slate-50 items-center justify-center mb-3">
                <Ionicons name="cash-outline" size={30} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-bold text-base mt-1">
                No matching income
              </Text>
              <Text className="text-slate-400 text-xs mt-1 text-center max-w-[220px] leading-relaxed">
                Try adjusting your search filters or calendar date selection.
              </Text>
            </View>
          ) : (
            paginatedIncome.map((i) => (
              <Swipeable
                key={i._id}
                renderLeftActions={() => renderLeftActions(i._id)}
                renderRightActions={() => renderRightActions(i._id)}
              >
                <IncomeItem
                  title={i.source}
                  amount={i.amount}
                  category="Income"
                  date={i.date}
                  onPress={() => {
                    setSelectedIncome(i);
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
