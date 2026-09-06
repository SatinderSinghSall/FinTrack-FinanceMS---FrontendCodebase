import { useMemo, useState, useCallback, useRef } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { getSubscriptions } from "@/src/services/subscriptionApi";

export default function AnalyticsScreen() {
  const { width } = useWindowDimensions();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const isSmallScreen = width < 380;

  const horizontalPadding = isSmallScreen ? 16 : 20;

  /* =========================================================
     DATA
  ========================================================= */

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const data = await getSubscriptions();

      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchSubscriptions();

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        await fetchSubscriptions();

        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({
            y: 0,
            animated: false,
          });
        });
      };

      refresh();
    }, []),
  );

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, item) => {
      const amount = Number(item?.amount) || 0;

      switch (item?.billingCycle) {
        case "weekly":
          return acc + amount * 4;

        case "monthly":
          return acc + amount;

        case "quarterly":
          return acc + amount / 3;

        case "yearly":
          return acc + amount / 12;

        default:
          return acc;
      }
    }, 0);
  }, [subscriptions]);

  const yearlyProjection = totalMonthly * 12;

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => item?.status === "active");
  }, [subscriptions]);

  const cancelledSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => item?.status === "cancelled");
  }, [subscriptions]);

  const highestSubscription = useMemo(() => {
    if (subscriptions.length === 0) {
      return null;
    }

    return [...subscriptions].sort(
      (a, b) => (Number(b?.amount) || 0) - (Number(a?.amount) || 0),
    )[0];
  }, [subscriptions]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    subscriptions.forEach((item) => {
      const category = item?.category || "Other";
      const amount = Number(item?.amount) || 0;

      if (!totals[category]) {
        totals[category] = 0;
      }

      totals[category] += amount;
    });

    return Object.entries(totals).sort(([, a], [, b]) => b - a);
  }, [subscriptions]);

  const highestCategoryAmount = useMemo(() => {
    return Math.max(...categoryTotals.map(([, total]) => total), 1);
  }, [categoryTotals]);

  const isEmpty = subscriptions.length === 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Entertainment":
        return "play-circle-outline";

      case "Productivity":
        return "briefcase-outline";

      case "Finance":
        return "card-outline";

      case "Health":
        return "fitness-outline";

      case "Cloud":
        return "cloud-outline";

      case "Education":
        return "school-outline";

      default:
        return "grid-outline";
    }
  };

  const getCategoryColors = (index: number) => {
    const colors = [
      {
        bg: "bg-indigo-100",
        icon: "#4F46E5",
        bar: "bg-indigo-600",
      },
      {
        bg: "bg-violet-100",
        icon: "#7C3AED",
        bar: "bg-violet-600",
      },
      {
        bg: "bg-blue-100",
        icon: "#2563EB",
        bar: "bg-blue-600",
      },
      {
        bg: "bg-emerald-100",
        icon: "#059669",
        bar: "bg-emerald-600",
      },
      {
        bg: "bg-amber-100",
        icon: "#D97706",
        bar: "bg-amber-500",
      },
    ];

    return colors[index % colors.length];
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-[26px] bg-indigo-100 items-center justify-center">
            <Ionicons name="analytics-outline" size={36} color="#4F46E5" />
          </View>

          <ActivityIndicator size="small" color="#4F46E5" className="mt-7" />

          <Text className="text-zinc-950 text-2xl font-black mt-6 text-center">
            Loading Analytics
          </Text>

          <Text className="text-zinc-500 text-center leading-6 mt-3 max-w-[320px]">
            Preparing your subscription insights and spending overview...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     SCREEN
  ========================================================= */

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
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
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View
          className="pt-3 pb-5"
          style={{
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
              activeOpacity={0.75}
              className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={21} color="#18181B" />
            </TouchableOpacity>

            <View className="flex-1 ml-4">
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                Subscription
              </Text>

              <Text className="text-zinc-950 text-2xl font-black mt-0.5">
                Analytics
              </Text>
            </View>

            <View className="w-11 h-11 rounded-2xl bg-indigo-50 items-center justify-center">
              <Ionicons name="stats-chart-outline" size={20} color="#4F46E5" />
            </View>
          </View>
        </View>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {isEmpty ? (
          <View
            style={{
              paddingHorizontal: horizontalPadding,
            }}
          >
            <View className="bg-white border border-zinc-200 rounded-[30px] px-6 py-12 items-center">
              <View className="w-20 h-20 rounded-[26px] bg-indigo-50 items-center justify-center">
                <Ionicons name="analytics-outline" size={36} color="#4F46E5" />
              </View>

              <Text className="text-zinc-950 text-2xl font-black mt-6 text-center">
                No Analytics Yet
              </Text>

              <Text className="text-zinc-500 text-center leading-6 mt-3">
                Add your subscriptions to unlock spending insights, category
                breakdowns and yearly projections.
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
                }
                activeOpacity={0.8}
                className="bg-indigo-600 px-6 py-4 rounded-2xl mt-7"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={19} color="white" />

                  <Text className="text-white font-black ml-2">
                    Add Subscription
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* =================================================
                SPENDING OVERVIEW
            ================================================= */}

            <View
              style={{
                paddingHorizontal: horizontalPadding,
              }}
            >
              <View
                className="rounded-[30px] bg-indigo-600 overflow-hidden"
                style={{
                  shadowColor: "#4F46E5",
                  shadowOffset: {
                    width: 0,
                    height: 10,
                  },
                  shadowOpacity: 0.18,
                  shadowRadius: 18,
                  elevation: 7,
                }}
              >
                {/* Decorative background */}
                <View className="absolute -right-16 -top-20 w-52 h-52 rounded-full bg-white/10" />

                <View className="absolute -left-16 -bottom-24 w-48 h-48 rounded-full bg-white/5" />

                <View className="p-6">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider">
                        Monthly Spending
                      </Text>

                      <Text
                        className="text-white font-black mt-2"
                        style={{
                          fontSize: isSmallScreen ? 38 : 44,
                        }}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        ₹{formatAmount(totalMonthly)}
                      </Text>
                    </View>

                    <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center">
                      <Ionicons name="wallet-outline" size={24} color="white" />
                    </View>
                  </View>

                  <View className="h-px bg-white/15 my-5" />

                  <View className="flex-row">
                    <View className="flex-1">
                      <Text className="text-indigo-200 text-xs font-medium">
                        Active
                      </Text>

                      <Text className="text-white text-xl font-black mt-1">
                        {activeSubscriptions.length}
                      </Text>
                    </View>

                    <View className="w-px bg-white/15 mx-4" />

                    <View className="flex-1">
                      <Text className="text-indigo-200 text-xs font-medium">
                        Yearly Projection
                      </Text>

                      <Text
                        className="text-white text-xl font-black mt-1"
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        ₹{formatAmount(yearlyProjection)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* =================================================
                KEY METRICS
            ================================================= */}

            <View
              className="flex-row mt-5"
              style={{
                paddingHorizontal: horizontalPadding,
                gap: 12,
              }}
            >
              <View className="flex-1 bg-white border border-zinc-200 rounded-[24px] p-4">
                <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#059669"
                  />
                </View>

                <Text className="text-zinc-500 text-xs font-semibold mt-4">
                  Active
                </Text>

                <Text className="text-zinc-950 text-2xl font-black mt-1">
                  {activeSubscriptions.length}
                </Text>

                <Text className="text-emerald-600 text-[10px] font-bold mt-1">
                  Currently running
                </Text>
              </View>

              <View className="flex-1 bg-white border border-zinc-200 rounded-[24px] p-4">
                <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center">
                  <Ionicons
                    name="close-circle-outline"
                    size={21}
                    color="#DC2626"
                  />
                </View>

                <Text className="text-zinc-500 text-xs font-semibold mt-4">
                  Cancelled
                </Text>

                <Text className="text-zinc-950 text-2xl font-black mt-1">
                  {cancelledSubscriptions.length}
                </Text>

                <Text className="text-red-600 text-[10px] font-bold mt-1">
                  No longer active
                </Text>
              </View>
            </View>

            {/* =================================================
                HIGHEST SUBSCRIPTION
            ================================================= */}

            {highestSubscription && (
              <View
                className="mt-7"
                style={{
                  paddingHorizontal: horizontalPadding,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-zinc-950 text-xl font-black">
                      Highest Subscription
                    </Text>

                    <Text className="text-zinc-500 text-xs font-medium mt-1">
                      Your largest recurring payment
                    </Text>
                  </View>

                  <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center">
                    <Ionicons
                      name="trending-up-outline"
                      size={18}
                      color="#D97706"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (highestSubscription?._id) {
                      router.push(
                        `/(drawer)/(tabs)/subscriptions/${highestSubscription._id}`,
                      );
                    }
                  }}
                  className="bg-white border border-zinc-200 rounded-[26px] p-5"
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl bg-indigo-100 items-center justify-center">
                      <Ionicons name="card-outline" size={23} color="#4F46E5" />
                    </View>

                    <View className="flex-1 ml-3">
                      <Text className="text-zinc-950 text-base font-black">
                        {highestSubscription.name || "Subscription"}
                      </Text>

                      <Text className="text-zinc-500 text-xs font-medium mt-1">
                        {highestSubscription.category || "Recurring payment"}
                      </Text>
                    </View>

                    <View className="items-end ml-2">
                      <Text className="text-indigo-600 text-xl font-black">
                        ₹{formatAmount(Number(highestSubscription.amount) || 0)}
                      </Text>

                      <Text className="text-zinc-400 text-[10px] font-semibold mt-0.5">
                        {highestSubscription.billingCycle || "payment"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-4 pt-4 border-t border-zinc-100">
                    <Ionicons
                      name="information-circle-outline"
                      size={15}
                      color="#71717A"
                    />

                    <Text className="text-zinc-500 text-xs font-medium ml-2 flex-1">
                      This is the highest single subscription amount in your
                      current records.
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#A1A1AA"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* =================================================
                CATEGORY BREAKDOWN
            ================================================= */}

            <View
              className="mt-8"
              style={{
                paddingHorizontal: horizontalPadding,
              }}
            >
              <View className="mb-4">
                <Text className="text-zinc-950 text-xl font-black">
                  Category Breakdown
                </Text>

                <Text className="text-zinc-500 text-xs font-medium mt-1">
                  Where your subscription spending is going
                </Text>
              </View>

              <View className="bg-white border border-zinc-200 rounded-[28px] overflow-hidden">
                {categoryTotals.map(([category, total], index) => {
                  const percentage =
                    totalMonthly > 0 ? (Number(total) / totalMonthly) * 100 : 0;

                  const colors = getCategoryColors(index);

                  return (
                    <View key={category} className="px-5 py-4">
                      <View className="flex-row items-center">
                        <View
                          className={`w-10 h-10 rounded-xl items-center justify-center ${colors.bg}`}
                        >
                          <Ionicons
                            name={getCategoryIcon(category) as any}
                            size={19}
                            color={colors.icon}
                          />
                        </View>

                        <View className="flex-1 ml-3">
                          <Text className="text-zinc-900 text-sm font-black">
                            {category}
                          </Text>

                          <Text className="text-zinc-400 text-[10px] font-medium mt-0.5">
                            {percentage.toFixed(0)}% of monthly spending
                          </Text>
                        </View>

                        <View className="items-end">
                          <Text className="text-zinc-950 text-sm font-black">
                            ₹{formatAmount(Number(total))}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center mt-3 ml-[52px]">
                        <View className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <View
                            className={`h-full rounded-full ${colors.bar}`}
                            style={{
                              width: `${Math.min(
                                Math.max(percentage, 2),
                                100,
                              )}%`,
                            }}
                          />
                        </View>

                        <Text className="text-zinc-400 text-[9px] font-black ml-2">
                          {percentage.toFixed(0)}%
                        </Text>
                      </View>

                      {index < categoryTotals.length - 1 && (
                        <View className="h-px bg-zinc-100 mt-4" />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* =================================================
                INSIGHT
            ================================================= */}

            <View
              className="mt-8"
              style={{
                paddingHorizontal: horizontalPadding,
              }}
            >
              <View className="mb-4">
                <Text className="text-zinc-950 text-xl font-black">
                  Spending Insight
                </Text>

                <Text className="text-zinc-500 text-xs font-medium mt-1">
                  A quick look at your recurring commitment
                </Text>
              </View>

              <View className="bg-zinc-950 rounded-[28px] p-5 overflow-hidden">
                <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/5" />

                <View className="flex-row items-start">
                  <View className="w-11 h-11 rounded-2xl bg-white/10 items-center justify-center">
                    <Ionicons name="bulb-outline" size={21} color="white" />
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-white text-base font-black">
                      Yearly commitment
                    </Text>

                    <Text className="text-zinc-400 text-sm leading-6 mt-2">
                      Based on your current subscriptions, you're projected to
                      spend approximately{" "}
                      <Text className="text-white font-black">
                        ₹{formatAmount(yearlyProjection)}
                      </Text>{" "}
                      per year on recurring payments.
                    </Text>
                  </View>
                </View>

                <View className="h-px bg-white/10 my-4" />

                <View className="flex-row items-center">
                  <Ionicons name="repeat-outline" size={16} color="#A1A1AA" />

                  <Text className="text-zinc-400 text-xs font-medium ml-2">
                    {subscriptions.length} total subscription
                    {subscriptions.length === 1 ? "" : "s"} tracked
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
