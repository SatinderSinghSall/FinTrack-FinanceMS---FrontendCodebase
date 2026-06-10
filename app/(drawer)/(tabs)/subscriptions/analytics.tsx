import { useEffect, useMemo, useState } from "react";

import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { getSubscriptions } from "@/src/services/subscriptionApi";

export default function AnalyticsScreen() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const fetchSubscriptions = async () => {
    try {
      const data = await getSubscriptions();

      setSubscriptions(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  /* =========================
     ANALYTICS
  ========================= */

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, item) => {
      switch (item.billingCycle) {
        case "weekly":
          return acc + item.amount * 4;

        case "monthly":
          return acc + item.amount;

        case "quarterly":
          return acc + item.amount / 3;

        case "yearly":
          return acc + item.amount / 12;

        default:
          return acc;
      }
    }, 0);
  }, [subscriptions]);

  const yearlyProjection = totalMonthly * 12;

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "active",
  );

  const cancelledSubscriptions = subscriptions.filter(
    (item) => item.status === "cancelled",
  );

  const highestSubscription =
    subscriptions.length > 0
      ? [...subscriptions].sort((a, b) => b.amount - a.amount)[0]
      : null;

  const categoryTotals = useMemo(() => {
    const totals: any = {};

    subscriptions.forEach((item) => {
      if (!totals[item.category]) {
        totals[item.category] = 0;
      }

      totals[item.category] += item.amount;
    });

    return Object.entries(totals);
  }, [subscriptions]);

  const isEmpty = subscriptions.length === 0;

  return (
    <View className="flex-1 bg-zinc-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* HEADER */}

        <View className="px-5 pt-16 pb-8">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
              className="bg-white border border-zinc-200 w-12 h-12 rounded-2xl items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#18181b" />
            </TouchableOpacity>

            <Text className="text-zinc-900 text-3xl font-black">Analytics</Text>

            <View
              style={{
                width: 48,
              }}
            />
          </View>
        </View>

        {/* HERO */}

        <View className="px-5">
          <View className="bg-indigo-600 rounded-[36px] p-7 overflow-hidden">
            {/* DECOR */}

            <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />

            {/* CONTENT */}

            <Text className="text-indigo-100 text-sm font-medium">
              Monthly Subscription Spending
            </Text>

            <Text className="text-white text-5xl font-black mt-3">
              ₹{Math.round(totalMonthly)}
            </Text>

            <View className="flex-row items-center mt-7">
              <View className="bg-white/20 px-5 py-3 rounded-2xl mr-3">
                <Text className="text-white font-bold">
                  {activeSubscriptions.length} Active
                </Text>
              </View>

              <View className="bg-white/20 px-5 py-3 rounded-2xl">
                <Text className="text-white font-bold">
                  ₹{Math.round(yearlyProjection)}
                  /year
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* EMPTY STATE */}

        {isEmpty ? (
          <View className="px-5 mt-8">
            <View className="bg-white border border-zinc-200 rounded-[36px] p-10 items-center">
              {/* ICON */}

              <View className="bg-indigo-100 w-24 h-24 rounded-full items-center justify-center">
                <Ionicons name="analytics" size={48} color="#4F46E5" />
              </View>

              {/* TEXT */}

              <Text className="text-zinc-900 text-3xl font-black mt-8 text-center">
                No Analytics Yet
              </Text>

              <Text className="text-zinc-500 text-center leading-7 mt-4 text-base">
                Add subscriptions to unlock spending insights, category
                analytics and yearly projections.
              </Text>

              {/* BUTTON */}

              <TouchableOpacity
                onPress={() =>
                  router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
                }
                className="bg-indigo-600 px-8 py-5 rounded-3xl mt-8"
              >
                <Text className="text-white font-black text-lg">
                  Add Subscription
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* QUICK STATS */}

            <View className="px-5 mt-6 flex-row justify-between">
              {/* ACTIVE */}

              <View className="bg-white border border-zinc-200 rounded-[28px] p-5 w-[48%]">
                <View className="bg-emerald-100 w-12 h-12 rounded-2xl items-center justify-center">
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                </View>

                <Text className="text-zinc-500 mt-4">Active</Text>

                <Text className="text-zinc-900 text-3xl font-black mt-1">
                  {activeSubscriptions.length}
                </Text>
              </View>

              {/* CANCELLED */}

              <View className="bg-white border border-zinc-200 rounded-[28px] p-5 w-[48%]">
                <View className="bg-red-100 w-12 h-12 rounded-2xl items-center justify-center">
                  <Ionicons name="close-circle" size={24} color="#DC2626" />
                </View>

                <Text className="text-zinc-500 mt-4">Cancelled</Text>

                <Text className="text-zinc-900 text-3xl font-black mt-1">
                  {cancelledSubscriptions.length}
                </Text>
              </View>
            </View>

            {/* HIGHEST SUB */}

            <View className="px-5 mt-8">
              <Text className="text-zinc-900 text-2xl font-black mb-4">
                Highest Subscription
              </Text>

              <View className="bg-white border border-zinc-200 rounded-[32px] p-6">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-zinc-500">Most Expensive</Text>

                    <Text className="text-zinc-900 text-3xl font-black mt-2">
                      {highestSubscription?.name}
                    </Text>
                  </View>

                  <Text className="text-indigo-600 text-4xl font-black">
                    ₹{highestSubscription?.amount}
                  </Text>
                </View>
              </View>
            </View>

            {/* CATEGORY */}

            <View className="px-5 mt-8">
              <Text className="text-zinc-900 text-2xl font-black mb-4">
                Category Breakdown
              </Text>

              {categoryTotals.map(([category, total]: any) => (
                <View
                  key={category}
                  className="bg-white border border-zinc-200 rounded-[28px] p-5 mb-4"
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-zinc-900 text-lg font-black">
                      {category}
                    </Text>

                    <Text className="text-indigo-600 text-xl font-black">
                      ₹{total}
                    </Text>
                  </View>

                  {/* PROGRESS */}

                  <View className="bg-zinc-200 h-3 rounded-full overflow-hidden">
                    <View
                      className="bg-indigo-600 h-full rounded-full"
                      style={{
                        width: `${(total / totalMonthly) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* INSIGHTS */}

            <View className="px-5 mt-8">
              <Text className="text-zinc-900 text-2xl font-black mb-4">
                Insights
              </Text>

              <View className="bg-white border border-zinc-200 rounded-[32px] p-6">
                <View className="flex-row items-start">
                  <View className="bg-indigo-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="trending-up" size={28} color="#4F46E5" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-zinc-900 text-lg font-black">
                      Spending Insight
                    </Text>

                    <Text className="text-zinc-600 leading-7 mt-2">
                      You are projected to spend approximately ₹
                      {Math.round(yearlyProjection)} yearly on subscriptions.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* FOOTER */}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
