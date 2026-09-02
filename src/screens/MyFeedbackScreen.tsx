import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import api from "../services/api";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type FeedbackStatus = "Pending" | "In Progress" | "Resolved";

type FeedbackPriority = "Low" | "Medium" | "High";

type FeedbackItem = {
  _id: string;
  type: string;
  subject: string;
  message: string;
  priority: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
};

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ITEMS_PER_PAGE = 6;

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Resolved"];

const PRIORITY_FILTERS = ["All", "High", "Medium", "Low"];

/*
|--------------------------------------------------------------------------
| Date formatting
|--------------------------------------------------------------------------
*/

const formatDateTime = (dateString?: string) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| Status configuration
|--------------------------------------------------------------------------
*/

const getStatusConfig = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return {
        label: "Resolved",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        icon: "checkmark-circle-outline" as const,
        iconColor: "#059669",
        dot: "#10B981",
      };

    case "in progress":
      return {
        label: "In Progress",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "time-outline" as const,
        iconColor: "#D97706",
        dot: "#F59E0B",
      };

    default:
      return {
        label: "Pending",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "alert-circle-outline" as const,
        iconColor: "#2563EB",
        dot: "#3B82F6",
      };
  }
};

/*
|--------------------------------------------------------------------------
| Priority configuration
|--------------------------------------------------------------------------
*/

const getPriorityConfig = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return {
        label: "High",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "arrow-up-outline" as const,
        iconColor: "#DC2626",
      };

    case "medium":
      return {
        label: "Medium",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "remove-outline" as const,
        iconColor: "#D97706",
      };

    default:
      return {
        label: "Low",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        icon: "arrow-down-outline" as const,
        iconColor: "#059669",
      };
  }
};

/*
|--------------------------------------------------------------------------
| Feedback type icon
|--------------------------------------------------------------------------
*/

const getTypeIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
  const value = type?.toLowerCase() || "";

  if (value.includes("bug") || value.includes("error")) {
    return "bug-outline";
  }

  if (value.includes("feature") || value.includes("request")) {
    return "bulb-outline";
  }

  if (value.includes("complaint") || value.includes("issue")) {
    return "alert-circle-outline";
  }

  if (value.includes("suggestion") || value.includes("improvement")) {
    return "sparkles-outline";
  }

  return "document-text-outline";
};

/*
|--------------------------------------------------------------------------
| Main screen
|--------------------------------------------------------------------------
*/

