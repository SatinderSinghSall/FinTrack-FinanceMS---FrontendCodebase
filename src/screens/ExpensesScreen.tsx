import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import api from "../services/api";
import ExpenseItem from "../components/ExpenseItem";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  /* ---------------- FETCH ---------------- */
  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`/expenses/${selectedId}`);
      fetchExpenses();
    } finally {
      setConfirmDelete(false);
      setSelectedId(null);
    }
  };

  /* ---------------- SWIPE ACTIONS ---------------- */
  const renderRightActions = (id: string) => (
    <Pressable
      onPress={() => {
        setSelectedId(id);
        setConfirmDelete(true);
      }}
      className="bg-red-600 justify-center items-center w-24 rounded-xl mr-2"
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text className="text-white text-sm mt-1">Delete</Text>
    </Pressable>
  );

  const renderLeftActions = (id: string) => (
    <Pressable
      onPress={() => router.push(`/edit-expense/${id}`)}
      className="bg-blue-600 justify-center items-center w-24 rounded-xl ml-2"
    >
      <Ionicons name="pencil-outline" size={22} color="#fff" />
      <Text className="text-white text-sm mt-1">Edit</Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Modal transparent visible={confirmDelete} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View
            className="bg-white rounded-2xl p-6"
            style={{ width: "100%", maxWidth: 420 }}
          >
            <Text className="text-xl font-bold mb-2">Delete Expense</Text>
            <Text className="text-gray-500 mb-6">
              Are you sure you want to delete this expense?
            </Text>

            <View className="flex-row justify-end">
              <Pressable
                onPress={() => setConfirmDelete(false)}
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
              Expenses
            </Text>
            <Text className="text-gray-500 mt-1">
              Track where your money goes
            </Text>
          </View>

          {/* Add Expense */}
          <Pressable
            onPress={() => router.push("/add-expense")}
            className="bg-red-600 py-4 rounded-xl mb-6 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-2 text-base">
              Add Expense
            </Text>
          </Pressable>

          {/* Expense List */}
          {expenses.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Ionicons name="receipt-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3 text-center">
                No expenses yet. Add your first expense.
              </Text>
            </View>
          ) : (
            expenses.map((e) => (
              <Swipeable
                key={e._id}
                renderLeftActions={() => renderLeftActions(e._id)}
                renderRightActions={() => renderRightActions(e._id)}
              >
                <ExpenseItem
                  title={e.title}
                  amount={e.amount}
                  category={e.category}
                  date={e.date}
                />
              </Swipeable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
