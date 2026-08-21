import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  StatusBar,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";

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

const ITEMS_PER_PAGE = 4;

export default function MyFeedbackScreen() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchUserFeedbacks = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      const response = await api.get("/feedback");
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback history", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserFeedbacks();
  }, []);

  const onRefresh = () => {
    setCurrentPage(1);
    fetchUserFeedbacks(true);
  };

  // Filter and Search Logic
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchesSearch =
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());

      const status = item.status || "Pending";
      const matchesFilter =
        selectedFilter === "All" ||
        status.toLowerCase() === selectedFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [feedbacks, searchQuery, selectedFilter]);

  // Modern Pagination Logic
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE) || 1;

  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFeedbacks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFeedbacks, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: "checkmark-circle" as const,
        };
      case "in progress":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          icon: "time" as const,
        };
      default:
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: "alert-circle" as const,
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 border-red-200 bg-red-50";
      case "medium":
        return "text-amber-600 border-amber-200 bg-amber-50";
      default:
        return "text-emerald-600 border-emerald-200 bg-emerald-50";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-sm font-semibold text-slate-500">
          Syncing submissions...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop:
          Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
      }}
      className="px-5"
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#064E3B" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-base font-bold text-slate-900">
            My Submissions
          </Text>
          <Text className="text-[11px] text-slate-400">
            {filteredFeedbacks.length} total request
            {filteredFeedbacks.length === 1 ? "" : "s"}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Modern Search Input */}
      <View className="flex-row items-center bg-white border border-slate-200/80 rounded-2xl px-4 py-3 my-2 shadow-sm">
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          className="flex-1 ml-2.5 text-xs font-medium text-slate-800"
          placeholder="Search subject, bug reports..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(1);
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 6, maxHeight: 40 }}
        contentContainerStyle={{ gap: 8, alignItems: "center" }}
      >
        {["All", "Pending", "In Progress", "Resolved"].map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                setSelectedFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-xl border ${
                isActive
                  ? "bg-emerald-800 border-emerald-800 shadow-sm"
                  : "bg-white border-slate-200"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? "text-white" : "text-slate-600"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Submission List */}
      <FlatList
        data={paginatedFeedbacks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
        renderItem={({ item }) => {
          const status = item.status || "Pending";
          const statusConfig = getStatusConfig(status);
          const priorityStyle = getPriorityColor(item.priority);

          return (
            <TouchableOpacity
              className="bg-white p-4 rounded-2xl mb-3 border border-slate-200/80 shadow-sm"
              activeOpacity={0.8}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            >
              <View className="flex-row justify-between items-center mb-2.5">
                <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Ionicons
                    name="document-text-outline"
                    size={12}
                    color="#047857"
                  />
                  <Text className="text-[11px] font-bold text-slate-700 ml-1.5">
                    {item.type}
                  </Text>
                </View>
                <View
                  className={`flex-row items-center px-2 py-0.5 rounded-md border ${priorityStyle}`}
                >
                  <Text className="text-[10px] font-bold uppercase tracking-wider">
                    {item.priority}
                  </Text>
                </View>
              </View>

              <Text
                className="text-sm font-bold text-slate-900 mb-1"
                numberOfLines={1}
              >
                {item.subject}
              </Text>
              <Text
                className="text-xs text-slate-500 mb-3 leading-relaxed"
                numberOfLines={2}
              >
                {item.message}
              </Text>

              <View className="flex-row justify-between items-center border-t border-slate-100 pt-2.5">
                <View
                  className={`flex-row items-center px-2.5 py-1 rounded-md ${statusConfig.bg}`}
                >
                  <Ionicons
                    name={statusConfig.icon}
                    size={11}
                    color={
                      statusConfig.text === "text-emerald-700"
                        ? "#047857"
                        : statusConfig.text === "text-amber-700"
                          ? "#B45309"
                          : "#1D4ED8"
                    }
                  />
                  <Text
                    className={`text-[11px] font-semibold ml-1 ${statusConfig.text}`}
                  >
                    {status}
                  </Text>
                </View>
                <Text className="text-[10px] font-medium text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center mb-3">
              <Ionicons name="folder-open-outline" size={32} color="#059669" />
            </View>
            <Text className="text-sm font-bold text-slate-800">
              No submissions found
            </Text>
            <Text className="text-xs text-slate-400 text-center mt-1 max-w-[240px]">
              Try adjusting your query or filter parameters to locate requests.
            </Text>
          </View>
        }
      />

      {/* Modern Pagination Bar */}
      {filteredFeedbacks.length > 0 && (
        <View className="flex-row items-center justify-between bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl mb-3 shadow-sm">
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex-row items-center px-3 py-1.5 rounded-xl ${
              currentPage === 1 ? "opacity-40 bg-slate-100" : "bg-emerald-50"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={14} color="#047857" />
            <Text className="text-xs font-bold text-emerald-800 ml-1">
              Prev
            </Text>
          </TouchableOpacity>

          <Text className="text-xs font-semibold text-slate-600">
            Page{" "}
            <Text className="text-emerald-800 font-bold">{currentPage}</Text> of{" "}
            {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex-row items-center px-3 py-1.5 rounded-xl ${
              currentPage === totalPages
                ? "opacity-40 bg-slate-100"
                : "bg-emerald-50"
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold text-emerald-800 mr-1">
              Next
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#047857" />
          </TouchableOpacity>
        </View>
      )}

      {/* DETAIL MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[85%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center mr-2">
                  <Ionicons name="document-text" size={16} color="#059669" />
                </View>
                <Text className="text-base font-bold text-slate-900">
                  Submission Details
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {selectedItem &&
              (() => {
                const modalStatus = selectedItem.status || "Pending";
                const modalStatusConfig = getStatusConfig(modalStatus);

                return (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row justify-between items-center py-2">
                      <Text className="text-xs text-slate-400">
                        Category Type
                      </Text>
                      <Text className="text-xs font-bold text-slate-800">
                        {selectedItem.type}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center py-2">
                      <Text className="text-xs text-slate-400">
                        Priority Level
                      </Text>
                      <Text className="text-xs font-bold text-slate-800 uppercase">
                        {selectedItem.priority}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center py-2">
                      <Text className="text-xs text-slate-400">
                        Current Status
                      </Text>
                      <View
                        className={`flex-row items-center px-2.5 py-1 rounded-md ${modalStatusConfig.bg}`}
                      >
                        <Ionicons
                          name={modalStatusConfig.icon}
                          size={11}
                          color={
                            modalStatusConfig.text === "text-emerald-700"
                              ? "#047857"
                              : modalStatusConfig.text === "text-amber-700"
                                ? "#B45309"
                                : "#1D4ED8"
                          }
                        />
                        <Text
                          className={`text-[11px] font-semibold ml-1 ${modalStatusConfig.text}`}
                        >
                          {modalStatus}
                        </Text>
                      </View>
                    </View>

                    <View className="h-[1px] bg-slate-100 my-2" />

                    <Text className="text-xs text-slate-400 mb-1">
                      Subject Title
                    </Text>
                    <Text className="text-sm font-bold text-slate-900">
                      {selectedItem.subject}
                    </Text>

                    <Text className="text-xs text-slate-400 mt-3 mb-1">
                      Full Description
                    </Text>
                    <View className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <Text className="text-xs text-slate-700 leading-relaxed">
                        {selectedItem.message}
                      </Text>
                    </View>

                    <View className="mt-4 bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-2xl">
                      <Text className="text-xs font-bold text-emerald-900 mb-2">
                        Timeline Record
                      </Text>
                      <View className="flex-row items-center my-1.5">
                        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2.5" />
                        <View>
                          <Text className="text-xs font-semibold text-slate-800">
                            Created Date
                          </Text>
                          <Text
                            style={{ fontSize: 10 }}
                            className="text-slate-400"
                          >
                            {new Date(selectedItem.createdAt).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center my-1.5">
                        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2.5" />
                        <View>
                          <Text className="text-xs font-semibold text-slate-800">
                            Last Updated
                          </Text>
                          <Text
                            style={{ fontSize: 10 }}
                            className="text-slate-400"
                          >
                            {new Date(
                              selectedItem.updatedAt || selectedItem.createdAt,
                            ).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                );
              })()}

            <TouchableOpacity
              className="bg-emerald-800 py-3.5 rounded-xl items-center mt-4 shadow-sm"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-xs font-bold tracking-wide">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
