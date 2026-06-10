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
import Toast from "react-native-toast-message";
import IncomeItem from "../components/IncomeItem";

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
          Incomes
        </Text>

        {/* Right Action (future ready) */}
        <Pressable className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="options-outline" size={20} color="#111827" />
        </Pressable>
      </View>

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

          {/* PREMIUM INCOME DETAILS MODAL */}
          <Modal visible={showDetails} transparent animationType="fade">
            <View className="flex-1 bg-black/55 justify-end">
              <View className="bg-zinc-100 rounded-t-[38px] overflow-hidden">
                {selectedIncome && (
                  <>
                    {/* TOP ACCENT */}
                    <View className="absolute top-0 left-0 right-0 h-28 bg-green-500/10" />

                    {/* HANDLE */}
                    <View className="items-center pt-4">
                      <View className="w-14 h-1.5 rounded-full bg-zinc-300" />
                    </View>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{
                        paddingHorizontal: 22,
                        paddingTop: 20,
                        paddingBottom: 36,
                      }}
                    >
                      {/* HERO */}
                      <View className="items-center">
                        {/* ICON */}
                        <View
                          className="
                  w-24 h-24 rounded-full
                  bg-green-500
                  items-center justify-center
                  shadow-xl
                "
                        >
                          <Ionicons
                            name="cash-outline"
                            size={42}
                            color="white"
                          />
                        </View>

                        {/* AMOUNT */}
                        <Text className="text-zinc-900 text-[42px] font-black mt-6">
                          ₹{selectedIncome.amount}
                        </Text>

                        {/* SOURCE */}
                        <Text className="text-zinc-500 text-lg mt-1">
                          {selectedIncome.source}
                        </Text>

                        {/* BADGE */}
                        <View className="bg-green-100 px-5 py-2 rounded-full mt-4">
                          <Text className="text-green-700 font-bold">
                            Income Received
                          </Text>
                        </View>
                      </View>

                      {/* DETAILS CARD */}
                      <View
                        className="
                bg-white
                rounded-[30px]
                p-6
                mt-8
                border border-zinc-200
              "
                      >
                        <Text className="text-zinc-900 text-2xl font-black mb-6">
                          Transaction Details
                        </Text>

                        {/* ROW */}
                        <View className="flex-row items-center mb-5">
                          <View className="bg-green-100 w-12 h-12 rounded-2xl items-center justify-center">
                            <Ionicons
                              name="wallet-outline"
                              size={22}
                              color="#16a34a"
                            />
                          </View>

                          <View className="ml-4 flex-1">
                            <Text className="text-zinc-500 text-sm">
                              Source
                            </Text>

                            <Text className="text-zinc-900 text-lg font-black mt-1">
                              {selectedIncome.source}
                            </Text>
                          </View>
                        </View>

                        {/* ROW */}
                        <View className="flex-row items-center mb-5">
                          <View className="bg-blue-100 w-12 h-12 rounded-2xl items-center justify-center">
                            <Ionicons
                              name="calendar-outline"
                              size={22}
                              color="#2563eb"
                            />
                          </View>

                          <View className="ml-4 flex-1">
                            <Text className="text-zinc-500 text-sm">Date</Text>

                            <Text className="text-zinc-900 text-lg font-black mt-1">
                              {new Date(
                                selectedIncome.date,
                              ).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>

                        {/* ROW */}
                        <View className="flex-row items-center">
                          <View className="bg-emerald-100 w-12 h-12 rounded-2xl items-center justify-center">
                            <Ionicons name="cash" size={22} color="#059669" />
                          </View>

                          <View className="ml-4 flex-1">
                            <Text className="text-zinc-500 text-sm">
                              Amount
                            </Text>

                            <Text className="text-emerald-600 text-xl font-black mt-1">
                              ₹{selectedIncome.amount}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* NOTES */}
                      {selectedIncome.note ? (
                        <View
                          className="
                  bg-white
                  rounded-[30px]
                  p-6
                  mt-5
                  border border-zinc-200
                "
                        >
                          <View className="flex-row items-center mb-4">
                            <View className="bg-orange-100 w-12 h-12 rounded-2xl items-center justify-center">
                              <Ionicons
                                name="document-text-outline"
                                size={22}
                                color="#ea580c"
                              />
                            </View>

                            <Text className="text-zinc-900 text-xl font-black ml-4">
                              Notes
                            </Text>
                          </View>

                          <Text className="text-zinc-600 leading-7 text-base">
                            {selectedIncome.note}
                          </Text>
                        </View>
                      ) : null}

                      {/* ACTION BUTTONS */}
                      <View className="flex-row mt-8">
                        {/* EDIT */}
                        <Pressable
                          onPress={() => {
                            setShowDetails(false);

                            router.push(`/edit-income/${selectedIncome._id}`);
                          }}
                          className="
                  flex-1
                  bg-blue-600
                  rounded-[24px]
                  py-4
                  mr-2
                  flex-row
                  items-center
                  justify-center
                "
                        >
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color="white"
                          />

                          <Text className="text-white font-black text-base ml-2">
                            Edit
                          </Text>
                        </Pressable>

                        {/* DELETE */}
                        <Pressable
                          onPress={() => {
                            setShowDetails(false);

                            setSelectedId(selectedIncome._id);

                            setConfirmDelete(true);
                          }}
                          className="
                  flex-1
                  bg-red-500
                  rounded-[24px]
                  py-4
                  ml-2
                  flex-row
                  items-center
                  justify-center
                "
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="white"
                          />

                          <Text className="text-white font-black text-base ml-2">
                            Delete
                          </Text>
                        </Pressable>
                      </View>

                      {/* CLOSE */}
                      <Pressable
                        onPress={() => setShowDetails(false)}
                        className="items-center mt-7"
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