export default function MyFeedbackScreen() {
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [selectedPriority, setSelectedPriority] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | Fetch feedback
  |--------------------------------------------------------------------------
  */

  const fetchUserFeedbacks = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }

      const response = await api.get("/feedback");

      if (response.data.success) {
        setFeedbacks(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch feedback history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserFeedbacks();
  }, [fetchUserFeedbacks]);

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const onRefresh = useCallback(() => {
    setCurrentPage(1);
    fetchUserFeedbacks(true);
  }, [fetchUserFeedbacks]);

  /*
  |--------------------------------------------------------------------------
  | Search + filters
  |--------------------------------------------------------------------------
  */

  const filteredFeedbacks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return feedbacks.filter((item) => {
      const status = item.status || "Pending";

      const matchesSearch =
        query.length === 0 ||
        item.subject.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.priority.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "All" ||
        status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesPriority =
        selectedPriority === "All" ||
        item.priority.toLowerCase() === selectedPriority.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [feedbacks, searchQuery, selectedStatus, selectedPriority]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE),
  );

  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredFeedbacks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFeedbacks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedPriority]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
  |--------------------------------------------------------------------------
  | Pagination handlers
  |--------------------------------------------------------------------------
  */

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((page) => page + 1);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Clear filters
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedPriority("All");
    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Open detail
  |--------------------------------------------------------------------------
  */

  const openFeedback = (item: FeedbackItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeFeedback = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        <View className="flex-1 items-center justify-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <ActivityIndicator size="small" color="#111827" />
          </View>

          <Text className="mt-4 text-sm font-semibold text-gray-500">
            Loading your feedback...
          </Text>

          <Text className="mt-1 text-xs text-gray-400">
            Please wait a moment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="flex-1 bg-gray-50">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#111827"
            />
          }
        >
          {/* ======================================================
              HEADER
          ====================================================== */}

          <View className="pb-5 pt-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[28px] font-extrabold leading-[34px] text-gray-950">
                  My Feedback
                </Text>

                <Text className="mt-1.5 text-[13px] leading-[19px] text-gray-500">
                  Track your requests and feedback
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <Ionicons
                  name="chatbubbles-outline"
                  size={21}
                  color="#111827"
                />
              </View>
            </View>
          </View>

          {/* ======================================================
              SUMMARY
          ====================================================== */}

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Total
              </Text>

              <Text className="mt-1 text-[22px] font-extrabold text-gray-950">
                {feedbacks.length}
              </Text>

              <Text className="mt-0.5 text-[10px] text-gray-400">
                Submissions
              </Text>
            </View>

            <View className="flex-1 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                Pending
              </Text>

              <Text className="mt-1 text-[22px] font-extrabold text-blue-800">
                {
                  feedbacks.filter(
                    (item) =>
                      (item.status || "Pending").toLowerCase() === "pending",
                  ).length
                }
              </Text>

              <Text className="mt-0.5 text-[10px] text-blue-500">
                Awaiting review
              </Text>
            </View>
          </View>

          {/* ======================================================
              SEARCH
          ====================================================== */}

          <View className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
            <Ionicons name="search-outline" size={19} color="#9CA3AF" />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search feedback..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              className="h-12 flex-1 px-3 text-sm text-gray-900"
            />

            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              >
                <Ionicons name="close" size={17} color="#6B7280" />
              </Pressable>
            )}
          </View>

          {/* ======================================================
              STATUS FILTERS
          ====================================================== */}

          <View className="mb-3">
            <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Status
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {STATUS_FILTERS.map((filter) => {
                const active = selectedStatus === filter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => {
                      setSelectedStatus(filter);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full border px-4 py-2.5 active:opacity-80 ${
                      active
                        ? "border-gray-900 bg-gray-900"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ======================================================
              PRIORITY FILTERS
          ====================================================== */}

          <View className="mb-5">
            <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Priority
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {PRIORITY_FILTERS.map((priority) => {
                const active = selectedPriority === priority;

                return (
                  <Pressable
                    key={priority}
                    onPress={() => {
                      setSelectedPriority(priority);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full border px-4 py-2.5 active:opacity-80 ${
                      active
                        ? "border-gray-900 bg-gray-900"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {priority}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ======================================================
              RESULTS HEADER
          ====================================================== */}

          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-900" />

              <Text className="text-[15px] font-extrabold text-gray-900">
                Feedback History
              </Text>
            </View>

            <Text className="text-xs font-medium text-gray-400">
              {filteredFeedbacks.length}{" "}
              {filteredFeedbacks.length === 1 ? "result" : "results"}
            </Text>
          </View>

          {/* ======================================================
              FEEDBACK CARDS
          ====================================================== */}

          {paginatedFeedbacks.length > 0 ? (
            <View>
              {paginatedFeedbacks.map((item) => {
                const statusConfig = getStatusConfig(item.status);

                const priorityConfig = getPriorityConfig(item.priority);

                return (
                  <Pressable
                    key={item._id}
                    onPress={() => openFeedback(item)}
                    className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
                  >
                    {/* TOP ROW */}

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                          <Ionicons
                            name={getTypeIcon(item.type)}
                            size={19}
                            color="#374151"
                          />
                        </View>

                        <View className="ml-3">
                          <Text className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            Feedback Type
                          </Text>

                          <Text className="mt-0.5 text-xs font-extrabold text-gray-800">
                            {item.type}
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#9CA3AF"
                      />
                    </View>

                    {/* SUBJECT */}

                    <Text
                      numberOfLines={2}
                      className="mt-4 text-[16px] font-extrabold leading-[21px] text-gray-950"
                    >
                      {item.subject}
                    </Text>

                    {/* MESSAGE */}

                    <Text
                      numberOfLines={3}
                      className="mt-1.5 text-[13px] leading-[19px] text-gray-500"
                    >
                      {item.message}
                    </Text>

                    {/* BADGES */}

                    <View className="mt-4 flex-row items-center gap-2">
                      <View
                        className={`flex-row items-center rounded-lg border px-2.5 py-1.5 ${statusConfig.bg} ${statusConfig.border}`}
                      >
                        <Ionicons
                          name={statusConfig.icon}
                          size={12}
                          color={statusConfig.iconColor}
                        />

                        <Text
                          className={`ml-1.5 text-[10px] font-bold ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </Text>
                      </View>

                      <View
                        className={`flex-row items-center rounded-lg border px-2.5 py-1.5 ${priorityConfig.bg} ${priorityConfig.border}`}
                      >
                        <Ionicons
                          name={priorityConfig.icon}
                          size={11}
                          color={priorityConfig.iconColor}
                        />

                        <Text
                          className={`ml-1.5 text-[10px] font-bold ${priorityConfig.text}`}
                        >
                          {priorityConfig.label}
                        </Text>
                      </View>
                    </View>

                    {/* FOOTER */}

                    <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#9CA3AF"
                        />

                        <Text className="ml-1.5 text-[10px] font-medium text-gray-400">
                          Added {formatDateTime(item.createdAt)}
                        </Text>
                      </View>

                      <Text className="text-[10px] font-bold text-gray-400">
                        View
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            /* ====================================================
               EMPTY STATE
            ==================================================== */

            <View className="items-center rounded-3xl border border-gray-200 bg-white px-6 py-14">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Ionicons
                  name="chatbubbles-outline"
                  size={28}
                  color="#9CA3AF"
                />
              </View>

              <Text className="mt-5 text-base font-extrabold text-gray-900">
                No feedback found
              </Text>

              <Text className="mt-1.5 max-w-[280px] text-center text-[13px] leading-[19px] text-gray-500">
                {searchQuery.length > 0 ||
                selectedStatus !== "All" ||
                selectedPriority !== "All"
                  ? "Try changing your search or filters."
                  : "You haven't submitted any feedback yet."}
              </Text>

              {(searchQuery.length > 0 ||
                selectedStatus !== "All" ||
                selectedPriority !== "All") && (
                <Pressable
                  onPress={clearFilters}
                  className="mt-5 rounded-xl bg-gray-900 px-5 py-3 active:bg-gray-800"
                >
                  <Text className="text-xs font-bold text-white">
                    Clear Filters
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ======================================================
              PAGINATION
          ====================================================== */}

          {filteredFeedbacks.length > ITEMS_PER_PAGE && (
            <View className="mt-5 rounded-2xl border border-gray-200 bg-white p-3">
              <View className="flex-row items-center justify-between">
                {/* PREVIOUS */}

                <Pressable
                  onPress={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`h-10 flex-row items-center rounded-xl px-3 ${
                    currentPage === 1
                      ? "bg-gray-100"
                      : "bg-gray-900 active:bg-gray-800"
                  }`}
                >
                  <Ionicons
                    name="chevron-back"
                    size={17}
                    color={currentPage === 1 ? "#9CA3AF" : "#FFFFFF"}
                  />

                  <Text
                    className={`ml-1 text-xs font-bold ${
                      currentPage === 1 ? "text-gray-400" : "text-white"
                    }`}
                  >
                    Previous
                  </Text>
                </Pressable>

                {/* PAGE */}

                <Text className="mx-2 text-xs font-semibold text-gray-500">
                  Page{" "}
                  <Text className="font-extrabold text-gray-900">
                    {currentPage}
                  </Text>{" "}
                  of {totalPages}
                </Text>

                {/* NEXT */}

                <Pressable
                  onPress={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`h-10 flex-row items-center rounded-xl px-3 ${
                    currentPage === totalPages
                      ? "bg-gray-100"
                      : "bg-gray-900 active:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`mr-1 text-xs font-bold ${
                      currentPage === totalPages
                        ? "text-gray-400"
                        : "text-white"
                    }`}
                  >
                    Next
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={currentPage === totalPages ? "#9CA3AF" : "#FFFFFF"}
                  />
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ========================================================
            PREMIUM DETAIL MODAL
        ======================================================== */}

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeFeedback}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="max-h-[92%] overflow-hidden rounded-t-[30px] bg-white">
              {/* HANDLE */}

              <View className="items-center pt-3">
                <View className="h-1.5 w-12 rounded-full bg-gray-200" />
              </View>

              {/* HEADER */}

              <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-4 pt-3">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <Ionicons
                      name="chatbubbles-outline"
                      size={18}
                      color="#111827"
                    />
                  </View>

                  <View className="ml-3">
                    <Text className="text-sm font-extrabold text-gray-900">
                      Feedback Details
                    </Text>

                    <Text className="mt-0.5 text-[10px] text-gray-400">
                      Your FinTrack submission
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={closeFeedback}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <Ionicons name="close" size={19} color="#4B5563" />
                </Pressable>
              </View>

              {/* CONTENT */}

              {selectedItem && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerClassName="px-5 pb-8"
                >
                  {(() => {
                    const statusConfig = getStatusConfig(selectedItem.status);

                    const priorityConfig = getPriorityConfig(
                      selectedItem.priority,
                    );

                    return (
                      <>
                        {/* ======================================
                            HERO
                        ====================================== */}

                        <View className="mt-4 rounded-[24px] border border-gray-200 bg-gray-50 p-5">
                          <View className="flex-row items-start justify-between">
                            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
                              <Ionicons
                                name={getTypeIcon(selectedItem.type)}
                                size={27}
                                color="#111827"
                              />
                            </View>

                            <View
                              className={`rounded-full border px-3 py-1.5 ${statusConfig.bg} ${statusConfig.border}`}
                            >
                              <Text
                                className={`text-[9px] font-extrabold uppercase tracking-wider ${statusConfig.text}`}
                              >
                                {statusConfig.label}
                              </Text>
                            </View>
                          </View>

                          <Text className="mt-5 text-[24px] font-extrabold leading-[31px] text-gray-950">
                            {selectedItem.subject}
                          </Text>

                          <View className="mt-3 flex-row items-center">
                            <Ionicons
                              name="document-text-outline"
                              size={13}
                              color="#9CA3AF"
                            />

                            <Text className="ml-1.5 text-[10px] font-medium text-gray-400">
                              {selectedItem.type}
                            </Text>
                          </View>
                        </View>

                        {/* ======================================
                            STATUS + PRIORITY
                        ====================================== */}

                        <View className="mt-5 flex-row gap-3">
                          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Status
                            </Text>

                            <View
                              className={`mt-2 self-start flex-row items-center rounded-lg px-2.5 py-1.5 ${statusConfig.bg}`}
                            >
                              <Ionicons
                                name={statusConfig.icon}
                                size={13}
                                color={statusConfig.iconColor}
                              />

                              <Text
                                className={`ml-1.5 text-[11px] font-bold ${statusConfig.text}`}
                              >
                                {statusConfig.label}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Priority
                            </Text>

                            <View
                              className={`mt-2 self-start flex-row items-center rounded-lg px-2.5 py-1.5 ${priorityConfig.bg}`}
                            >
                              <Ionicons
                                name={priorityConfig.icon}
                                size={12}
                                color={priorityConfig.iconColor}
                              />

                              <Text
                                className={`ml-1.5 text-[11px] font-bold ${priorityConfig.text}`}
                              >
                                {priorityConfig.label}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* ======================================
                            MESSAGE
                        ====================================== */}

                        <View className="mt-5">
                          <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                            Full Description
                          </Text>

                          <View className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <Text className="text-[14px] leading-[23px] text-gray-700">
                              {selectedItem.message}
                            </Text>
                          </View>
                        </View>

                        {/* ======================================
                            TIMELINE
                        ====================================== */}

                        <View className="mt-5">
                          <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                            Submission Timeline
                          </Text>

                          <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                            {/* CREATED */}

                            <View className="flex-row px-4 py-4">
                              <View className="items-center">
                                <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                                  <Ionicons
                                    name="paper-plane-outline"
                                    size={16}
                                    color="#4B5563"
                                  />
                                </View>

                                <View className="mt-1 h-6 w-px bg-gray-200" />
                              </View>

                              <View className="ml-3 flex-1">
                                <Text className="text-[11px] font-bold text-gray-900">
                                  Submitted
                                </Text>

                                <Text className="mt-0.5 text-[10px] leading-[16px] text-gray-400">
                                  {formatDateTime(selectedItem.createdAt)}
                                </Text>
                              </View>
                            </View>

                            {/* UPDATED */}

                            <View className="flex-row px-4 pb-4">
                              <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                                <Ionicons
                                  name="refresh-outline"
                                  size={16}
                                  color="#4B5563"
                                />
                              </View>

                              <View className="ml-3 flex-1">
                                <Text className="text-[11px] font-bold text-gray-900">
                                  Last Updated
                                </Text>

                                <Text className="mt-0.5 text-[10px] leading-[16px] text-gray-400">
                                  {formatDateTime(
                                    selectedItem.updatedAt ||
                                      selectedItem.createdAt,
                                  )}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* ======================================
                            META
                        ====================================== */}

                        <View className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <Text className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Submission Information
                          </Text>

                          <View className="mt-3 flex-row items-center justify-between">
                            <Text className="text-[11px] text-gray-400">
                              Feedback ID
                            </Text>

                            <Text
                              numberOfLines={1}
                              className="ml-4 max-w-[180px] text-[10px] font-bold text-gray-700"
                            >
                              {selectedItem._id}
                            </Text>
                          </View>

                          <View className="mt-3 flex-row items-center justify-between">
                            <Text className="text-[11px] text-gray-400">
                              Submitted
                            </Text>

                            <Text className="text-[10px] font-bold text-gray-700">
                              {formatDate(selectedItem.createdAt)}
                            </Text>
                          </View>
                        </View>

                        {/* ======================================
                            CLOSE
                        ====================================== */}

                        <Pressable
                          onPress={closeFeedback}
                          className="mt-4 h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
                        >
                          <Text className="text-sm font-bold text-gray-700">
                            Close
                          </Text>
                        </Pressable>
                      </>
                    );
                  })()}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
