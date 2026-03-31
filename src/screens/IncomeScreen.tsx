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
import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import api from "../services/api";
import ExpenseItem from "../components/ExpenseItem";
import Toast from "react-native-toast-message";

export default function IncomeScreen() {
  const [income, setIncome] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedIncome, setSelectedIncome] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");

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
      setIncome(res.data.data || []);
    } catch (e) {
      console.log("INCOME ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

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
      });

      fetchIncome();
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete failed",
      });
    } finally {
      setConfirmDelete(false);
      setSelectedId(null);
    }
  };

  /* ---------------- FILTER ---------------- */

  const filteredIncome = useMemo(() => {
    return income.filter((i) => {
      const matchesSearch = i.source
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesSource = sourceFilter === "All" || i.source === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [income, search, sourceFilter]);

  const sources = ["All", ...Array.from(new Set(income.map((i) => i.source)))];

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredIncome.length / PAGE_SIZE);

  const paginatedIncome = filteredIncome.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalAmount = filteredIncome.reduce((sum, i) => sum + i.amount, 0);

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
      onPress={() => router.push(`/edit-income/${id}`)}
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
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-500 mt-3">Loading income...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* DELETE MODAL */}
      <Modal transparent visible={confirmDelete} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold mb-2">Delete Income</Text>

            <Text className="text-gray-500 mb-6">
              Are you sure you want to delete this income?
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
            <Text className="text-3xl font-bold">Income</Text>
            <Text className="text-gray-500 mt-1">Track what you earn</Text>
          </View>

          {/* TOTAL */}
          <View className="bg-white rounded-xl p-4 mb-4 flex-row justify-between">
            <Text>Total ({filteredIncome.length})</Text>
            <Text className="font-bold text-green-600">₹{totalAmount}</Text>
          </View>

          {/* SEARCH */}
          <View className="bg-white rounded-xl px-4 py-3 mb-4 flex-row items-center">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search income..."
              value={search}
              onChangeText={setSearch}
              className="ml-2 flex-1"
            />
          </View>

          {/* FILTER */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {sources.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setSourceFilter(s);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full mr-2 ${
                  sourceFilter === s ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <Text
                  className={
                    sourceFilter === s ? "text-white" : "text-gray-700"
                  }
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ADD */}
          <Pressable
            onPress={() => router.push("/add-income")}
            className="bg-green-600 py-4 rounded-xl mb-6 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text className="text-white ml-2 font-semibold">Add Income</Text>
          </Pressable>

          {/* LIST */}
          {paginatedIncome.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="cash-outline" size={40} color="#9ca3af" />

              <Text className="text-gray-500 mt-3 text-center font-medium">
                No income yet
              </Text>

              <Text className="text-gray-400 text-xs mt-1 text-center">
                Start tracking your earnings by adding your first income.
              </Text>

              <Pressable
                onPress={() => router.push("/add-income")}
                className="mt-4 bg-green-600 px-5 py-2 rounded-lg flex-row items-center"
              >
                <Ionicons name="add-circle-outline" size={16} color="white" />
                <Text className="text-white ml-2 font-semibold">
                  Add Income
                </Text>
              </Pressable>
            </View>
          ) : (
            paginatedIncome.map((i) => (
              <Swipeable
                key={i._id}
                renderLeftActions={() => renderLeftActions(i._id)}
                renderRightActions={() => renderRightActions(i._id)}
              >
                <ExpenseItem
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

          {/* INCOME DETAILS MODAL */}
          <Modal visible={showDetails} transparent animationType="slide">
            <View className="flex-1 bg-black/40 justify-end">
              <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8">
                {selectedIncome && (
                  <>
                    {/* Handle */}
                    <View className="w-14 h-1.5 bg-gray-300 rounded-full self-center mb-6" />

                    {/* Header */}
                    <View className="flex-row items-center mb-6">
                      <View className="bg-green-100 p-3 rounded-xl mr-3">
                        <Ionicons
                          name="cash-outline"
                          size={22}
                          color="#16a34a"
                        />
                      </View>

                      <View>
                        <Text className="text-2xl font-bold text-gray-900">
                          {selectedIncome.source}
                        </Text>
                        <Text className="text-gray-500">Income Details</Text>
                      </View>
                    </View>

                    {/* Amount */}
                    <View className="bg-gray-100 p-4 rounded-xl mb-3 flex-row justify-between">
                      <Text className="text-gray-500">Amount</Text>
                      <Text className="text-lg font-bold text-green-600">
                        ₹{selectedIncome.amount}
                      </Text>
                    </View>

                    {/* Source */}
                    <View className="bg-gray-100 p-4 rounded-xl mb-3 flex-row justify-between">
                      <Text className="text-gray-500">Source</Text>
                      <Text className="text-gray-800 font-semibold">
                        {selectedIncome.source}
                      </Text>
                    </View>

                    {/* Date */}
                    <View className="bg-gray-100 p-4 rounded-xl mb-3 flex-row justify-between">
                      <Text className="text-gray-500">Date</Text>
                      <Text className="text-gray-800">
                        {new Date(selectedIncome.date).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Notes */}
                    {selectedIncome.note && (
                      <View className="bg-gray-100 p-4 rounded-xl mb-6">
                        <Text className="text-gray-500 mb-1">Notes</Text>
                        <Text className="text-gray-700">
                          {selectedIncome.note}
                        </Text>
                      </View>
                    )}

                    {/* Buttons */}
                    <View className="flex-row">
                      <Pressable
                        onPress={() => {
                          setShowDetails(false);
                          router.push(`/edit-income/${selectedIncome._id}`);
                        }}
                        className="flex-1 bg-blue-600 py-3 rounded-xl mr-2 items-center flex-row justify-center"
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color="white"
                        />
                        <Text className="text-white font-semibold ml-2">
                          Edit
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setShowDetails(false);
                          setSelectedId(selectedIncome._id);
                          setConfirmDelete(true);
                        }}
                        className="flex-1 bg-red-500 py-3 rounded-xl ml-2 items-center flex-row justify-center"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="white"
                        />
                        <Text className="text-white font-semibold ml-2">
                          Delete
                        </Text>
                      </Pressable>
                    </View>

                    {/* Close */}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
