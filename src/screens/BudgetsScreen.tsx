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
import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import BudgetCard from "../components/BudgetCard";

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

  useEffect(() => {
    fetchBudgets();
  }, []);

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
      fetchBudgets();
    } catch {
      alert("Failed to delete budget");
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

      {/* Budget Details Modal */}
      {/* Budget Details Modal */}
      <Modal visible={showDetails} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8">
            {selectedBudget && (
              <>
                {/* HANDLE */}
                <View className="w-14 h-1.5 bg-gray-300 rounded-full self-center mb-6" />

                {/* HEADER */}
                <View className="flex-row items-center mb-6">
                  <View className="bg-blue-100 p-3 rounded-xl mr-3">
                    <Ionicons name="wallet-outline" size={22} color="#2563eb" />
                  </View>

                  <View>
                    <Text className="text-2xl font-bold text-gray-900">
                      {selectedBudget.category}
                    </Text>

                    <Text className="text-gray-500">Budget Details</Text>
                  </View>
                </View>

                {/* LIMIT */}
                <View className="bg-gray-100 p-4 rounded-xl mb-3 flex-row justify-between">
                  <Text className="text-gray-500">Monthly Limit</Text>
                  <Text className="text-lg font-bold">
                    ₹{selectedBudget.limit}
                  </Text>
                </View>

                {/* SPENT */}
                <View className="bg-gray-100 p-4 rounded-xl mb-3 flex-row justify-between">
                  <Text className="text-gray-500">Spent</Text>
                  <Text className="text-lg font-bold text-red-500">
                    ₹{selectedBudget.spent || 0}
                  </Text>
                </View>

                {/* REMAINING */}
                <View className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between">
                  <Text className="text-gray-500">Remaining</Text>
                  <Text className="text-lg font-bold text-green-600">
                    ₹{selectedBudget.limit - (selectedBudget.spent || 0)}
                  </Text>
                </View>

                {/* PROGRESS BAR */}
                <View className="mb-5">
                  <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      style={{
                        width: `${Math.min(
                          ((selectedBudget.spent || 0) / selectedBudget.limit) *
                            100,
                          100,
                        )}%`,
                      }}
                      className="h-full bg-blue-600"
                    />
                  </View>

                  <Text className="text-gray-400 text-xs mt-1 text-right">
                    {Math.round(
                      ((selectedBudget.spent || 0) / selectedBudget.limit) *
                        100,
                    )}
                    % used
                  </Text>
                </View>

                {/* MONTH */}
                <View className="bg-gray-100 p-4 rounded-xl mb-6 flex-row justify-between">
                  <Text className="text-gray-500">Month</Text>
                  <Text className="text-gray-800 font-semibold">
                    {selectedBudget.month}
                  </Text>
                </View>

                {/* ACTION BUTTONS */}
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      setShowDetails(false);
                      router.push(`/edit-budget/${selectedBudget._id}`);
                    }}
                    className="flex-1 bg-blue-600 py-3 rounded-xl mr-2 items-center flex-row justify-center"
                  >
                    <Ionicons name="create-outline" size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setShowDetails(false);
                      confirmDelete(selectedBudget._id);
                    }}
                    className="flex-1 bg-red-500 py-3 rounded-xl ml-2 items-center flex-row justify-center"
                  >
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Delete
                    </Text>
                  </Pressable>
                </View>

                {/* CLOSE BUTTON */}
                <Pressable
                  onPress={() => setShowDetails(false)}
                  className="mt-5 items-center"
                >
                  <Text className="text-gray-400 font-medium">Close</Text>
                </Pressable>
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

            <Pressable
              onPress={() => router.push("/add-expense")}
              className="flex-1 ml-2 bg-gray-900 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text className="text-white font-semibold ml-2">Add Expense</Text>
            </Pressable>
          </View>

          {/* BUDGET LIST */}

          {paginatedBudgets.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Ionicons name="wallet-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3 text-center">
                No budgets found
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
