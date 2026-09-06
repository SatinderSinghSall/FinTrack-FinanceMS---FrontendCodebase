import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchSubscription();
      }
    }, [id]),
  );

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

  const monthlyEquivalent = useMemo(() => {
    if (!subscription) return 0;

    return yearlyCost / 12;
  }, [subscription, yearlyCost]);

  const getBrandIcon = (): keyof typeof Ionicons.glyphMap => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRenewalLabel = () => {
    if (daysRemaining < 0) {
      return "Renewal overdue";
    }

    if (daysRemaining === 0) {
      return "Renews today";
    }

    if (daysRemaining === 1) {
      return "Renews tomorrow";
    }

    return `Renews in ${daysRemaining} days`;
  };

  const getRenewalColor = () => {
    if (daysRemaining <= 1) {
      return "#EF4444";
    }

    if (daysRemaining <= 7) {
      return "#F59E0B";
    }

    return "#10B981";
  };

  const getRenewalBackground = () => {
    if (daysRemaining <= 1) {
      return "bg-red-50";
    }

    if (daysRemaining <= 7) {
      return "bg-amber-50";
    }

    return "bg-emerald-50";
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete ${subscription?.name ?? "this subscription"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            /*
             * Delete API is not currently implemented on this screen.
             * Keep this callback ready for the delete endpoint.
             */
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-100">
        <View className="flex-1 px-5">
          {/* Loading Header */}
          <View className="flex-row items-center justify-between pt-3">
            <View className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 items-center justify-center">
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>

            <View className="items-center">
              <View className="w-20 h-3 rounded-full bg-zinc-200" />
              <View className="w-32 h-6 rounded-full bg-zinc-200 mt-2" />
            </View>

            <View className="w-12 h-12 rounded-2xl bg-white border border-zinc-200" />
          </View>

          {/* Loading Hero */}
          <View className="bg-indigo-600 rounded-[36px] mt-6 h-[340px] items-center justify-center">
            <View className="w-28 h-28 rounded-full bg-white/15 items-center justify-center">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>

            <View className="w-44 h-7 bg-white/15 rounded-full mt-7" />

            <View className="w-28 h-4 bg-white/10 rounded-full mt-3" />

            <View className="w-52 h-12 bg-white/10 rounded-2xl mt-6" />
          </View>

          {/* Loading Cards */}
          <View className="flex-row justify-between mt-6">
            <View className="w-[48%] h-32 bg-white rounded-3xl border border-zinc-200" />
            <View className="w-[48%] h-32 bg-white rounded-3xl border border-zinc-200" />
          </View>

          <View className="h-40 bg-white rounded-3xl border border-zinc-200 mt-4" />

          <Text className="text-zinc-500 text-center mt-5 font-medium">
            Loading subscription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-100">
        <View className="flex-1 items-center justify-center px-7">
          <View className="w-24 h-24 rounded-[30px] bg-red-50 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          </View>

          <Text className="text-zinc-900 text-2xl font-black mt-6">
            Subscription Not Found
          </Text>

          <Text className="text-zinc-500 text-center mt-2 leading-6">
            We couldn't find the subscription you're looking for.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
            className="bg-indigo-600 rounded-2xl px-7 py-4 mt-7"
          >
            <Text className="text-white font-black">Back to Subscriptions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renewalColor = getRenewalColor();

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 15,
        }}
      >
        {/* =====================================================
            TOP BAR
        ====================================================== */}
        <View className="px-5 pt-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
              className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="#18181B" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[2px]">
                Subscription
              </Text>

              <Text className="text-zinc-900 text-lg font-black mt-1">
                Details
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: "/(drawer)/(tabs)/subscriptions/edit/[id]",
                  params: {
                    id: subscription._id,
                  },
                })
              }
              className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center"
            >
              <Ionicons name="create-outline" size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* =====================================================
            HERO
        ====================================================== */}
        <View className="mx-5 mt-5 bg-indigo-600 rounded-[38px] overflow-hidden">
          {/* Decorative circles */}
          <View
            className="absolute bg-white/5 rounded-full"
            style={{
              width: 190,
              height: 190,
              top: -90,
              right: -60,
            }}
          />

          <View
            className="absolute bg-white/5 rounded-full"
            style={{
              width: 150,
              height: 150,
              bottom: -80,
              left: -60,
            }}
          />

          <View className="px-6 pt-8 pb-8">
            {/* Active Status */}
            <View className="flex-row justify-between items-center">
              <View className="bg-white/15 border border-white/10 px-3.5 py-2 rounded-full flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      subscription.status === "active" ? "#34D399" : "#F87171",
                  }}
                />

                <Text className="text-white text-xs font-black capitalize">
                  {subscription.status}
                </Text>
              </View>

              <View className="bg-white/10 px-3.5 py-2 rounded-full">
                <Text className="text-indigo-100 text-xs font-bold">
                  {subscription.category}
                </Text>
              </View>
            </View>

            {/* Icon */}
            <View className="items-center mt-8">
              <View className="w-28 h-28 rounded-[34px] bg-white/15 border border-white/10 items-center justify-center">
                <View className="w-20 h-20 rounded-[26px] bg-white/10 items-center justify-center">
                  <Ionicons name={getBrandIcon()} size={46} color="#FFFFFF" />
                </View>
              </View>

              <Text className="text-white text-[30px] font-black text-center mt-6">
                {subscription.name}
              </Text>

              <Text className="text-indigo-100 text-sm font-medium mt-1">
                {subscription.billingCycle} subscription
              </Text>
            </View>

            {/* Price */}
            <View className="items-center mt-7">
              <Text className="text-indigo-100 text-xs font-bold uppercase tracking-widest">
                Current Price
              </Text>

              <View className="flex-row items-baseline mt-1">
                <Text className="text-white text-5xl font-black">
                  ₹{formatCurrency(subscription.amount)}
                </Text>
              </View>

              <Text className="text-indigo-100 text-sm font-semibold mt-1 capitalize">
                per {subscription.billingCycle}
              </Text>
            </View>

            {/* Renewal */}
            <View className="mt-7 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-white/10 items-center justify-center">
                <Ionicons name="calendar-outline" size={21} color="#FFFFFF" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-indigo-100 text-xs font-semibold">
                  Next renewal
                </Text>

                <Text className="text-white font-black text-base mt-0.5">
                  {formatDate(subscription.nextRenewalDate)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-white font-black">{daysRemaining}</Text>

                <Text className="text-indigo-100 text-[10px] font-bold">
                  DAYS LEFT
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            RENEWAL ALERT
        ====================================================== */}
        <View className="px-5 mt-5">
          <View
            className={`${getRenewalBackground()} rounded-2xl px-4 py-4 flex-row items-center`}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{
                backgroundColor: `${renewalColor}18`,
              }}
            >
              <Ionicons
                name={daysRemaining <= 1 ? "warning-outline" : "time-outline"}
                size={20}
                color={renewalColor}
              />
            </View>

            <View className="ml-3 flex-1">
              <Text
                className="font-black text-sm"
                style={{
                  color: renewalColor,
                }}
              >
                {getRenewalLabel()}
              </Text>

              <Text className="text-zinc-500 text-xs mt-0.5">
                Keep your upcoming subscription payment in mind.
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            OVERVIEW
        ====================================================== */}
        <View className="px-5 mt-7">
          <View className="flex-row items-end justify-between mb-4">
            <View>
              <Text className="text-zinc-900 text-2xl font-black">
                Overview
              </Text>

              <Text className="text-zinc-500 text-xs mt-1">
                Your subscription at a glance
              </Text>
            </View>

            <View className="bg-indigo-50 px-3 py-2 rounded-full">
              <Text className="text-indigo-600 text-xs font-black">
                {subscription.category}
              </Text>
            </View>
          </View>

          {/* Cost Card */}
          <View className="bg-white rounded-[30px] border border-zinc-200 p-6 mb-4">
            <View className="flex-row items-start justify-between">
              <View>
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center">
                    <Ionicons name="wallet-outline" size={19} color="#4F46E5" />
                  </View>

                  <View className="ml-3">
                    <Text className="text-zinc-500 text-xs font-semibold">
                      Subscription Cost
                    </Text>

                    <Text className="text-zinc-900 text-3xl font-black mt-0.5">
                      ₹{formatCurrency(subscription.amount)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-zinc-100 px-3 py-2 rounded-xl">
                <Text className="text-zinc-600 text-xs font-black capitalize">
                  {subscription.billingCycle}
                </Text>
              </View>
            </View>

            <View className="h-px bg-zinc-100 my-5" />

            <View className="flex-row justify-between">
              <View>
                <Text className="text-zinc-400 text-xs font-semibold">
                  Monthly equivalent
                </Text>

                <Text className="text-zinc-900 font-black text-lg mt-1">
                  ₹{formatCurrency(monthlyEquivalent)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-zinc-400 text-xs font-semibold">
                  Annual projection
                </Text>

                <Text className="text-zinc-900 font-black text-lg mt-1">
                  ₹{formatCurrency(yearlyCost)}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between">
            {/* Renewal */}
            <View className="bg-white rounded-[28px] border border-zinc-200 p-5 w-[48%]">
              <View className="w-11 h-11 rounded-2xl bg-blue-50 items-center justify-center">
                <Ionicons name="calendar-outline" size={21} color="#2563EB" />
              </View>

              <Text className="text-zinc-400 text-xs font-semibold mt-4">
                Next Renewal
              </Text>

              <Text className="text-zinc-900 text-base font-black mt-1">
                {formatDate(subscription.nextRenewalDate)}
              </Text>
            </View>

            {/* Yearly */}
            <View className="bg-white rounded-[28px] border border-zinc-200 p-5 w-[48%]">
              <View className="w-11 h-11 rounded-2xl bg-emerald-50 items-center justify-center">
                <Ionicons
                  name="trending-up-outline"
                  size={21}
                  color="#059669"
                />
              </View>

              <Text className="text-zinc-400 text-xs font-semibold mt-4">
                Yearly Cost
              </Text>

              <Text className="text-zinc-900 text-xl font-black mt-1">
                ₹{formatCurrency(yearlyCost)}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            SUBSCRIPTION DETAILS
        ====================================================== */}
        <View className="px-5 mt-7">
          <Text className="text-zinc-900 text-2xl font-black">
            Subscription Details
          </Text>

          <Text className="text-zinc-500 text-xs mt-1 mb-4">
            Payment and renewal preferences
          </Text>

          <View className="bg-white rounded-[30px] border border-zinc-200 overflow-hidden">
            {/* Billing Cycle */}
            <View className="flex-row items-center px-5 py-5">
              <View className="w-11 h-11 rounded-xl bg-indigo-50 items-center justify-center">
                <Ionicons name="repeat-outline" size={20} color="#4F46E5" />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-zinc-400 text-xs font-semibold">
                  Billing Cycle
                </Text>

                <Text className="text-zinc-900 font-black text-sm mt-1 capitalize">
                  {subscription.billingCycle}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={17} color="#A1A1AA" />
            </View>

            <View className="h-px bg-zinc-100 ml-20" />

            {/* Payment */}
            <View className="flex-row items-center px-5 py-5">
              <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center">
                <Ionicons name="card-outline" size={20} color="#2563EB" />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-zinc-400 text-xs font-semibold">
                  Payment Method
                </Text>

                <Text className="text-zinc-900 font-black text-sm mt-1">
                  {subscription.paymentMethod || "N/A"}
                </Text>
              </View>
            </View>

            <View className="h-px bg-zinc-100 ml-20" />

            {/* Reminder */}
            <View className="flex-row items-center px-5 py-5">
              <View className="w-11 h-11 rounded-xl bg-amber-50 items-center justify-center">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#D97706"
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-zinc-400 text-xs font-semibold">
                  Renewal Reminder
                </Text>

                <Text className="text-zinc-900 font-black text-sm mt-1">
                  {subscription.reminderDaysBefore} days before
                </Text>
              </View>
            </View>

            <View className="h-px bg-zinc-100 ml-20" />

            {/* Auto Renew */}
            <View className="flex-row items-center px-5 py-5">
              <View
                className={`w-11 h-11 rounded-xl items-center justify-center ${
                  subscription.autoRenew ? "bg-emerald-50" : "bg-red-50"
                }`}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={subscription.autoRenew ? "#059669" : "#EF4444"}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-zinc-400 text-xs font-semibold">
                  Auto Renew
                </Text>

                <Text
                  className={`font-black text-sm mt-1 ${
                    subscription.autoRenew ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {subscription.autoRenew ? "Enabled" : "Disabled"}
                </Text>
              </View>

              <View
                className={`px-3 py-1.5 rounded-full ${
                  subscription.autoRenew ? "bg-emerald-50" : "bg-red-50"
                }`}
              >
                <Text
                  className={`text-[10px] font-black ${
                    subscription.autoRenew ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {subscription.autoRenew ? "ON" : "OFF"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            NOTES
        ====================================================== */}
        <View className="px-5 mt-7">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-zinc-900 text-2xl font-black">Notes</Text>

              <Text className="text-zinc-500 text-xs mt-1">
                Additional information
              </Text>
            </View>

            <View className="w-10 h-10 rounded-xl bg-zinc-200 items-center justify-center">
              <Ionicons
                name="document-text-outline"
                size={19}
                color="#52525B"
              />
            </View>
          </View>

          <View className="bg-white rounded-[28px] border border-zinc-200 p-5">
            <Text className="text-zinc-600 leading-7 text-base">
              {subscription.notes ||
                "No additional notes added for this subscription."}
            </Text>
          </View>
        </View>

        {/* =====================================================
            ACTIONS
        ====================================================== */}
        <View className="px-5 mt-8">
          <Text className="text-zinc-900 text-lg font-black mb-4">
            Manage Subscription
          </Text>

          {/* Edit */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() =>
              router.push({
                pathname: "/(drawer)/(tabs)/subscriptions/edit/[id]",
                params: {
                  id: subscription._id,
                },
              })
            }
            className="overflow-hidden rounded-[22px] mb-3"
          >
            <View className="bg-indigo-600 min-h-[60px] rounded-[22px] flex-row items-center justify-center">
              <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              </View>

              <Text className="text-white font-black text-base ml-3">
                Edit Subscription
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
                style={{ marginLeft: 10 }}
              />
            </View>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDeletePress}
            className="bg-white border border-red-200 min-h-[58px] rounded-[22px] flex-row items-center justify-center"
          >
            <View className="w-9 h-9 rounded-full bg-red-50 items-center justify-center">
              <Ionicons name="trash-outline" size={19} color="#EF4444" />
            </View>

            <Text className="text-red-500 font-black text-base ml-3">
              Delete Subscription
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-5">
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#A1A1AA"
            />

            <Text className="text-zinc-400 text-xs font-medium ml-1.5">
              Subscription data managed securely by FinTrack
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
