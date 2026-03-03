import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import BudgetCard from "../components/BudgetCard";

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Delete confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  /* ---------------- FETCH ---------------- */
  const fetchBudgets = async () => {
    const res = await api.get("/budgets");
    setBudgets(res.data);
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

  /* ---------------- SWIPE UI ---------------- */
  const renderRightActions = (id: string) => (
    <Pressable
      onPress={() => confirmDelete(id)}
      className="bg-red-600 justify-center items-center w-24 rounded-xl mr-2"
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text className="text-white text-sm mt-1">Delete</Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* ================= CONFIRM MODAL ================= */}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View
            className="bg-white rounded-2xl p-6"
            style={{ width: "100%", maxWidth: 420 }}
          >
            <Text className="text-xl font-bold mb-2">Delete Budget</Text>
            <Text className="text-gray-500 mb-6">
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </Text>

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setShowConfirm(false)}
                className="px-4 py-2 mr-2"
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
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

      {/* ================= MAIN UI ================= */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Width constraint */}
        <View
          style={{
            width: "100%",
            maxWidth: isLargeScreen ? 900 : "100%",
            alignSelf: "center",
          }}
        >
          {/* Header */}
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

          {/* Action Buttons */}
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

          {/* Budget List */}
          {budgets.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Ionicons name="wallet-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3 text-center">
                No budgets yet. Start by adding one.
              </Text>
            </View>
          ) : (
            budgets.map((b) => (
              <Swipeable
                key={b._id}
                renderRightActions={() => renderRightActions(b._id)}
              >
                <BudgetCard
                  category={b.category}
                  limit={b.limit}
                  spent={b.spent || 0}
                />
              </Swipeable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
