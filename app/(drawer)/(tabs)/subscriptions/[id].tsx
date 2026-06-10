import { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import api from "@/src/services/api";

import { getDaysRemaining } from "@/src/utils/getDaysRemaining";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams();

  const [subscription, setSubscription] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/subscriptions/${id}`);

      setSubscription(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;

    return getDaysRemaining(subscription.nextRenewalDate);
  }, [subscription]);

  const yearlyCost = useMemo(() => {
    if (!subscription) return 0;

    switch (subscription.billingCycle) {
      case "weekly":
        return subscription.amount * 52;

      case "monthly":
        return subscription.amount * 12;

      case "quarterly":
        return subscription.amount * 4;

      case "yearly":
        return subscription.amount;

      default:
        return subscription.amount;
    }
  }, [subscription]);

  const getBrandIcon = () => {
    const name = subscription?.name?.toLowerCase();

    if (name?.includes("spotify")) {
      return "musical-notes";
    }

    if (name?.includes("netflix")) {
      return "film";
    }

    if (name?.includes("youtube")) {
      return "logo-youtube";
    }

    if (name?.includes("amazon")) {
      return "logo-amazon";
    }

    if (name?.includes("chatgpt")) {
      return "sparkles";
    }

    return "albums";
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-100">
        <ActivityIndicator size="large" color="#4F46E5" />

        <Text className="text-zinc-500 mt-4 font-medium">
          Loading subscription...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        {/* HERO */}

        <View className="bg-indigo-600 pt-20 pb-16 px-5 rounded-b-[48px]">
          {/* TOP BAR */}

          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
              className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(drawer)/(tabs)/subscriptions/edit/[id]",
                  params: {
                    id: subscription._id,
                  },
                })
              }
              className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center"
            >
              <Ionicons name="create-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* HERO CONTENT */}

          <View className="items-center mt-10">
            <View className="bg-white/20 w-32 h-32 rounded-full items-center justify-center">
              <Ionicons name={getBrandIcon()} size={60} color="white" />
            </View>

            <Text className="text-white text-4xl font-black mt-8 text-center">
              {subscription.name}
            </Text>

            <Text className="text-indigo-100 text-lg mt-3">
              {subscription.category}
            </Text>

            {/* STATUS BADGES */}

            <View className="flex-row mt-6">
              <View className="bg-white/20 px-5 py-3 rounded-2xl mr-3">
                <Text className="text-white font-black">
                  {daysRemaining} days left
                </Text>
              </View>

              <View className="bg-emerald-400/20 px-5 py-3 rounded-2xl">
                <Text className="text-emerald-100 font-black capitalize">
                  {subscription.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* OVERVIEW */}

        <View className="px-5 mt-8">
          <Text className="text-zinc-900 text-2xl font-black mb-4">
            Overview
          </Text>

          {/* MAIN PRICE CARD */}

          <View className="bg-white rounded-[32px] border border-zinc-200 p-6 mb-5">
            <Text className="text-zinc-500 font-medium">Subscription Cost</Text>

            <Text className="text-zinc-900 text-5xl font-black mt-3">
              ₹{subscription.amount}
            </Text>

            <Text className="text-zinc-500 mt-2 capitalize">
              billed {subscription.billingCycle}
            </Text>
          </View>

          {/* STATS GRID */}

          <View className="flex-row justify-between mb-5">
            <View className="bg-white rounded-[28px] border border-zinc-200 p-5 w-[48%]">
              <View className="bg-indigo-100 w-12 h-12 rounded-2xl items-center justify-center">
                <Ionicons name="calendar-outline" size={24} color="#4F46E5" />
              </View>

              <Text className="text-zinc-500 mt-4">Renewal</Text>

              <Text className="text-zinc-900 text-lg font-black mt-2">
                {new Date(subscription.nextRenewalDate).toLocaleDateString()}
              </Text>
            </View>

            <View className="bg-white rounded-[28px] border border-zinc-200 p-5 w-[48%]">
              <View className="bg-emerald-100 w-12 h-12 rounded-2xl items-center justify-center">
                <Ionicons name="cash-outline" size={24} color="#059669" />
              </View>

              <Text className="text-zinc-500 mt-4">Yearly Cost</Text>

              <Text className="text-zinc-900 text-2xl font-black mt-2">
                ₹{yearlyCost}
              </Text>
            </View>
          </View>

          {/* DETAILS CARD */}

          <View className="bg-white rounded-[32px] border border-zinc-200 p-6 mb-5">
            <Text className="text-zinc-900 text-xl font-black mb-6">
              Subscription Details
            </Text>

            {/* ROW */}

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-zinc-500">Billing Cycle</Text>

              <Text className="text-zinc-900 font-black capitalize">
                {subscription.billingCycle}
              </Text>
            </View>

            {/* ROW */}

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-zinc-500">Payment Method</Text>

              <Text className="text-zinc-900 font-black">
                {subscription.paymentMethod || "N/A"}
              </Text>
            </View>

            {/* ROW */}

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-zinc-500">Reminder</Text>

              <Text className="text-zinc-900 font-black">
                {subscription.reminderDaysBefore} days before
              </Text>
            </View>

            {/* ROW */}

            <View className="flex-row items-center justify-between">
              <Text className="text-zinc-500">Auto Renew</Text>

              <Text
                className={`font-black ${
                  subscription.autoRenew ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {subscription.autoRenew ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>

          {/* NOTES */}

          <View className="bg-white rounded-[32px] border border-zinc-200 p-6 mb-8">
            <Text className="text-zinc-900 text-xl font-black mb-4">Notes</Text>

            <Text className="text-zinc-600 leading-7 text-base">
              {subscription.notes || "No additional notes added."}
            </Text>
          </View>

          {/* ACTION BUTTONS */}

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(drawer)/(tabs)/subscriptions/edit/[id]",
                params: {
                  id: subscription._id,
                },
              })
            }
            className="bg-indigo-600 rounded-3xl py-5 items-center mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="create-outline" size={22} color="white" />

              <Text className="text-white font-black text-lg ml-2">
                Edit Subscription
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-red-500 rounded-3xl py-5 items-center">
            <View className="flex-row items-center">
              <Ionicons name="trash-outline" size={22} color="white" />

              <Text className="text-white font-black text-lg ml-2">
                Delete Subscription
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
