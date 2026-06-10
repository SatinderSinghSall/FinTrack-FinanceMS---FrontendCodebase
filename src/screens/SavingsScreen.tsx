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
import { useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect, useRouter } from "expo-router";

import api from "../services/api";
import Toast from "react-native-toast-message";

export default function SavingsScreen() {
  const [savings, setSavings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedSaving, setSelectedSaving] = useState<any | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState("All");

  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();

  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 768;

  /* ---------------- FETCH ---------------- */

  const fetchSavings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/savings");

      setSavings(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavings();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);

    await fetchSavings();

    setRefreshing(false);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await api.delete(`/savings/${selectedId}`);

      Toast.show({
        type: "success",
        text1: "Saving deleted",
        text2: "The saving was removed successfully",
        position: "top",
      });

      fetchSavings();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: "Unable to delete this saving",
        position: "top",
      });
    } finally {
      setConfirmDelete(false);
      setSelectedId(null);
    }
  };

  /* ---------------- FILTER + SEARCH ---------------- */

  const filteredSavings = useMemo(() => {
    return savings.filter((s) => {
      const matchesSearch = s.goal.toLowerCase().includes(search.toLowerCase());

      const matchesGoal = goalFilter === "All" || s.goal === goalFilter;

      return matchesSearch && matchesGoal;
    });
  }, [savings, search, goalFilter]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredSavings.length / PAGE_SIZE);

  const paginatedSavings = filteredSavings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  /* ---------------- TOTAL ---------------- */

  const totalAmount = filteredSavings.reduce((sum, s) => sum + s.amount, 0);

  const goals = ["All", ...Array.from(new Set(savings.map((s) => s.goal)))];

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
      onPress={() => router.push(`/edit-saving/${id}`)}
      className="bg-emerald-600 justify-center items-center w-24 rounded-xl ml-2"
    >
      <Ionicons name="pencil-outline" size={22} color="#fff" />

      <Text className="text-white text-sm mt-1">Edit</Text>
    </Pressable>
  );

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-emerald-50 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />

        <Text className="text-emerald-700 mt-3">Loading savings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      {/* HEADER */}

      <View className="flex-row items-center justify-between px-6 py-3 bg-white border-b border-emerald-100">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#065f46" />
        </Pressable>

        <Text className="text-base font-semibold text-emerald-900 tracking-tight">
          Savings
        </Text>

        <Pressable className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center">
          <Ionicons name="wallet-outline" size={20} color="#065f46" />
        </Pressable>
      </View>

      {/* DELETE MODAL */}

      <Modal transparent visible={confirmDelete} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold mb-2">Delete Saving</Text>

            <Text className="text-gray-500 mb-6">
              Are you sure you want to delete this saving?
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

      {/* PREMIUM SAVING DETAILS MODAL */}
      <Modal visible={showDetails} transparent animationType="fade">
        <View className="flex-1 bg-black/55 justify-end">
          <View className="bg-emerald-50 rounded-t-[34px] overflow-hidden">
            {selectedSaving && (
              <>
                {/* TOP GLOW */}
                <View className="absolute top-0 left-0 right-0 h-24 bg-emerald-500/10" />

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
                  bg-emerald-600
                  items-center justify-center
                  shadow-xl
                "
                    >
                      <Ionicons name="wallet-outline" size={34} color="white" />
                    </View>

                    {/* AMOUNT */}
                    <Text className="text-zinc-900 text-[34px] font-black mt-5">
                      ₹{selectedSaving.amount}
                    </Text>

                    {/* GOAL */}
                    <Text className="text-zinc-500 text-base mt-1">
                      {selectedSaving.goal}
                    </Text>

                    {/* BADGE */}
                    <View className="bg-emerald-100 px-5 py-2 rounded-full mt-4">
                      <Text className="text-emerald-700 font-bold">
                        Savings Goal
                      </Text>
                    </View>
                  </View>

                  {/* DETAILS CARD */}
                  <View
                    className="
                bg-white
                rounded-[26px]
                p-5
                mt-6
                border border-emerald-100
              "
                  >
                    <Text className="text-zinc-900 text-xl font-black mb-5">
                      Savings Details
                    </Text>

                    {/* GOAL */}
                    <View className="flex-row items-center mb-4">
                      <View className="bg-emerald-100 w-11 h-11 rounded-2xl items-center justify-center">
                        <Ionicons
                          name="flag-outline"
                          size={20}
                          color="#059669"
                        />
                      </View>

                      <View className="ml-4 flex-1">
                        <Text className="text-zinc-500 text-sm">Goal</Text>

                        <Text className="text-zinc-900 text-lg font-black mt-1">
                          {selectedSaving.goal}
                        </Text>
                      </View>
                    </View>

                    {/* AMOUNT */}
                    <View className="flex-row items-center mb-4">
                      <View className="bg-blue-100 w-11 h-11 rounded-2xl items-center justify-center">
                        <Ionicons
                          name="cash-outline"
                          size={20}
                          color="#2563eb"
                        />
                      </View>

                      <View className="ml-4 flex-1">
                        <Text className="text-zinc-500 text-sm">
                          Amount Saved
                        </Text>

                        <Text className="text-emerald-600 text-lg font-black mt-1">
                          ₹{selectedSaving.amount}
                        </Text>
                      </View>
                    </View>

                    {/* DATE */}
                    <View className="flex-row items-center">
                      <View className="bg-orange-100 w-11 h-11 rounded-2xl items-center justify-center">
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#ea580c"
                        />
                      </View>

                      <View className="ml-4 flex-1">
                        <Text className="text-zinc-500 text-sm">Created</Text>

                        <Text className="text-zinc-900 text-base font-black mt-1">
                          {new Date(
                            selectedSaving.createdAt,
                          ).toLocaleDateString()}
                        </Text>
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
                border border-emerald-100
              "
                  >
                    <View className="flex-row items-start">
                      <View className="bg-emerald-100 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                        <Ionicons
                          name="trending-up-outline"
                          size={24}
                          color="#059669"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-zinc-900 text-lg font-black">
                          Savings Insight
                        </Text>

                        <Text className="text-zinc-600 leading-6 mt-2">
                          Great progress. Consistent savings habits help build
                          long-term financial security and future investments.
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

                        router.push(`/edit-saving/${selectedSaving._id}`);
                      }}
                      className="
                  flex-1
                  bg-emerald-600
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

                        setSelectedId(selectedSaving._id);

                        setConfirmDelete(true);
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
              className="font-bold text-emerald-900"
              style={{
                fontSize: isLargeScreen ? 34 : 28,
              }}
            >
              Savings
            </Text>

            <Text className="text-emerald-700 mt-1">
              Build your financial future
            </Text>
          </View>

          {/* TOTAL */}

          <View className="bg-white rounded-xl p-4 mb-4 flex-row justify-between border border-emerald-100">
            <Text className="text-gray-500">
              Total ({filteredSavings.length})
            </Text>

            <Text className="font-bold text-emerald-600">₹{totalAmount}</Text>
          </View>

          {/* SEARCH */}

          <View className="bg-white rounded-xl px-4 py-3 mb-4 flex-row items-center border border-emerald-100">
            <Ionicons name="search" size={18} color="#6b7280" />

            <TextInput
              placeholder="Search savings..."
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
            {goals.map((goal) => (
              <Pressable
                key={goal}
                onPress={() => {
                  setGoalFilter(goal);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full mr-2 ${
                  goalFilter === goal ? "bg-emerald-600" : "bg-emerald-100"
                }`}
              >
                <Text
                  className={
                    goalFilter === goal ? "text-white" : "text-emerald-700"
                  }
                >
                  {goal}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* ADD BUTTON */}

          <Pressable
            onPress={() => router.push("/add-saving")}
            className="bg-emerald-600 py-4 rounded-xl mb-6 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />

            <Text className="text-white font-semibold ml-2">Add Saving</Text>
          </Pressable>

          {/* LIST */}

          {paginatedSavings.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="wallet-outline" size={40} color="#9ca3af" />

              <Text className="text-gray-500 mt-3 text-center font-medium">
                No savings yet
              </Text>

              <Text className="text-gray-400 text-xs mt-1 text-center">
                Start building your savings goals today.
              </Text>

              <Pressable
                onPress={() => router.push("/add-saving")}
                className="mt-4 bg-emerald-600 px-5 py-2 rounded-lg flex-row items-center"
              >
                <Ionicons name="add-circle-outline" size={16} color="white" />

                <Text className="text-white ml-2 font-semibold">
                  Add Saving
                </Text>
              </Pressable>
            </View>
          ) : (
            paginatedSavings.map((s) => (
              <Swipeable
                key={s._id}
                renderLeftActions={() => renderLeftActions(s._id)}
                renderRightActions={() => renderRightActions(s._id)}
              >
                <Pressable
                  onPress={() => {
                    setSelectedSaving(s);
                    setShowDetails(true);
                  }}
                  className="bg-white rounded-2xl p-5 mb-3 border border-emerald-100"
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-lg font-bold text-emerald-900">
                        {s.goal}
                      </Text>

                      <Text className="text-emerald-700 mt-1">Saving Goal</Text>
                    </View>

                    <Text className="text-xl font-bold text-emerald-600">
                      ₹{s.amount}
                    </Text>
                  </View>
                </Pressable>
              </Swipeable>
            ))
          )}

          {/* PAGINATION */}

          {totalPages > 1 && (
            <View className="flex-row justify-between mt-6">
              <Pressable
                disabled={page === 1}
                onPress={() => setPage(page - 1)}
                className="bg-emerald-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-emerald-700">Previous</Text>
              </Pressable>

              <Text className="self-center text-emerald-700">
                Page {page} / {totalPages}
              </Text>

              <Pressable
                disabled={page === totalPages}
                onPress={() => setPage(page + 1)}
                className="bg-emerald-100 px-4 py-2 rounded-lg"
              >
                <Text className="text-emerald-700">Next</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
