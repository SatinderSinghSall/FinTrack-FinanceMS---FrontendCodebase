import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import api from "@/src/services/api";
import { getSubscriptions } from "@/src/services/subscriptionApi";

import SubscriptionCard from "@/src/components/SubscriptionCard";
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
  const { width } = useWindowDimensions();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const scrollRef = useRef<ScrollView>(null);

  const isSmallScreen = width < 380;
  const horizontalPadding = isSmallScreen ? 16 : 20;

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
    } catch (error) {
      console.log(error);
    }
  };

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

      await Promise.all([fetchSubscriptions(), fetchProfile()]);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        await Promise.all([fetchSubscriptions(), fetchProfile()]);

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

  /**
   * Existing subscription data is treated as active unless
   * an explicit isActive === false value is returned by the API.
   *
   * This keeps the screen compatible with the existing data model
   * while still allowing inactive subscriptions in the future.
   */
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => item?.isActive !== false);
  }, [subscriptions]);

  const totalMonthly = useMemo(() => {
    return activeSubscriptions.reduce((acc, item) => {
      const amount = Number(item?.amount) || 0;
      return acc + amount;
    }, 0);
  }, [activeSubscriptions]);

  const totalYearly = totalMonthly * 12;

  const averageMonthly =
    activeSubscriptions.length > 0
      ? totalMonthly / activeSubscriptions.length
      : 0;

  const filteredSubscriptions = useMemo(() => {
    return activeSubscriptions.filter((item) => {
      const name = String(item?.name || "").toLowerCase();

      const matchesSearch = name.includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ? true : item?.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeSubscriptions, search, selectedCategory]);

  /**
   * Top 5 active subscriptions by monthly amount.
   */
  const topFiveSubscriptions = useMemo(() => {
    return [...activeSubscriptions]
      .sort((a, b) => (Number(b?.amount) || 0) - (Number(a?.amount) || 0))
      .slice(0, 5);
  }, [activeSubscriptions]);

  const highestSubscriptionAmount = useMemo(() => {
    return Math.max(
      ...topFiveSubscriptions.map((item) => Number(item?.amount) || 0),
      1,
    );
  }, [topFiveSubscriptions]);

  const userName = profile?.user?.name || "User";

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSubscriptionIcon = (category?: string) => {
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
        return "repeat-outline";
    }
  };

  const getSubscriptionColor = (index: number) => {
    const colors = [
      {
        background: "bg-indigo-100",
        icon: "#4F46E5",
      },
      {
        background: "bg-violet-100",
        icon: "#7C3AED",
      },
      {
        background: "bg-blue-100",
        icon: "#2563EB",
      },
      {
        background: "bg-emerald-100",
        icon: "#059669",
      },
      {
        background: "bg-amber-100",
        icon: "#D97706",
      },
    ];

    return colors[index] || colors[0];
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-[26px] bg-indigo-100 items-center justify-center">
            <Ionicons name="repeat-outline" size={36} color="#4F46E5" />
          </View>

          <ActivityIndicator size="small" color="#4F46E5" className="mt-7" />

          <Text className="text-zinc-900 text-2xl font-black mt-6 text-center">
            Loading Subscriptions
          </Text>

          <Text className="text-zinc-500 text-center mt-3 leading-6 max-w-[320px]">
            Preparing your recurring payments, renewals and subscription
            insights...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <View
          className="pt-4 pb-5"
          style={{
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-zinc-500 text-sm font-semibold">
                {greeting}
              </Text>

              <Text
                className="text-zinc-950 font-black mt-1"
                style={{
                  fontSize: isSmallScreen ? 28 : 32,
                  lineHeight: isSmallScreen ? 34 : 38,
                }}
                numberOfLines={1}
              >
                {userName}
              </Text>

              <View className="flex-row items-center mt-2">
                <View className="w-2 h-2 rounded-full bg-indigo-600 mr-2" />

                <Text className="text-indigo-600 text-sm font-bold">
                  Subscription Manager
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push("/(drawer)/(tabs)/subscriptions/add-subscription")
              }
              activeOpacity={0.8}
              className="w-14 h-14 rounded-[20px] bg-indigo-600 items-center justify-center"
              style={{
                shadowColor: "#4F46E5",
                shadowOffset: {
                  width: 0,
                  height: 7,
                },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Ionicons name="add" size={27} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===================================================== */}
        {/* HERO - MONTHLY SPENDING */}
        {/* ===================================================== */}

        <View
          className="px-5"
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
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 7,
            }}
          >
            {/* Decorative circles */}
            <View className="absolute -right-16 -top-20 w-52 h-52 rounded-full bg-white/10" />
            <View className="absolute -right-8 bottom-[-80px] w-44 h-44 rounded-full bg-white/5" />

            <View className="p-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-indigo-100 text-xs font-bold uppercase tracking-wider">
                    Monthly Commitment
                  </Text>

                  <Text className="text-white text-4xl font-black mt-2">
                    ₹{formatAmount(totalMonthly)}
                  </Text>
                </View>

                <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center">
                  <Ionicons name="wallet-outline" size={25} color="white" />
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

                <View className="w-px bg-white/15 mx-5" />

                <View className="flex-1">
                  <Text className="text-indigo-200 text-xs font-medium">
                    Yearly Estimate
                  </Text>

                  <Text className="text-white text-xl font-black mt-1">
                    ₹{formatAmount(totalYearly)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ===================================================== */}
        {/* QUICK STATS */}
        {/* ===================================================== */}

        <View
          className="flex-row mt-5"
          style={{
            paddingHorizontal: horizontalPadding,
            gap: 12,
          }}
        >
          <View className="flex-1 bg-white border border-zinc-200 rounded-[24px] p-4">
            <View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center">
              <Ionicons name="calendar-outline" size={21} color="#4F46E5" />
            </View>

            <Text className="text-zinc-500 text-xs font-semibold mt-4">
              Subscriptions
            </Text>

            <Text className="text-zinc-950 text-2xl font-black mt-1">
              {activeSubscriptions.length}
            </Text>
          </View>

          <View className="flex-1 bg-white border border-zinc-200 rounded-[24px] p-4">
            <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center">
              <Ionicons name="trending-up-outline" size={21} color="#059669" />
            </View>

            <Text className="text-zinc-500 text-xs font-semibold mt-4">
              Avg. Monthly
            </Text>

            <Text
              className="text-zinc-950 text-2xl font-black mt-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              ₹{formatAmount(averageMonthly)}
            </Text>
          </View>
        </View>

        {/* ===================================================== */}
        {/* UPCOMING RENEWALS */}
        {/* ===================================================== */}

        <View className="mt-7">
          <View
            className="flex-row items-center justify-between mb-3"
            style={{
              paddingHorizontal: horizontalPadding,
            }}
          >
            <View>
              <Text className="text-zinc-950 text-xl font-black">
                Upcoming Renewals
              </Text>

              <Text className="text-zinc-500 text-xs font-medium mt-1">
                Keep an eye on your recurring payments
              </Text>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: horizontalPadding,
            }}
          >
            <UpcomingRenewals subscriptions={activeSubscriptions} />
          </View>
        </View>

        {/* ===================================================== */}
        {/* TOP 5 ACTIVE SUBSCRIPTIONS */}
        {/* ===================================================== */}

        {topFiveSubscriptions.length > 0 && (
          <View className="mt-8">
            <View
              className="flex-row items-end justify-between mb-4"
              style={{
                paddingHorizontal: horizontalPadding,
              }}
            >
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-xl bg-indigo-100 items-center justify-center mr-3">
                    <Ionicons name="trophy-outline" size={19} color="#4F46E5" />
                  </View>

                  <View>
                    <Text className="text-zinc-950 text-xl font-black">
                      Top 5 Active
                    </Text>

                    <Text className="text-zinc-500 text-xs font-medium mt-0.5">
                      Highest monthly commitments
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-indigo-50 px-3 py-2 rounded-xl">
                <Text className="text-indigo-600 text-xs font-black">
                  {topFiveSubscriptions.length}
                </Text>
              </View>
            </View>

            <View
              className="bg-white border border-zinc-200 rounded-[28px] overflow-hidden"
              style={{
                marginHorizontal: horizontalPadding,
              }}
            >
              {topFiveSubscriptions.map((item, index) => {
                const amount = Number(item?.amount) || 0;

                const percentage = (amount / highestSubscriptionAmount) * 100;

                const iconColor = getSubscriptionColor(index);

                return (
                  <TouchableOpacity
                    key={item?._id || `${item?.name}-${index}`}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (item?._id) {
                        router.push(
                          `/(drawer)/(tabs)/subscriptions/${item._id}`,
                        );
                      }
                    }}
                    className="px-4 py-4"
                  >
                    <View className="flex-row items-center">
                      {/* Ranking */}
                      <View className="w-8 items-center">
                        <Text
                          className={`font-black ${
                            index === 0
                              ? "text-indigo-600 text-lg"
                              : "text-zinc-400 text-sm"
                          }`}
                        >
                          #{index + 1}
                        </Text>
                      </View>

                      {/* Icon */}
                      <View
                        className={`w-11 h-11 rounded-2xl items-center justify-center ml-2 ${iconColor.background}`}
                      >
                        <Ionicons
                          name={getSubscriptionIcon(item?.category) as any}
                          size={21}
                          color={iconColor.icon}
                        />
                      </View>

                      {/* Main information */}
                      <View className="flex-1 ml-3">
                        <Text
                          className="text-zinc-900 font-black text-[15px]"
                          numberOfLines={1}
                        >
                          {item?.name || "Subscription"}
                        </Text>

                        <View className="flex-row items-center mt-1">
                          <Text
                            className="text-zinc-500 text-xs font-medium"
                            numberOfLines={1}
                          >
                            {item?.category || "Recurring"}
                          </Text>

                          <View className="w-1 h-1 rounded-full bg-zinc-300 mx-2" />

                          <Text className="text-zinc-500 text-xs font-medium">
                            Monthly
                          </Text>
                        </View>
                      </View>

                      {/* Amount */}
                      <View className="items-end ml-2">
                        <Text className="text-zinc-950 font-black text-base">
                          ₹{formatAmount(amount)}
                        </Text>

                        <Text className="text-zinc-400 text-[10px] font-semibold mt-0.5">
                          / month
                        </Text>
                      </View>
                    </View>

                    {/* Spending bar */}
                    <View className="flex-row items-center mt-3 ml-[52px]">
                      <View className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${Math.max(percentage, 5)}%`,
                          }}
                        />
                      </View>

                      <Text className="text-zinc-400 text-[9px] font-bold ml-2">
                        {Math.round(percentage)}%
                      </Text>
                    </View>

                    {index < topFiveSubscriptions.length - 1 && (
                      <View className="h-px bg-zinc-100 mt-4" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ===================================================== */}
        {/* SEARCH */}
        {/* ===================================================== */}

        <View
          className="mt-8"
          style={{
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View className="bg-white border border-zinc-200 rounded-[20px] px-4 h-14 flex-row items-center">
            <View className="w-9 h-9 rounded-xl bg-zinc-100 items-center justify-center">
              <Ionicons name="search" size={18} color="#71717A" />
            </View>

            <TextInput
              placeholder="Search subscriptions..."
              placeholderTextColor="#A1A1AA"
              value={search}
              onChangeText={setSearch}
              className="ml-3 flex-1 text-zinc-900 font-medium"
              returnKeyType="search"
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                activeOpacity={0.7}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close-circle" size={20} color="#A1A1AA" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ===================================================== */}
        {/* CATEGORY FILTERS */}
        {/* ===================================================== */}

        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingRight: horizontalPadding + 10,
            }}
          >
            {categories.map((category) => {
              const selected = selectedCategory === category;

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.75}
                  className={`mr-2.5 px-4 py-2.5 rounded-xl ${
                    selected ? "bg-zinc-950" : "bg-white border border-zinc-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-black ${
                      selected ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ===================================================== */}
        {/* ALL ACTIVE SUBSCRIPTIONS */}
        {/* ===================================================== */}
        <View className="mt-8">
          <View className="mb-4">
            {/* Section Title */}
            <View
              style={{
                paddingHorizontal: horizontalPadding,
              }}
            >
              <Text className="text-zinc-950 text-xl font-black">
                Active Subscriptions
              </Text>

              <Text className="text-zinc-500 text-xs font-medium mt-1">
                {filteredSubscriptions.length} subscription
                {filteredSubscriptions.length === 1 ? "" : "s"} found
              </Text>
            </View>

            {/* CTA Buttons */}
            <View
              className="flex-row items-center mt-4"
              style={{
                paddingHorizontal: horizontalPadding,
                gap: 10,
              }}
            >
              {/* See All Subscriptions */}
              <TouchableOpacity
                onPress={() => router.push("/subscriptions/SubscriptionList")}
                activeOpacity={0.75}
                className="flex-1 h-11 flex-row items-center justify-center bg-zinc-950 rounded-xl"
              >
                <Ionicons name="list-outline" size={16} color="white" />

                <Text className="text-white text-xs font-black ml-2">
                  See All Subscriptions
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="white"
                  style={{
                    marginLeft: 3,
                  }}
                />
              </TouchableOpacity>

              {/* Analytics */}
              <TouchableOpacity
                onPress={() =>
                  router.push("/(drawer)/(tabs)/subscriptions/analytics")
                }
                activeOpacity={0.75}
                className="flex-1 h-11 flex-row items-center justify-center bg-indigo-50 border border-indigo-100 rounded-xl"
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={16}
                  color="#4F46E5"
                />

                <Text className="text-indigo-600 text-xs font-black ml-2">
                  Analytics
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="#4F46E5"
                  style={{
                    marginLeft: 3,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: horizontalPadding,
            }}
          >
            {filteredSubscriptions.length === 0 ? (
              <View className="bg-white border border-zinc-200 rounded-[28px] px-6 py-10 items-center">
                <View className="w-20 h-20 rounded-[26px] bg-indigo-50 items-center justify-center">
                  <Ionicons name="albums-outline" size={34} color="#4F46E5" />
                </View>

                <Text className="text-zinc-950 text-xl font-black mt-5 text-center">
                  No Subscriptions Found
                </Text>

                <Text className="text-zinc-500 text-center text-sm leading-6 mt-2 max-w-[290px]">
                  Try changing your search or category filter, or add a new
                  recurring subscription.
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      "/(drawer)/(tabs)/subscriptions/add-subscription",
                    )
                  }
                  activeOpacity={0.8}
                  className="bg-indigo-600 px-6 py-3.5 rounded-2xl mt-6"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="add" size={18} color="white" />

                    <Text className="text-white font-black ml-2">
                      Add Subscription
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {filteredSubscriptions.map((item) => (
                  <SubscriptionCard
                    key={item?._id}
                    item={item}
                    onPress={() =>
                      router.push(`/(drawer)/(tabs)/subscriptions/${item._id}`)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
