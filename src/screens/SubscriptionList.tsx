import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { router, useFocusEffect } from "expo-router";

import { getSubscriptions } from "@/src/services/subscriptionApi";

import { getDaysRemaining } from "@/src/utils/getDaysRemaining";

/* ================================================================
   TYPES
================================================================ */

type Subscription = {
  _id: string;

  name: string;

  category: string;

  amount: number;

  currency?: string;

  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly";

  startDate: string;

  nextRenewalDate: string;

  reminderDaysBefore: number;

  autoRenew: boolean;

  paymentMethod: string;

  notes: string;

  status: "active" | "cancelled";

  icon?: string;

  color?: string;

  createdAt?: string;

  updatedAt?: string;
};

/* ================================================================
   FILTERS
================================================================ */

const categories = [
  "All",
  "Entertainment",
  "Productivity",
  "Finance",
  "Health",
  "Cloud",
  "Education",
  "Other",
];

const statusFilters = [
  {
    label: "All",
    value: "all",
    icon: "apps-outline" as const,
  },
  {
    label: "Active",
    value: "active",
    icon: "checkmark-circle-outline" as const,
  },
  {
    label: "Cancelled",
    value: "cancelled",
    icon: "close-circle-outline" as const,
  },
];

/* ================================================================
   MAIN SCREEN
================================================================ */

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [error, setError] = useState("");

  /* ==============================================================
     PAGINATION
  ============================================================== */

  const ITEMS_PER_PAGE = 4;

  const [currentPage, setCurrentPage] = useState(1);

  /* ==============================================================
     FETCH SUBSCRIPTIONS
  ============================================================== */

  const fetchSubscriptions = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const data = await getSubscriptions();

      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Failed to fetch subscriptions:", err);

      setError("Unable to load your subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==============================================================
     INITIAL / FOCUS REFRESH
  ============================================================== */

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions(false);
    }, [fetchSubscriptions]),
  );

  /* ==============================================================
     REFRESH
  ============================================================== */

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      Keyboard.dismiss();

      await fetchSubscriptions(false);

      setCurrentPage(1);
    } finally {
      setRefreshing(false);
    }
  };

  /* ==============================================================
     SEARCH + FILTER
  ============================================================== */

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((item) => {
      const name = item.name?.toLowerCase() || "";

      const category = item.category?.toLowerCase() || "";

      const paymentMethod = item.paymentMethod?.toLowerCase() || "";

      const notes = item.notes?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        category.includes(query) ||
        paymentMethod.includes(query) ||
        notes.includes(query);

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [subscriptions, search, selectedCategory, selectedStatus]);

  /* ==============================================================
     RESET PAGINATION WHEN SEARCH / FILTER CHANGES
  ============================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStatus]);

  /* ==============================================================
     PAGINATION DATA
  ============================================================== */

  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE);

  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredSubscriptions.slice(startIndex, endIndex);
  }, [filteredSubscriptions, safeCurrentPage]);

  /* ==============================================================
     PAGINATION RANGE
  ============================================================== */

  const paginationStart =
    filteredSubscriptions.length === 0
      ? 0
      : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const paginationEnd = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredSubscriptions.length,
  );

  /* ==============================================================
     ACTIVE
  ============================================================== */

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => item.status === "active");
  }, [subscriptions]);

  /* ==============================================================
     CANCELLED
  ============================================================== */

  const cancelledSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => item.status === "cancelled");
  }, [subscriptions]);

  /* ==============================================================
     MONTHLY SPENDING
  ============================================================== */

  const monthlySpending = useMemo(() => {
    return activeSubscriptions.reduce((total, item) => {
      switch (item.billingCycle) {
        case "weekly":
          return total + (item.amount * 52) / 12;

        case "monthly":
          return total + item.amount;

        case "quarterly":
          return total + item.amount / 3;

        case "yearly":
          return total + item.amount / 12;

        default:
          return total;
      }
    }, 0);
  }, [activeSubscriptions]);

  /* ==============================================================
     YEARLY SPENDING
  ============================================================== */

  const yearlySpending = monthlySpending * 12;

  /* ==============================================================
     UPCOMING RENEWALS
  ============================================================== */

  const upcomingRenewals = useMemo(() => {
    return [...activeSubscriptions]
      .filter((item) => {
        const days = getDaysRemaining(item.nextRenewalDate);

        return days >= 0;
      })
      .sort(
        (a, b) =>
          new Date(a.nextRenewalDate).getTime() -
          new Date(b.nextRenewalDate).getTime(),
      )
      .slice(0, 3);
  }, [activeSubscriptions]);

  /* ==============================================================
     NEXT RENEWAL
  ============================================================== */

  const nextRenewal = upcomingRenewals[0];

  /* ==============================================================
     FILTER ACTIVE
  ============================================================== */

  const hasFilters =
    search.trim().length > 0 ||
    selectedCategory !== "All" ||
    selectedStatus !== "all";

  /* ==============================================================
     CLEAR FILTERS
  ============================================================== */

  const clearFilters = () => {
    Keyboard.dismiss();

    setSearch("");

    setSelectedCategory("All");

    setSelectedStatus("all");

    setCurrentPage(1);
  };

  /* ==============================================================
     OPEN DETAILS
  ============================================================== */

  const openDetails = (subscription: Subscription) => {
    Keyboard.dismiss();

    setSelectedSubscription(subscription);

    setShowDetailsModal(true);
  };

  /* ==============================================================
     CLOSE DETAILS
  ============================================================== */

  const closeDetails = () => {
    Keyboard.dismiss();

    setShowDetailsModal(false);

    setTimeout(() => {
      setSelectedSubscription(null);
    }, 200);
  };

  /* ==============================================================
     GO BACK
  ============================================================== */

  const handleBack = () => {
    Keyboard.dismiss();

    router.back();
  };

  /* ==============================================================
     PAGINATION ACTIONS
  ============================================================== */

  const goToPreviousPage = () => {
    if (safeCurrentPage > 1) {
      Keyboard.dismiss();

      setCurrentPage((page) => page - 1);
    }
  };

  const goToNextPage = () => {
    if (safeCurrentPage < totalPages) {
      Keyboard.dismiss();

      setCurrentPage((page) => page + 1);
    }
  };

  const goToPage = (page: number) => {
    Keyboard.dismiss();

    setCurrentPage(page);
  };

  /* ==============================================================
     LOADING
  ============================================================== */

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-20 h-20 rounded-[26px] bg-white items-center justify-center"
            style={{
              shadowColor: "#000000",
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.06,
              shadowRadius: 15,
              elevation: 3,
            }}
          >
            <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center">
              <Ionicons name="repeat-outline" size={26} color="#4F46E5" />
            </View>
          </View>

          <ActivityIndicator size="small" color="#4F46E5" className="mt-6" />

          <Text className="text-zinc-950 text-xl font-black mt-5">
            Loading subscriptions
          </Text>

          <Text className="text-zinc-500 text-sm text-center mt-2 leading-5">
            Preparing your recurring payments and renewal information.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==============================================================
     MAIN
  ============================================================== */

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
              colors={["#4F46E5"]}
            />
          }
          contentContainerStyle={{
            paddingBottom: 15,
          }}
        >
          {/* ======================================================
              HEADER
          ====================================================== */}

          <View className="px-5 pt-3">
            {/* BACK BUTTON */}

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleBack}
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200 items-center justify-center mb-4"
            >
              <Ionicons name="arrow-back" size={20} color="#18181B" />
            </TouchableOpacity>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-indigo-600 mr-2" />

                  <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-[1.5px]">
                    Recurring Payments
                  </Text>
                </View>

                <Text className="text-zinc-950 text-[30px] font-black mt-2">
                  All Subscriptions
                </Text>

                <Text className="text-zinc-500 text-sm mt-1 leading-5">
                  Everything you pay for, all in one place.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
                }
                className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center"
                style={{
                  shadowColor: "#4F46E5",
                  shadowOffset: {
                    width: 0,
                    height: 6,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <Ionicons name="add" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================================================
              OVERVIEW
          ====================================================== */}

          <View className="px-5 mt-6">
            <View
              className="bg-zinc-950 rounded-[30px] overflow-hidden"
              style={{
                shadowColor: "#000000",
                shadowOffset: {
                  width: 0,
                  height: 10,
                },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <View className="absolute -right-14 -top-16 w-44 h-44 rounded-full bg-indigo-500/15" />

              <View className="absolute -left-16 -bottom-20 w-48 h-48 rounded-full bg-white/5" />

              <View className="p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-11 h-11 rounded-2xl bg-indigo-500/15 items-center justify-center">
                      <Ionicons
                        name="wallet-outline"
                        size={21}
                        color="#A5B4FC"
                      />
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                        Monthly Commitment
                      </Text>

                      <Text
                        className="text-white text-2xl font-black mt-1"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        ₹
                        {monthlySpending.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end ml-3">
                    <Text className="text-zinc-500 text-[9px] font-bold uppercase">
                      Annual
                    </Text>

                    <Text className="text-white text-sm font-black mt-1">
                      ₹
                      {yearlySpending.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-white/10 my-5" />

                <View className="flex-row">
                  <OverviewMetric
                    label="Active"
                    value={activeSubscriptions.length}
                    icon="checkmark-circle-outline"
                  />

                  <View className="w-px bg-white/10 mx-5" />

                  <OverviewMetric
                    label="Cancelled"
                    value={cancelledSubscriptions.length}
                    icon="close-circle-outline"
                  />

                  <View className="w-px bg-white/10 mx-5" />

                  <OverviewMetric
                    label="Total"
                    value={subscriptions.length}
                    icon="layers-outline"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ======================================================
              NEXT RENEWAL
          ====================================================== */}

          {nextRenewal && (
            <View className="px-5 mt-5">
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => openDetails(nextRenewal)}
                className="bg-white rounded-[24px] border border-zinc-200 p-4"
              >
                <View className="flex-row items-center">
                  <View className="w-11 h-11 rounded-2xl bg-amber-50 items-center justify-center">
                    <Ionicons
                      name="calendar-outline"
                      size={21}
                      color="#D97706"
                    />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-zinc-400 text-[9px] font-black uppercase tracking-wider">
                      Next Renewal
                    </Text>

                    <Text
                      className="text-zinc-950 text-sm font-black mt-1"
                      numberOfLines={1}
                    >
                      {nextRenewal.name}
                    </Text>

                    <Text className="text-zinc-500 text-[10px] mt-1">
                      {formatDate(nextRenewal.nextRenewalDate)}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-zinc-950 text-sm font-black">
                      ₹{Number(nextRenewal.amount || 0).toLocaleString("en-IN")}
                    </Text>

                    <Text
                      className={`text-[9px] font-bold mt-1 ${
                        getDaysRemaining(nextRenewal.nextRenewalDate) <= 3
                          ? "text-amber-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {getRenewalText(
                        getDaysRemaining(nextRenewal.nextRenewalDate),
                      )}
                    </Text>
                  </View>

                  <View className="w-8 h-8 rounded-xl bg-zinc-100 items-center justify-center ml-3">
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color="#71717A"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ======================================================
              SEARCH
          ====================================================== */}

          <View className="px-5 mt-6">
            <View
              className="bg-white rounded-[22px] border border-zinc-200 flex-row items-center px-4"
              style={{
                minHeight: 56,
              }}
            >
              <View className="w-9 h-9 rounded-xl bg-zinc-100 items-center justify-center">
                <Ionicons name="search-outline" size={19} color="#71717A" />
              </View>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search subscriptions..."
                placeholderTextColor="#A1A1AA"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                className="flex-1 text-zinc-950 text-sm font-medium ml-3 py-3"
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setSearch("")}
                  className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="#52525B" />
                </TouchableOpacity>
              )}
            </View>

            {search.trim().length > 0 && (
              <View className="flex-row items-center justify-between mt-2 px-1">
                <Text className="text-zinc-400 text-[10px] font-semibold">
                  {filteredSubscriptions.length} result
                  {filteredSubscriptions.length === 1 ? "" : "s"} for "
                  {search.trim()}"
                </Text>

                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text className="text-indigo-600 text-[10px] font-black">
                    Clear search
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ======================================================
              STATUS FILTER
          ====================================================== */}

          <View className="mt-5">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            >
              {statusFilters.map((filter) => {
                const active = selectedStatus === filter.value;

                return (
                  <TouchableOpacity
                    key={filter.value}
                    activeOpacity={0.8}
                    onPress={() => setSelectedStatus(filter.value)}
                    className={`mr-2.5 px-4 py-2.5 rounded-xl flex-row items-center ${
                      active ? "bg-zinc-950" : "bg-white border border-zinc-200"
                    }`}
                  >
                    <Ionicons
                      name={filter.icon}
                      size={14}
                      color={active ? "white" : "#71717A"}
                    />

                    <Text
                      className={`text-xs font-black ml-1.5 ${
                        active ? "text-white" : "text-zinc-600"
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ======================================================
              CATEGORY FILTER
          ====================================================== */}

          <View className="mt-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            >
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <TouchableOpacity
                    key={category}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory(category)}
                    className={`mr-2 px-4 py-2.5 rounded-xl ${
                      active
                        ? "bg-indigo-600"
                        : "bg-white border border-zinc-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-black ${
                        active ? "text-white" : "text-zinc-600"
                      }`}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ======================================================
              ACTIVE FILTER SUMMARY
          ====================================================== */}

          <View className="px-5 mt-7">
            <View className="flex-row items-end justify-between">
              <View className="flex-1">
                <Text className="text-zinc-950 text-lg font-black">
                  My Subscriptions
                </Text>

                <Text className="text-zinc-400 text-[10px] font-semibold mt-1">
                  {filteredSubscriptions.length} subscription
                  {filteredSubscriptions.length === 1 ? "" : "s"} shown
                </Text>
              </View>

              {hasFilters && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={clearFilters}
                  className="flex-row items-center bg-indigo-50 px-3.5 py-2 rounded-xl"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={14}
                    color="#4F46E5"
                  />

                  <Text className="text-indigo-600 text-[10px] font-black ml-1.5">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ======================================================
              UPCOMING RENEWALS
          ====================================================== */}

          {upcomingRenewals.length > 0 && !hasFilters && (
            <View className="px-5 mt-5">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-zinc-950 text-base font-black">
                    Upcoming Renewals
                  </Text>

                  <Text className="text-zinc-400 text-[10px] font-medium mt-1">
                    Your next recurring payments
                  </Text>
                </View>

                <View className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center">
                  <Ionicons name="calendar-outline" size={17} color="#4F46E5" />
                </View>
              </View>

              {upcomingRenewals.map((subscription) => (
                <UpcomingRenewalRow
                  key={subscription._id}
                  subscription={subscription}
                  onPress={() => openDetails(subscription)}
                />
              ))}
            </View>
          )}

          {/* ======================================================
              ERROR
          ====================================================== */}

          {error ? (
            <View className="mx-5 mt-5 rounded-[26px] bg-red-50 border border-red-100 p-5">
              <View className="flex-row items-start">
                <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={22}
                    color="#DC2626"
                  />
                </View>

                <View className="flex-1 ml-3">
                  <Text className="text-red-950 text-sm font-black">
                    Something went wrong
                  </Text>

                  <Text className="text-red-700/70 text-xs mt-1 leading-5">
                    {error}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => fetchSubscriptions()}
                    className="self-start bg-red-600 rounded-xl px-4 py-2.5 mt-3"
                  >
                    <Text className="text-white text-xs font-black">
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {/* ======================================================
              EMPTY
          ====================================================== */}

          {!error && filteredSubscriptions.length === 0 && (
            <EmptySubscriptions
              hasSubscriptions={subscriptions.length > 0}
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          )}

          {/* ======================================================
              LIST
          ====================================================== */}

          {!error && paginatedSubscriptions.length > 0 && (
            <View className="px-5 mt-4">
              {paginatedSubscriptions.map((subscription) => (
                <SubscriptionListCard
                  key={subscription._id}
                  subscription={subscription}
                  onPress={() => openDetails(subscription)}
                />
              ))}
            </View>
          )}

          {/* ======================================================
              PAGINATION
          ====================================================== */}

          {!error && filteredSubscriptions.length > ITEMS_PER_PAGE && (
            <View className="px-5 mt-2">
              {/* RANGE */}

              <View className="items-center mb-3">
                <Text className="text-zinc-400 text-[10px] font-semibold">
                  Showing{" "}
                  <Text className="text-zinc-700 font-black">
                    {paginationStart}
                  </Text>
                  –
                  <Text className="text-zinc-700 font-black">
                    {paginationEnd}
                  </Text>{" "}
                  of{" "}
                  <Text className="text-zinc-700 font-black">
                    {filteredSubscriptions.length}
                  </Text>{" "}
                  subscriptions
                </Text>
              </View>

              {/* CONTROLS */}

              <View className="bg-white border border-zinc-200 rounded-[22px] p-2 flex-row items-center justify-between">
                {/* PREVIOUS */}

                <TouchableOpacity
                  activeOpacity={safeCurrentPage > 1 ? 0.75 : 1}
                  disabled={safeCurrentPage === 1}
                  onPress={goToPreviousPage}
                  className={`w-11 h-11 rounded-xl items-center justify-center ${
                    safeCurrentPage === 1 ? "bg-zinc-50" : "bg-zinc-100"
                  }`}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={safeCurrentPage === 1 ? "#D4D4D8" : "#3F3F46"}
                  />
                </TouchableOpacity>

                {/* PAGE NUMBERS */}

                <View className="flex-row items-center flex-1 justify-center">
                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1,
                  ).map((page) => {
                    const active = page === safeCurrentPage;

                    return (
                      <TouchableOpacity
                        key={page}
                        activeOpacity={0.75}
                        onPress={() => goToPage(page)}
                        className={`w-9 h-9 rounded-xl items-center justify-center mx-0.5 ${
                          active ? "bg-zinc-950" : "bg-transparent"
                        }`}
                      >
                        <Text
                          className={`text-xs font-black ${
                            active ? "text-white" : "text-zinc-500"
                          }`}
                        >
                          {page}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* NEXT */}

                <TouchableOpacity
                  activeOpacity={safeCurrentPage < totalPages ? 0.75 : 1}
                  disabled={safeCurrentPage === totalPages}
                  onPress={goToNextPage}
                  className={`w-11 h-11 rounded-xl items-center justify-center ${
                    safeCurrentPage === totalPages
                      ? "bg-zinc-50"
                      : "bg-zinc-100"
                  }`}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      safeCurrentPage === totalPages ? "#D4D4D8" : "#3F3F46"
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* PAGE INDICATOR */}

              <View className="items-center mt-3">
                <Text className="text-zinc-400 text-[9px] font-bold">
                  Page{" "}
                  <Text className="text-zinc-700 font-black">
                    {safeCurrentPage}
                  </Text>{" "}
                  of{" "}
                  <Text className="text-zinc-700 font-black">{totalPages}</Text>
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ========================================================
            DETAIL MODAL
        ======================================================== */}

        <SubscriptionDetailModal
          visible={showDetailsModal}
          subscription={selectedSubscription}
          onClose={closeDetails}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================================================================
   OVERVIEW METRIC
================================================================ */

function OverviewMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-1">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={13} color="#71717A" />

        <Text className="text-zinc-500 text-[9px] font-bold ml-1.5">
          {label}
        </Text>
      </View>

      <Text className="text-white text-lg font-black mt-1">{value}</Text>
    </View>
  );
}

/* ================================================================
   SUBSCRIPTION CARD
================================================================ */

function SubscriptionListCard({
  subscription,
  onPress,
}: {
  subscription: Subscription;
  onPress: () => void;
}) {
  const daysRemaining = getDaysRemaining(subscription.nextRenewalDate);

  const isActive = subscription.status === "active";

  const accent = subscription.color || "#6366F1";

  const monthlyEquivalent = getMonthlyEquivalent(subscription);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      className="bg-white rounded-[26px] border border-zinc-200 mb-3.5 overflow-hidden"
      style={{
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.035,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="p-4">
        <View className="flex-row items-center">
          <SubscriptionIcon subscription={subscription} size="large" />

          <View className="flex-1 ml-3">
            <View className="flex-row items-center">
              <Text
                className="text-zinc-950 text-[16px] font-black flex-1 pr-2"
                numberOfLines={1}
              >
                {subscription.name}
              </Text>

              <View
                className={`px-2.5 py-1 rounded-full ${
                  isActive ? "bg-emerald-50" : "bg-red-50"
                }`}
              >
                <Text
                  className={`text-[8px] font-black ${
                    isActive ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {isActive ? "ACTIVE" : "CANCELLED"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-1">
              <Text className="text-zinc-400 text-[10px] font-semibold">
                {subscription.category || "Other"}
              </Text>

              <View className="w-1 h-1 rounded-full bg-zinc-300 mx-2" />

              <Text className="text-zinc-400 text-[10px] font-medium">
                {getBillingLabel(subscription.billingCycle)}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-px bg-zinc-100 my-4" />

        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-zinc-400 text-[9px] font-black uppercase tracking-wider">
              Cost
            </Text>

            <View className="flex-row items-baseline mt-1">
              <Text className="text-zinc-950 text-xl font-black">
                {getCurrencySymbol(subscription.currency)}
                {Number(subscription.amount || 0).toLocaleString("en-IN")}
              </Text>

              <Text className="text-zinc-400 text-[9px] font-semibold ml-1">
                /{getBillingLabel(subscription.billingCycle).toLowerCase()}
              </Text>
            </View>

            <Text className="text-zinc-400 text-[9px] mt-1">
              ₹
              {monthlyEquivalent.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}{" "}
              monthly equivalent
            </Text>
          </View>

          <View className="items-end mr-3">
            <Text className="text-zinc-400 text-[9px] font-black uppercase tracking-wider">
              Renewal
            </Text>

            <Text className="text-zinc-800 text-xs font-black mt-1">
              {formatDate(subscription.nextRenewalDate)}
            </Text>

            {isActive && (
              <Text
                className={`text-[9px] font-bold mt-1 ${
                  daysRemaining <= 3 ? "text-amber-600" : "text-zinc-400"
                }`}
              >
                {getRenewalText(daysRemaining)}
              </Text>
            )}
          </View>

          <View className="w-9 h-9 rounded-xl bg-zinc-100 items-center justify-center">
            <Ionicons name="chevron-forward" size={16} color="#71717A" />
          </View>
        </View>
      </View>

      <View
        className="h-1"
        style={{
          backgroundColor: accent,
          opacity: isActive ? 1 : 0.3,
        }}
      />
    </TouchableOpacity>
  );
}

/* ================================================================
   UPCOMING RENEWAL
================================================================ */

function UpcomingRenewalRow({
  subscription,
  onPress,
}: {
  subscription: Subscription;
  onPress: () => void;
}) {
  const days = getDaysRemaining(subscription.nextRenewalDate);

  const urgent = days <= 3;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white border border-zinc-200 rounded-[22px] p-3.5 mb-2.5"
    >
      <View className="flex-row items-center">
        <SubscriptionIcon subscription={subscription} size="small" />

        <View className="flex-1 ml-3">
          <Text className="text-zinc-900 text-sm font-black" numberOfLines={1}>
            {subscription.name}
          </Text>

          <Text className="text-zinc-400 text-[10px] mt-1">
            {formatDate(subscription.nextRenewalDate)}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-zinc-950 text-sm font-black">
            {getCurrencySymbol(subscription.currency)}
            {Number(subscription.amount || 0).toLocaleString("en-IN")}
          </Text>

          <View
            className={`px-2 py-1 rounded-full mt-1 ${
              urgent ? "bg-amber-50" : "bg-zinc-100"
            }`}
          >
            <Text
              className={`text-[8px] font-black ${
                urgent ? "text-amber-700" : "text-zinc-500"
              }`}
            >
              {getRenewalText(days)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ================================================================
   ICON
================================================================ */

function SubscriptionIcon({
  subscription,
  size = "large",
}: {
  subscription: Subscription;
  size?: "small" | "large";
}) {
  const dimension =
    size === "large" ? "w-12 h-12 rounded-2xl" : "w-10 h-10 rounded-xl";

  const iconSize = size === "large" ? 22 : 18;

  const background = subscription.color || "#6366F1";

  const brandIcon = getSubscriptionIcon(subscription.name);

  return (
    <View
      className={`${dimension} items-center justify-center overflow-hidden`}
      style={{
        backgroundColor: background,
      }}
    >
      {subscription.icon ? (
        <Text className="text-white text-lg font-black" numberOfLines={1}>
          {subscription.icon}
        </Text>
      ) : (
        <Ionicons name={brandIcon} size={iconSize} color="white" />
      )}
    </View>
  );
}

/* ================================================================
   DETAIL MODAL
================================================================ */

function SubscriptionDetailModal({
  visible,
  subscription,
  onClose,
}: {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
}) {
  if (!subscription) {
    return null;
  }

  const isActive = subscription.status === "active";

  const daysRemaining = getDaysRemaining(subscription.nextRenewalDate);

  const monthlyEquivalent = getMonthlyEquivalent(subscription);

  const yearlyProjection = monthlyEquivalent * 12;

  const urgent = daysRemaining <= 3;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <SafeAreaView
          edges={["bottom"]}
          className="bg-zinc-50 rounded-t-[34px] overflow-hidden"
          style={{
            maxHeight: "94%",
          }}
        >
          <View className="bg-white border-b border-zinc-200 px-5 pt-3 pb-4">
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full bg-zinc-300" />
            </View>

            <View className="flex-row items-center">
              <SubscriptionIcon subscription={subscription} size="large" />

              <View className="flex-1 ml-3">
                <Text
                  className="text-zinc-950 text-xl font-black"
                  numberOfLines={1}
                >
                  {subscription.name}
                </Text>

                <View className="flex-row items-center mt-1">
                  <Text className="text-zinc-400 text-xs">
                    {subscription.category || "Other"}
                  </Text>

                  <View className="w-1 h-1 rounded-full bg-zinc-300 mx-2" />

                  <Text className="text-zinc-400 text-xs">
                    {getBillingLabel(subscription.billingCycle)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onClose}
                className="w-10 h-10 rounded-xl bg-zinc-100 items-center justify-center"
              >
                <Ionicons name="close" size={21} color="#3F3F46" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 30,
            }}
          >
            <View className="bg-zinc-950 rounded-[28px] p-5 overflow-hidden">
              <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-indigo-500/10" />

              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-zinc-500 text-[9px] font-black uppercase tracking-wider">
                    Subscription Cost
                  </Text>

                  <View className="flex-row items-baseline mt-1">
                    <Text className="text-white text-[30px] font-black">
                      {getCurrencySymbol(subscription.currency)}
                      {Number(subscription.amount || 0).toLocaleString("en-IN")}
                    </Text>

                    <Text className="text-zinc-500 text-xs font-semibold ml-1">
                      /
                      {getBillingLabel(subscription.billingCycle).toLowerCase()}
                    </Text>
                  </View>
                </View>

                <View
                  className={`px-3 py-1.5 rounded-full ${
                    isActive ? "bg-emerald-500/15" : "bg-red-500/15"
                  }`}
                >
                  <Text
                    className={`text-[8px] font-black ${
                      isActive ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {isActive ? "ACTIVE" : "CANCELLED"}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-white/10 my-5" />

              <View className="flex-row">
                <View className="flex-1">
                  <Text className="text-zinc-500 text-[8px] font-black uppercase">
                    Monthly Equivalent
                  </Text>

                  <Text className="text-white text-sm font-black mt-1">
                    ₹
                    {monthlyEquivalent.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>

                <View className="w-px bg-white/10 mx-5" />

                <View className="flex-1">
                  <Text className="text-zinc-500 text-[8px] font-black uppercase">
                    Yearly Projection
                  </Text>

                  <Text className="text-white text-sm font-black mt-1">
                    ₹
                    {yearlyProjection.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {isActive && (
              <View
                className={`mt-4 rounded-[22px] border p-4 ${
                  urgent
                    ? "bg-amber-50 border-amber-100"
                    : "bg-indigo-50 border-indigo-100"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-11 h-11 rounded-2xl items-center justify-center ${
                      urgent ? "bg-amber-100" : "bg-indigo-100"
                    }`}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={urgent ? "#D97706" : "#4F46E5"}
                    />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text
                      className={`text-xs font-black ${
                        urgent ? "text-amber-900" : "text-indigo-900"
                      }`}
                    >
                      {getRenewalText(daysRemaining)}
                    </Text>

                    <Text
                      className={`text-[10px] mt-1 ${
                        urgent ? "text-amber-700/70" : "text-indigo-700/70"
                      }`}
                    >
                      Next renewal on {formatDate(subscription.nextRenewalDate)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <ModalSection
              title="Subscription Information"
              icon="information-circle-outline"
            >
              <View className="flex-row flex-wrap justify-between">
                <DetailItem
                  label="Category"
                  value={subscription.category || "Other"}
                  icon="grid-outline"
                />

                <DetailItem
                  label="Billing Cycle"
                  value={getBillingLabel(subscription.billingCycle)}
                  icon="repeat-outline"
                />

                <DetailItem
                  label="Payment Method"
                  value={subscription.paymentMethod || "Not specified"}
                  icon="card-outline"
                />

                <DetailItem
                  label="Status"
                  value={isActive ? "Active" : "Cancelled"}
                  icon={
                    isActive
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  valueColor={isActive ? "#059669" : "#DC2626"}
                />
              </View>
            </ModalSection>

            <ModalSection title="Dates & Renewal" icon="calendar-outline">
              <View className="flex-row flex-wrap justify-between">
                <DetailItem
                  label="Start Date"
                  value={formatDate(subscription.startDate)}
                  icon="calendar-outline"
                />

                <DetailItem
                  label="Next Renewal"
                  value={formatDate(subscription.nextRenewalDate)}
                  icon="calendar-outline"
                />

                <DetailItem
                  label="Reminder"
                  value={`${subscription.reminderDaysBefore} days before`}
                  icon="notifications-outline"
                />

                <DetailItem
                  label="Auto Renew"
                  value={subscription.autoRenew ? "Enabled" : "Disabled"}
                  icon="refresh-outline"
                  valueColor={subscription.autoRenew ? "#059669" : "#71717A"}
                />
              </View>
            </ModalSection>

            <ModalSection title="Notes" icon="document-text-outline">
              <View className="bg-white rounded-2xl border border-zinc-200 p-4">
                {subscription.notes?.trim() ? (
                  <Text className="text-zinc-600 text-sm leading-6">
                    {subscription.notes}
                  </Text>
                ) : (
                  <View className="items-center py-2">
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color="#A1A1AA"
                    />

                    <Text className="text-zinc-400 text-xs mt-2">
                      No notes added.
                    </Text>
                  </View>
                )}
              </View>
            </ModalSection>

            <ModalSection title="Record Information" icon="layers-outline">
              <View className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <RecordRow label="Subscription ID" value={subscription._id} />

                {subscription.createdAt && (
                  <RecordRow
                    label="Created"
                    value={formatDate(subscription.createdAt)}
                  />
                )}

                {subscription.updatedAt && (
                  <RecordRow
                    label="Last Updated"
                    value={formatDate(subscription.updatedAt)}
                    last
                  />
                )}
              </View>
            </ModalSection>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();

                setTimeout(() => {
                  router.push({
                    pathname: "/(drawer)/(tabs)/subscriptions/edit/[id]",
                    params: {
                      id: subscription._id,
                    },
                  });
                }, 250);
              }}
              className="h-14 rounded-2xl bg-indigo-600 items-center justify-center flex-row mt-6"
              style={{
                shadowColor: "#4F46E5",
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.18,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Ionicons name="create-outline" size={19} color="white" />

              <Text className="text-white text-sm font-black ml-2">
                Edit Subscription
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="h-14 rounded-2xl bg-white border border-zinc-200 items-center justify-center mt-3"
            >
              <Text className="text-zinc-700 text-sm font-black">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/* ================================================================
   MODAL SECTION
================================================================ */

function ModalSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center">
          <Ionicons name={icon} size={16} color="#4F46E5" />
        </View>

        <Text className="text-zinc-900 text-sm font-black ml-2">{title}</Text>
      </View>

      {children}
    </View>
  );
}

/* ================================================================
   DETAIL ITEM
================================================================ */

function DetailItem({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  valueColor?: string;
}) {
  return (
    <View className="w-[48.5%] bg-white border border-zinc-200 rounded-2xl p-3.5 mb-2.5">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={14} color="#A1A1AA" />

        <Text className="text-zinc-400 text-[9px] font-bold ml-1.5">
          {label}
        </Text>
      </View>

      <Text
        className="text-sm font-black mt-2"
        style={{
          color: valueColor || "#18181B",
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

/* ================================================================
   RECORD ROW
================================================================ */

function RecordRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`px-4 py-3.5 flex-row items-center justify-between ${
        last ? "" : "border-b border-zinc-100"
      }`}
    >
      <Text className="text-zinc-400 text-[10px] font-bold">{label}</Text>

      <Text
        className="text-zinc-700 text-[10px] font-semibold ml-5 flex-1 text-right"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptySubscriptions({
  hasSubscriptions,
  hasFilters,
  onClear,
}: {
  hasSubscriptions: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <View className="mx-5 mt-5 bg-white rounded-[28px] border border-zinc-200 p-7 items-center">
      <View className="w-18 h-18 rounded-[24px] bg-indigo-50 items-center justify-center">
        <Ionicons
          name={hasSubscriptions ? "search-outline" : "repeat-outline"}
          size={29}
          color="#6366F1"
        />
      </View>

      <Text className="text-zinc-950 text-lg font-black mt-5 text-center">
        {hasSubscriptions ? "No subscriptions found" : "No subscriptions yet"}
      </Text>

      <Text className="text-zinc-500 text-sm text-center mt-2 leading-5 max-w-[290px]">
        {hasSubscriptions
          ? "Nothing matches your current search or filters. Try adjusting them."
          : "Add your first recurring subscription to start tracking your monthly commitments."}
      </Text>

      {hasSubscriptions && hasFilters && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onClear}
          className="mt-5 bg-zinc-950 rounded-2xl px-5 py-3.5"
        >
          <Text className="text-white text-sm font-black">Clear Filters</Text>
        </TouchableOpacity>
      )}

      {!hasSubscriptions && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
          }
          className="mt-5 bg-indigo-600 rounded-2xl px-5 py-3.5 flex-row items-center"
        >
          <Ionicons name="add" size={18} color="white" />

          <Text className="text-white text-sm font-black ml-2">
            Add Subscription
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ================================================================
   BRAND ICON
================================================================ */

function getSubscriptionIcon(name: string): keyof typeof Ionicons.glyphMap {
  const value = name?.toLowerCase() || "";

  if (value.includes("spotify")) {
    return "musical-notes";
  }

  if (value.includes("netflix")) {
    return "film-outline";
  }

  if (value.includes("youtube")) {
    return "logo-youtube";
  }

  if (value.includes("amazon")) {
    return "logo-amazon";
  }

  if (value.includes("chatgpt")) {
    return "sparkles-outline";
  }

  if (value.includes("apple")) {
    return "logo-apple";
  }

  if (value.includes("google")) {
    return "logo-google";
  }

  if (value.includes("microsoft")) {
    return "logo-microsoft";
  }

  if (value.includes("dropbox")) {
    return "cloud-outline";
  }

  if (value.includes("drive")) {
    return "logo-google";
  }

  return "repeat-outline";
}

/* ================================================================
   BILLING LABEL
================================================================ */

function getBillingLabel(billingCycle: string) {
  switch (billingCycle) {
    case "weekly":
      return "Weekly";

    case "monthly":
      return "Monthly";

    case "quarterly":
      return "Quarterly";

    case "yearly":
      return "Yearly";

    default:
      return billingCycle || "Monthly";
  }
}

/* ================================================================
   CURRENCY
================================================================ */

function getCurrencySymbol(currency?: string) {
  switch (currency?.toUpperCase()) {
    case "INR":
      return "₹";

    case "USD":
      return "$";

    case "EUR":
      return "€";

    case "GBP":
      return "£";

    case "JPY":
      return "¥";

    default:
      return currency ? `${currency} ` : "₹";
  }
}

/* ================================================================
   DATE FORMAT
================================================================ */

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ================================================================
   RENEWAL TEXT
================================================================ */

function getRenewalText(days: number) {
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  }

  if (days === 0) {
    return "Renews today";
  }

  if (days === 1) {
    return "Renews tomorrow";
  }

  return `${days} days remaining`;
}

/* ================================================================
   MONTHLY EQUIVALENT
================================================================ */

function getMonthlyEquivalent(subscription: Subscription) {
  switch (subscription.billingCycle) {
    case "weekly":
      return (subscription.amount * 52) / 12;

    case "monthly":
      return subscription.amount;

    case "quarterly":
      return subscription.amount / 3;

    case "yearly":
      return subscription.amount / 12;

    default:
      return subscription.amount;
  }
}
