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
import { useEffect, useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  const [showConfirm, setShowConfirm] = useState(false);
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

  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

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
      setShowConfirm(false);
      setSelectedId(null);
    }
  };

  /* ---------------- SEARCH ---------------- */

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) =>
      b.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [budgets, search]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredBudgets.length / PAGE_SIZE);

  const paginatedBudgets = filteredBudgets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  /* ---------------- TOTAL ---------------- */

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.limit, 0);

  /* ---------------- SWIPE ACTIONS ---------------- */

  const renderRightActions = (id: string) => (
    <Pressable
      onPress={() => confirmDelete(id)}
      className="bg-red-600 justify-center items-center w-24 rounded-xl mr-2"
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text className="text-white text-sm mt-1">Delete</Text>
    </Pressable>
  );

  const renderLeftActions = (id: string) => (
    <Pressable
      onPress={() => router.push(`/edit-budget/${id}`)}
      className="bg-blue-600 justify-center items-center w-24 rounded-xl ml-2"
    >
      <Ionicons name="pencil-outline" size={22} color="#fff" />
      <Text className="text-white text-sm mt-1">Edit</Text>
    </Pressable>
  );

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-3">Loading budgets...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* 🔝 TOP HEADER */}
      <View className="flex-row items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        {/* Back Button (modern container) */}
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        {/* Title */}
        <Text className="text-base font-semibold text-gray-900 tracking-tight">
          Budgets
        </Text>

        {/* Right Action (future ready) */}
        <Pressable className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="options-outline" size={20} color="#111827" />
        </Pressable>
      </View>

      {/* DELETE MODAL */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold mb-2">Delete Budget</Text>

            <Text className="text-gray-500 mb-6">
              Are you sure you want to delete this budget?
            </Text>

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setShowConfirm(false)}
                className="px-4 py-2 mr-2"
              >
                <Text className="text-gray-600">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="bg-red-600 px-5 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* PREMIUM BUDGET DETAILS MODAL */}
      <Modal visible={showDetails} transparent animationType="fade">
        <View className="flex-1 bg-black/55 justify-end">
          <View className="bg-zinc-100 rounded-t-[34px] overflow-hidden">
            {selectedBudget && (
              <>
                {/* TOP GLOW */}
                <View className="absolute top-0 left-0 right-0 h-24 bg-blue-500/10" />

                {/* HANDLE */}
                <View className="items-center pt-4">
                  <View className="w-14 h-1.5 rounded-full bg-zinc-300" />
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 22,
                    paddingTop: 16,
                    paddingBottom: 26,
                  }}
                >
                  {/* HERO */}
                  <View className="items-center">
                    {/* ICON */}
                    <View
                      className="
                  w-20 h-20 rounded-full
                  bg-blue-600
                  items-center justify-center
                  shadow-xl
                "
                    >
                      <Ionicons name="wallet-outline" size={34} color="white" />
                    </View>

                    {/* LIMIT */}
                    <Text className="text-zinc-900 text-[34px] font-black mt-5">
                      ₹{selectedBudget.limit}
                    </Text>

                    {/* CATEGORY */}
                    <Text className="text-zinc-500 text-base mt-1">
                      {selectedBudget.category}
                    </Text>

                    {/* BADGE */}
                    <View className="bg-blue-100 px-5 py-2 rounded-full mt-4">
                      <Text className="text-blue-700 font-bold">
                        Monthly Budget
                      </Text>
                    </View>
                  </View>

                  {/* ANALYTICS CARD */}
                  <View
                    className="
                bg-white
                rounded-[26px]
                p-5
                mt-6
                border border-zinc-200
              "
                  >
                    <Text className="text-zinc-900 text-xl font-black mb-5">
                      Budget Analytics
                    </Text>

                    {/* SPENT */}
                    <View className="flex-row items-center mb-4">
                      <View className="bg-red-100 w-11 h-11 rounded-2xl items-center justify-center">
                        <Ionicons
                          name="trending-down-outline"
                          size={20}
                          color="#dc2626"
                        />
                      </View>

                      <View className="ml-4 flex-1">
                        <Text className="text-zinc-500 text-sm">Spent</Text>

                        <Text className="text-red-600 text-lg font-black mt-1">
                          ₹{selectedBudget.spent || 0}
                        </Text>
                      </View>
                    </View>

                    {/* REMAINING */}
                    <View className="flex-row items-center mb-4">
                      <View className="bg-emerald-100 w-11 h-11 rounded-2xl items-center justify-center">
                        <Ionicons
                          name="sparkles-outline"
                          size={20}
                          color="#059669"
                        />
                      </View>

                      <View className="ml-4 flex-1">
                        <Text className="text-zinc-500 text-sm">Remaining</Text>

                        <Text className="text-emerald-600 text-lg font-black mt-1">
                          ₹{selectedBudget.limit - (selectedBudget.spent || 0)}
                        </Text>
                      </View>
                    </View>

                    {/* MONTH */}
                    <View className="flex-row items-center mb-6">
                      <View className="bg-orange-100 w-11 h-11 rounded-2xl items-center justify-center">
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#ea580c"
                        />
                      </View>

                      <View className="ml-4 flex-1">
                        <Text className="text-zinc-500 text-sm">Month</Text>

                        <Text className="text-zinc-900 text-base font-black mt-1">
                          {selectedBudget.month}
                        </Text>
                      </View>
                    </View>

                    {/* PROGRESS */}
                    <View>
                      <View className="flex-row justify-between mb-3">
                        <Text className="text-zinc-500 font-medium">
                          Budget Usage
                        </Text>

                        <Text className="text-zinc-900 font-black">
                          {Math.round(
                            ((selectedBudget.spent || 0) /
                              selectedBudget.limit) *
                              100,
                          )}
                          %
                        </Text>
                      </View>

                      <View className="bg-zinc-200 h-3 rounded-full overflow-hidden">
                        <View
                          style={{
                            width: `${Math.min(
                              ((selectedBudget.spent || 0) /
                                selectedBudget.limit) *
                                100,
                              100,
                            )}%`,
                          }}
                          className={`
                      h-full rounded-full
                      ${
                        (selectedBudget.spent || 0) / selectedBudget.limit > 0.8
                          ? "bg-red-500"
                          : "bg-blue-600"
                      }
                    `}
                        />
                      </View>
                    </View>
                  </View>

                  {/* INSIGHT CARD */}
                  <View
                    className="
                bg-white
                rounded-[26px]
                p-5
                mt-4
                border border-zinc-200
              "
                  >
                    <View className="flex-row items-start">
                      <View className="bg-indigo-100 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                        <Ionicons
                          name="analytics-outline"
                          size={24}
                          color="#4f46e5"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-zinc-900 text-lg font-black">
                          Spending Insight
                        </Text>

                        <Text className="text-zinc-600 leading-6 mt-2">
                          {selectedBudget.spent > selectedBudget.limit
                            ? "You have exceeded this month's budget limit."
                            : "You are currently within your planned monthly budget."}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View className="flex-row mt-7">
                    {/* EDIT */}
                    <Pressable
                      onPress={() => {
                        setShowDetails(false);

                        router.push(`/edit-budget/${selectedBudget._id}`);
                      }}
                      className="
                  flex-1
                  bg-blue-600
                  rounded-[22px]
                  py-3.5
                  mr-2
                  flex-row
                  items-center
                  justify-center
                "
                    >
                      <Ionicons name="create-outline" size={18} color="white" />

                      <Text className="text-white font-black text-base ml-2">
                        Edit
                      </Text>
                    </Pressable>

                    {/* DELETE */}
                    <Pressable
                      onPress={() => {
                        setShowDetails(false);

                        confirmDelete(selectedBudget._id);
                      }}
                      className="
                  flex-1
                  bg-red-500
                  rounded-[22px]
                  py-3.5
                  ml-2
                  flex-row
                  items-center
                  justify-center
                "
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />

                      <Text className="text-white font-black text-base ml-2">
                        Delete
                      </Text>
                    </Pressable>
                  </View>

                  {/* CLOSE */}
                  <Pressable
                    onPress={() => setShowDetails(false)}
                    className="items-center mt-6"
                  >
                    <Text className="text-zinc-400 font-semibold text-base">
                      Close
                    </Text>
                  </Pressable>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MAIN UI */}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
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
          {/* HEADER */}

          <View className="mb-6">
            <Text
              className="font-bold"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Budgets
            </Text>

            <Text className="text-gray-500 mt-1">
              Manage your monthly limits
            </Text>
          </View>

          {/* TOTAL SUMMARY */}

          <View className="bg-white rounded-xl p-4 mb-4 flex-row justify-between">
            <Text className="text-gray-500">
              Total ({filteredBudgets.length})
            </Text>

            <Text className="font-bold text-blue-600">₹{totalBudget}</Text>
          </View>

          {/* SEARCH */}

          <View className="bg-white rounded-xl px-4 py-3 mb-4 flex-row items-center">
            <Ionicons name="search" size={18} color="#9ca3af" />

            <TextInput
              placeholder="Search budgets..."
              value={search}
              onChangeText={setSearch}
              className="ml-2 flex-1"
            />
          </View>

          {/* ACTION BUTTONS */}

          <View className="flex-row justify-between mb-6">
            <Pressable
              onPress={() => router.push("/add-budget")}
              className="flex-1 mr-2 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text className="text-white font-semibold ml-2">Add Budget</Text>
            </Pressable>

            {/* <Pressable
              onPress={() => router.push("/add-expense")}
              className="flex-1 ml-2 bg-gray-900 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text className="text-white font-semibold ml-2">Add Expense</Text>
            </Pressable> */}
          </View>

          {/* BUDGET LIST */}

          {paginatedBudgets.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="wallet-outline" size={42} color="#9ca3af" />

              <Text className="text-gray-600 mt-3 font-medium text-center">
                No budgets yet
              </Text>

              <Text className="text-gray-400 text-xs mt-1 text-center">
                Create a budget to control your monthly spending.
              </Text>

              <Pressable
                onPress={() => router.push("/add-budget")}
                className="mt-4 bg-blue-600 px-5 py-2 rounded-lg flex-row items-center"
              >
                <Ionicons name="add-circle-outline" size={16} color="white" />
                <Text className="text-white ml-2 font-semibold">
                  Add Budget
                </Text>
              </Pressable>
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

          {/* PAGINATION */}

          {totalPages > 1 && (
            <View className="flex-row justify-between mt-6">
              <Pressable
                disabled={page === 1}
                onPress={() => setPage(page - 1)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                <Text>Previous</Text>
              </Pressable>

              <Text className="self-center">
                Page {page} / {totalPages}
              </Text>

              <Pressable
                disabled={page === totalPages}
                onPress={() => setPage(page + 1)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                <Text>Next</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
