import { useMemo, useState, useCallback, useRef } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { router, useFocusEffect } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import SubscriptionCard from "@/src/components/SubscriptionCard";

import { getSubscriptions } from "@/src/services/subscriptionApi";

import UpcomingRenewals from "@/src/components/UpcomingRenewals";

const categories = [
  "All",
  "Entertainment",
  "Productivity",
  "Finance",
  "Health",
  "Cloud",
  "Education",
];

export default function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const data = await getSubscriptions();

      setSubscriptions(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchSubscriptions();
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

        scrollRef.current?.scrollTo({
          y: 0,
          animated: false,
        });
      };

      refresh();
    }, []),
  );

  const totalMonthly = subscriptions.reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ? true : item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [subscriptions, search, selectedCategory]);

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-100 items-center justify-center px-6">
        {/* ICON */}
        <View className="bg-indigo-100 w-24 h-24 rounded-full items-center justify-center mb-8">
          <Ionicons name="albums" size={42} color="#4F46E5" />
        </View>

        {/* LOADER */}
        <ActivityIndicator size="large" color="#4F46E5" />

        {/* TEXT */}
        <Text className="text-zinc-900 text-2xl font-black mt-8">
          Loading Subscriptions
        </Text>

        <Text className="text-zinc-500 text-center mt-3 leading-7">
          Preparing recurring bills, renewals and subscription insights...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* HEADER */}

        <View className="px-5 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-zinc-500 text-sm font-medium">
                Subscription Manager
              </Text>

              <Text className="text-zinc-900 text-4xl font-black mt-1">
                Subscriptions
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
              }
              className="bg-indigo-600 w-14 h-14 rounded-2xl items-center justify-center"
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD */}

        <View className="px-5">
          <View className="bg-indigo-600 rounded-[32px] p-6">
            <Text className="text-indigo-100 text-sm font-medium">
              Monthly Spending
            </Text>

            <Text className="text-white text-5xl font-black mt-3">
              ₹{totalMonthly}
            </Text>

            <View className="flex-row items-center mt-6">
              <View className="bg-white/20 px-4 py-2 rounded-2xl mr-3">
                <Text className="text-white font-semibold">
                  {subscriptions.length} Active
                </Text>
              </View>

              <View className="bg-white/20 px-4 py-2 rounded-2xl">
                <Text className="text-white font-semibold">
                  Recurring Bills
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SEARCH */}

        <View className="px-5 mt-6">
          <View className="bg-white border border-zinc-200 rounded-2xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#71717a" />

            <TextInput
              placeholder="Search subscriptions..."
              placeholderTextColor="#71717a"
              value={search}
              onChangeText={setSearch}
              className="ml-3 flex-1 text-zinc-900"
            />
          </View>
        </View>

        {/* CATEGORY FILTERS */}

        <View className="mt-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setSelectedCategory(item)}
                className={`mr-3 px-5 py-3 rounded-2xl ${
                  selectedCategory === item
                    ? "bg-indigo-600"
                    : "bg-white border border-zinc-200"
                }`}
              >
                <Text
                  className={`font-bold ${
                    selectedCategory === item ? "text-white" : "text-zinc-700"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* QUICK STATS */}

        <View className="px-5 mt-6 flex-row justify-between">
          <View className="bg-white rounded-[28px] p-5 w-[48%] border border-zinc-200">
            <View className="bg-indigo-100 w-12 h-12 rounded-2xl items-center justify-center">
              <Ionicons name="calendar-outline" size={24} color="#4F46E5" />
            </View>

            <Text className="text-zinc-500 mt-4 font-medium">Upcoming</Text>

            <Text className="text-zinc-900 text-3xl font-black mt-1">
              {subscriptions.length}
            </Text>
          </View>

          <View className="bg-white rounded-[28px] p-5 w-[48%] border border-zinc-200">
            <View className="bg-emerald-100 w-12 h-12 rounded-2xl items-center justify-center">
              <Ionicons name="cash-outline" size={24} color="#059669" />
            </View>

            <Text className="text-zinc-500 mt-4 font-medium">Yearly Cost</Text>

            <Text className="text-zinc-900 text-3xl font-black mt-1">
              ₹{totalMonthly * 12}
            </Text>
          </View>
        </View>

        {/* UPCOMING */}

        <View className="px-5">
          <UpcomingRenewals subscriptions={subscriptions} />
        </View>

        {/* HEADER */}

        <View className="px-5 mt-8 mb-4 flex-row items-center justify-between">
          <Text className="text-zinc-900 text-2xl font-black">
            Active Subscriptions
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/(drawer)/(tabs)/subscriptions/analytics")
            }
          >
            <Text className="text-indigo-600 font-bold">Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}

        <View className="px-5">
          {filteredSubscriptions.length === 0 ? (
            <View className="bg-white rounded-[32px] p-10 items-center border border-zinc-200">
              <View className="bg-indigo-100 w-20 h-20 rounded-full items-center justify-center">
                <Ionicons name="albums-outline" size={36} color="#4F46E5" />
              </View>

              <Text className="text-zinc-900 text-2xl font-black mt-6">
                No Subscriptions Found
              </Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6">
                Try changing your search or category filter.
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
                }
                className="bg-indigo-600 px-8 py-4 rounded-2xl mt-8"
              >
                <Text className="text-white font-bold text-base">
                  Add Subscription
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredSubscriptions}
              scrollEnabled={false}
              keyExtractor={(item: any) => item._id}
              renderItem={({ item }) => (
                <SubscriptionCard
                  item={item}
                  onPress={() =>
                    router.push(`/(drawer)/(tabs)/subscriptions/${item._id}`)
                  }
                />
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
