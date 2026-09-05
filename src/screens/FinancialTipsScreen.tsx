import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  FinancialTip,
  FinancialTipCategory,
  FinancialTipType,
  getActiveFinancialTips,
} from "../services/financialTipService";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ITEMS_PER_PAGE = 6;

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

const categories: {
  value: "all" | FinancialTipCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "all",
    label: "All",
    icon: "grid-outline",
  },
  {
    value: "budgeting",
    label: "Budgeting",
    icon: "calculator-outline",
  },
  {
    value: "saving",
    label: "Saving",
    icon: "wallet-outline",
  },
  {
    value: "expenses",
    label: "Expenses",
    icon: "receipt-outline",
  },
  {
    value: "debt",
    label: "Debt",
    icon: "card-outline",
  },
  {
    value: "investing",
    label: "Investing",
    icon: "trending-up-outline",
  },
  {
    value: "financial-safety",
    label: "Safety",
    icon: "shield-checkmark-outline",
  },
  {
    value: "money-habits",
    label: "Money Habits",
    icon: "repeat-outline",
  },
  {
    value: "goals",
    label: "Goals",
    icon: "flag-outline",
  },
];

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

const types: {
  value: "all" | FinancialTipType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "all",
    label: "All",
    icon: "apps-outline",
  },
  {
    value: "tip",
    label: "Tips",
    icon: "bulb-outline",
  },
  {
    value: "guide",
    label: "Guides",
    icon: "book-outline",
  },
  {
    value: "lesson",
    label: "Lessons",
    icon: "school-outline",
  },
  {
    value: "warning",
    label: "Warnings",
    icon: "warning-outline",
  },
];

/* -------------------------------------------------------------------------- */
/* Type Configuration                                                         */
/* -------------------------------------------------------------------------- */

const typeConfig: Record<
  FinancialTipType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    iconColor: string;
    iconBg: string;
    accent: string;
    labelColor: string;
  }
> = {
  tip: {
    icon: "bulb",
    label: "Tip",
    iconColor: "#d97706",
    iconBg: "bg-amber-50",
    accent: "bg-amber-500",
    labelColor: "text-amber-700",
  },

  guide: {
    icon: "book",
    label: "Guide",
    iconColor: "#2563eb",
    iconBg: "bg-blue-50",
    accent: "bg-blue-500",
    labelColor: "text-blue-700",
  },

  lesson: {
    icon: "school",
    label: "Lesson",
    iconColor: "#7c3aed",
    iconBg: "bg-violet-50",
    accent: "bg-violet-500",
    labelColor: "text-violet-700",
  },

  warning: {
    icon: "warning",
    label: "Important",
    iconColor: "#dc2626",
    iconBg: "bg-red-50",
    accent: "bg-red-500",
    labelColor: "text-red-700",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCategory = (category: FinancialTipCategory) => {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date: string) => {
  const tipDate = new Date(date);

  if (Number.isNaN(tipDate.getTime())) {
    return "";
  }

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);

  yesterday.setDate(today.getDate() - 1);

  const target = new Date(
    tipDate.getFullYear(),
    tipDate.getMonth(),
    tipDate.getDate(),
  );

  if (target.getTime() === today.getTime()) {
    return "Today";
  }

  if (target.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return tipDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatLongDate = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

export default function FinancialTipsScreen() {
  const router = useRouter();

  const [financialTips, setFinancialTips] = useState<FinancialTip[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | FinancialTipCategory
  >("all");

  const [selectedType, setSelectedType] = useState<"all" | FinancialTipType>(
    "all",
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTip, setSelectedTip] = useState<FinancialTip | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Fetch Tips                                                               */
  /* ------------------------------------------------------------------------ */

  const fetchFinancialTips = useCallback(async () => {
    try {
      setError("");

      const data = await getActiveFinancialTips();

      const tips = Array.isArray(data) ? data : [];

      setFinancialTips(tips);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch financial tips:", err);

      setFinancialTips([]);
      setCurrentPage(1);

      setError("Unable to load financial tips. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Initial Load / Focus                                                     */
  /* ------------------------------------------------------------------------ */

  useFocusEffect(
    useCallback(() => {
      fetchFinancialTips();
    }, [fetchFinancialTips]),
  );

  /* ------------------------------------------------------------------------ */
  /* Refresh                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");

      const data = await getActiveFinancialTips();

      const tips = Array.isArray(data) ? data : [];

      setFinancialTips(tips);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to refresh financial tips:", err);

      setError("Unable to refresh financial tips.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Reset Page When Filters Change                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType]);

  /* ------------------------------------------------------------------------ */
  /* Filter                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredTips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return financialTips.filter((tip) => {
      const matchesSearch =
        !query ||
        tip.title.toLowerCase().includes(query) ||
        tip.shortDescription.toLowerCase().includes(query) ||
        tip.content.toLowerCase().includes(query) ||
        formatCategory(tip.category).toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "all" || tip.category === selectedCategory;

      const matchesType = selectedType === "all" || tip.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [financialTips, searchQuery, selectedCategory, selectedType]);

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTips.length / ITEMS_PER_PAGE),
  );

  const paginatedTips = filteredTips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* ------------------------------------------------------------------------ */
  /* Safety: Keep Page Valid                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* ------------------------------------------------------------------------ */
  /* Featured Count                                                           */
  /* ------------------------------------------------------------------------ */

  const featuredCount = useMemo(
    () => financialTips.filter((tip) => tip.featured).length,
    [financialTips],
  );

  /* ------------------------------------------------------------------------ */
  /* Clear Filters                                                            */
  /* ------------------------------------------------------------------------ */

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setCurrentPage(1);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 bg-zinc-50">
          {/* ================================================================== */}
          {/* HEADER                                                             */}
          {/* ================================================================== */}

          <View className="border-b border-zinc-200 bg-white px-5 pb-4 pt-2">
            <View className="flex-row items-center justify-between">
              {/* Back */}

              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 active:bg-zinc-200"
              >
                <Ionicons name="arrow-back" size={20} color="#18181b" />
              </Pressable>

              {/* Title */}

              <View className="flex-1 px-3">
                <Text className="text-center text-lg font-extrabold tracking-tight text-zinc-950">
                  Financial Tips
                </Text>

                <Text className="mt-0.5 text-center text-[11px] font-medium text-zinc-400">
                  Learn smarter money habits
                </Text>
              </View>

              {/* Header Icon */}

              <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Ionicons name="bulb" size={19} color="#d97706" />
              </View>
            </View>

            {/* ================================================================ */}
            {/* SEARCH                                                            */}
            {/* ================================================================ */}

            <View className="mt-4 flex-row items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5">
              <Ionicons name="search-outline" size={18} color="#a1a1aa" />

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search financial tips"
                placeholderTextColor="#a1a1aa"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                clearButtonMode="never"
                selectionColor="#18181b"
                className="ml-2 flex-1 py-3 text-xs font-medium text-zinc-700"
              />

              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="h-7 w-7 items-center justify-center rounded-full bg-zinc-200 active:bg-zinc-300"
                >
                  <Ionicons name="close" size={14} color="#52525b" />
                </Pressable>
              )}
            </View>
          </View>

          {/* ================================================================== */}
          {/* MAIN SCROLL                                                        */}
          {/* ================================================================== */}

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#18181b"
              />
            }
          >
            {/* ================================================================ */}
            {/* HERO SUMMARY                                                     */}
            {/* ================================================================ */}

            <View className="mb-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5">
              <View className="flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                  <Ionicons name="bulb" size={23} color="#d97706" />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-extrabold text-zinc-950">
                    Improve your money habits
                  </Text>

                  <Text className="mt-1 text-xs leading-5 text-zinc-500">
                    Practical lessons and simple ideas to help you manage your
                    money better.
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row gap-2">
                <View className="flex-1 rounded-2xl bg-zinc-50 px-3 py-3">
                  <Text className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Available
                  </Text>

                  <Text className="mt-1 text-lg font-extrabold text-zinc-900">
                    {financialTips.length}
                  </Text>

                  <Text className="text-[9px] font-medium text-zinc-400">
                    financial tips
                  </Text>
                </View>

                <View className="flex-1 rounded-2xl bg-amber-50 px-3 py-3">
                  <Text className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600">
                    Featured
                  </Text>

                  <Text className="mt-1 text-lg font-extrabold text-amber-700">
                    {featuredCount}
                  </Text>

                  <Text className="text-[9px] font-medium text-amber-600/70">
                    editor picks
                  </Text>
                </View>
              </View>
            </View>

            {/* ================================================================ */}
            {/* CATEGORY FILTERS                                                 */}
            {/* ================================================================ */}

            <View className="mb-4">
              <View className="mb-2.5 flex-row items-center justify-between">
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                  Categories
                </Text>

                {selectedCategory !== "all" && (
                  <Pressable
                    onPress={() => setSelectedCategory("all")}
                    hitSlop={8}
                  >
                    <Text className="text-[10px] font-bold text-indigo-600">
                      Clear
                    </Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 10,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {categories.map((category) => {
                  const selected = selectedCategory === category.value;

                  return (
                    <Pressable
                      key={category.value}
                      onPress={() => setSelectedCategory(category.value)}
                      className={`mr-2 flex-row items-center rounded-full border px-3.5 py-2 ${
                        selected
                          ? "border-zinc-950 bg-zinc-950"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <Ionicons
                        name={category.icon}
                        size={13}
                        color={selected ? "#ffffff" : "#71717a"}
                      />

                      <Text
                        className={`ml-1.5 text-[10px] font-bold ${
                          selected ? "text-white" : "text-zinc-600"
                        }`}
                      >
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ================================================================ */}
            {/* TYPE FILTERS                                                     */}
            {/* ================================================================ */}

            <View className="mb-5">
              <View className="mb-2.5 flex-row items-center justify-between">
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                  Content Type
                </Text>

                {selectedType !== "all" && (
                  <Pressable onPress={() => setSelectedType("all")} hitSlop={8}>
                    <Text className="text-[10px] font-bold text-indigo-600">
                      Clear
                    </Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 10,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {types.map((type) => {
                  const selected = selectedType === type.value;

                  return (
                    <Pressable
                      key={type.value}
                      onPress={() => setSelectedType(type.value)}
                      className={`mr-2 flex-row items-center rounded-full border px-3.5 py-2 ${
                        selected
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <Ionicons
                        name={type.icon}
                        size={13}
                        color={selected ? "#ffffff" : "#71717a"}
                      />

                      <Text
                        className={`ml-1.5 text-[10px] font-bold ${
                          selected ? "text-white" : "text-zinc-600"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ================================================================ */}
            {/* RESULT HEADER                                                    */}
            {/* ================================================================ */}

            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-zinc-950">
                  {searchQuery ||
                  selectedCategory !== "all" ||
                  selectedType !== "all"
                    ? "Matching Tips"
                    : "Latest Tips"}
                </Text>

                <Text className="mt-0.5 text-[10px] font-medium text-zinc-400">
                  {filteredTips.length}{" "}
                  {filteredTips.length === 1 ? "result" : "results"}
                </Text>
              </View>

              {totalPages > 1 && (
                <View className="ml-3 rounded-full bg-zinc-100 px-2.5 py-1">
                  <Text className="text-[9px] font-bold text-zinc-500">
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>
              )}
            </View>

            {/* ================================================================ */}
            {/* ERROR                                                             */}
            {/* ================================================================ */}

            {error && (
              <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                <View className="flex-row items-start">
                  <Ionicons name="alert-circle" size={18} color="#dc2626" />

                  <View className="ml-2.5 flex-1">
                    <Text className="text-xs font-bold text-red-800">
                      Unable to load tips
                    </Text>

                    <Text className="mt-1 text-[11px] leading-5 text-red-700">
                      {error}
                    </Text>

                    <Pressable
                      onPress={fetchFinancialTips}
                      className="mt-2.5 self-start rounded-lg bg-red-600 px-3 py-2 active:bg-red-700"
                    >
                      <Text className="text-[10px] font-bold text-white">
                        Try Again
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* ================================================================ */}
            {/* LOADING                                                           */}
            {/* ================================================================ */}

            {loading && !refreshing ? <LoadingSkeleton /> : null}

            {/* ================================================================ */}
            {/* EMPTY                                                             */}
            {/* ================================================================ */}

            {!loading && filteredTips.length === 0 && (
              <EmptyState
                hasFilters={
                  Boolean(searchQuery.trim()) ||
                  selectedCategory !== "all" ||
                  selectedType !== "all"
                }
                onClear={clearFilters}
              />
            )}

            {/* ================================================================ */}
            {/* TIPS                                                              */}
            {/* ================================================================ */}

            {!loading &&
              paginatedTips.map((tip, index) => (
                <FinancialTipCard
                  key={tip._id}
                  tip={tip}
                  index={index}
                  onPress={() => setSelectedTip(tip)}
                />
              ))}

            {/* ================================================================ */}
            {/* PAGINATION                                                        */}
            {/* ================================================================ */}

            {!loading && filteredTips.length > 0 && totalPages > 1 && (
              <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3">
                {/* Previous */}

                <Pressable
                  disabled={currentPage === 1}
                  onPress={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Previous page"
                  className={`flex-row items-center rounded-xl px-3 py-2 ${
                    currentPage === 1
                      ? "bg-zinc-50"
                      : "bg-zinc-100 active:bg-zinc-200"
                  }`}
                >
                  <Ionicons
                    name="chevron-back"
                    size={14}
                    color={currentPage === 1 ? "#d4d4d8" : "#52525b"}
                  />

                  <Text
                    className={`ml-1 text-[10px] font-bold ${
                      currentPage === 1 ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    Previous
                  </Text>
                </Pressable>

                {/* Page */}

                <View className="items-center">
                  <Text className="text-[10px] font-bold text-zinc-500">
                    {currentPage} / {totalPages}
                  </Text>
                </View>

                {/* Next */}

                <Pressable
                  disabled={currentPage === totalPages}
                  onPress={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Next page"
                  className={`flex-row items-center rounded-xl px-3 py-2 ${
                    currentPage === totalPages
                      ? "bg-zinc-50"
                      : "bg-zinc-950 active:bg-zinc-800"
                  }`}
                >
                  <Text
                    className={`mr-1 text-[10px] font-bold ${
                      currentPage === totalPages
                        ? "text-zinc-300"
                        : "text-white"
                    }`}
                  >
                    Next
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={currentPage === totalPages ? "#d4d4d8" : "#ffffff"}
                  />
                </Pressable>
              </View>
            )}
          </ScrollView>

          {/* ================================================================== */}
          {/* DETAIL MODAL                                                       */}
          {/* ================================================================== */}

          <FinancialTipDetailModal
            tip={selectedTip}
            onClose={() => setSelectedTip(null)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* Financial Tip Card                                                         */
/* -------------------------------------------------------------------------- */

function FinancialTipCard({
  tip,
  index,
  onPress,
}: {
  tip: FinancialTip;
  index: number;
  onPress: () => void;
}) {
  const config = typeConfig[tip.type] || typeConfig.tip;

  const hasAction = tip.action?.enabled === true && Boolean(tip.action?.label);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open financial tip ${tip.title}`}
      className={`relative mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm active:bg-zinc-50 ${
        index === 0 ? "border-zinc-300" : ""
      }`}
    >
      {/* Accent */}

      <View className={`absolute bottom-0 left-0 top-0 w-1 ${config.accent}`} />

      <View className="p-4">
        <View className="flex-row">
          {/* Icon */}

          <View
            className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${config.iconBg}`}
          >
            <Ionicons name={config.icon} size={20} color={config.iconColor} />
          </View>

          {/* Content */}

          <View className="flex-1 pr-1">
            {/* Meta */}

            <View className="mb-1.5 flex-row items-center">
              <Text
                className={`text-[9px] font-extrabold uppercase tracking-wide ${config.labelColor}`}
              >
                {config.label}
              </Text>

              <View className="mx-2 h-1 w-1 rounded-full bg-zinc-300" />

              <Text className="text-[9px] font-medium text-zinc-400">
                {formatDate(tip.createdAt)}
              </Text>

              {tip.featured && (
                <>
                  <View className="mx-2 h-1 w-1 rounded-full bg-zinc-300" />

                  <Ionicons name="star" size={10} color="#d97706" />
                </>
              )}
            </View>

            {/* Title */}

            <Text
              numberOfLines={2}
              className="text-sm font-extrabold leading-5 text-zinc-950"
            >
              {tip.title}
            </Text>

            {/* Description */}

            <Text
              numberOfLines={3}
              className="mt-1 text-xs leading-5 text-zinc-500"
            >
              {tip.shortDescription}
            </Text>

            {/* Category */}

            <View className="mt-2.5 flex-row items-center">
              <View className="flex-row items-center rounded-full bg-zinc-50 px-2.5 py-1">
                <Ionicons name="pricetag-outline" size={10} color="#a1a1aa" />

                <Text className="ml-1 text-[9px] font-bold text-zinc-500">
                  {formatCategory(tip.category)}
                </Text>
              </View>

              {hasAction && (
                <View className="ml-2 flex-row items-center">
                  <Ionicons
                    name="arrow-forward-circle-outline"
                    size={13}
                    color="#71717a"
                  />

                  <Text className="ml-1 text-[9px] font-bold text-zinc-500">
                    {tip.action?.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Arrow */}

          <View className="ml-1 items-center justify-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-zinc-50">
              <Ionicons name="chevron-forward" size={15} color="#a1a1aa" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail Modal                                                               */
/* -------------------------------------------------------------------------- */

function FinancialTipDetailModal({
  tip,
  onClose,
}: {
  tip: FinancialTip | null;
  onClose: () => void;
}) {
  if (!tip) {
    return null;
  }

  const config = typeConfig[tip.type] || typeConfig.tip;

  const hasAction = tip.action?.enabled === true && Boolean(tip.action?.label);

  return (
    <Modal
      visible={Boolean(tip)}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-zinc-950/60">
        <SafeAreaView
          edges={["bottom"]}
          className="max-h-[94%] overflow-hidden rounded-t-[30px] bg-white"
        >
          {/* Accent */}

          <View className={`h-1.5 w-full ${config.accent}`} />

          {/* Header */}

          <View className="flex-row items-center justify-between border-b border-zinc-100 px-5 py-4">
            <View className="flex-1 flex-row items-center">
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${config.iconBg}`}
              >
                <Ionicons
                  name={config.icon}
                  size={19}
                  color={config.iconColor}
                />
              </View>

              <View className="flex-1">
                <Text
                  className={`text-[9px] font-extrabold uppercase tracking-wider ${config.labelColor}`}
                >
                  {config.label}
                </Text>

                <Text className="mt-0.5 text-xs font-bold text-zinc-400">
                  Financial Education
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close financial tip"
              className="h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 active:bg-zinc-200"
            >
              <Ionicons name="close" size={18} color="#52525b" />
            </Pressable>
          </View>

          {/* Content */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 35,
            }}
          >
            {/* Title */}

            <View>
              <View className="flex-row flex-wrap items-center">
                {tip.featured && (
                  <View className="mr-2 mb-2 flex-row items-center rounded-full bg-amber-50 px-2.5 py-1">
                    <Ionicons name="star" size={10} color="#d97706" />

                    <Text className="ml-1 text-[9px] font-extrabold text-amber-700">
                      Featured
                    </Text>
                  </View>
                )}

                <View className="mb-2 flex-row items-center rounded-full bg-zinc-100 px-2.5 py-1">
                  <Ionicons name="pricetag-outline" size={10} color="#71717a" />

                  <Text className="ml-1 text-[9px] font-bold text-zinc-600">
                    {formatCategory(tip.category)}
                  </Text>
                </View>
              </View>

              <Text className="text-xl font-extrabold leading-7 tracking-tight text-zinc-950">
                {tip.title}
              </Text>

              <Text className="mt-2 text-sm font-medium leading-6 text-zinc-500">
                {tip.shortDescription}
              </Text>

              <Text className="mt-2 text-[10px] font-medium text-zinc-400">
                Published {formatLongDate(tip.createdAt)}
              </Text>
            </View>

            {/* Divider */}

            <View className="my-5 h-px bg-zinc-100" />

            {/* Article */}

            <View>
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
                  <Ionicons name="book-outline" size={14} color="#52525b" />
                </View>

                <Text className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
                  Learn More
                </Text>
              </View>

              {tip.content.split(/\n\s*\n/).map((paragraph, index) => (
                <Text
                  key={index}
                  className="mb-4 text-sm font-medium leading-7 text-zinc-600"
                >
                  {paragraph.trim()}
                </Text>
              ))}
            </View>

            {/* Action */}

            {hasAction && (
              <Pressable
                onPress={() => {
                  onClose();
                }}
                className="mt-2 flex-row items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3.5 active:bg-zinc-800"
              >
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={17}
                  color="#ffffff"
                />

                <Text className="mx-2 text-xs font-bold text-white">
                  {tip.action?.label}
                </Text>

                <Ionicons name="arrow-forward" size={15} color="#ffffff" />
              </Pressable>
            )}

            {/* Footer Note */}

            <View className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#71717a"
                />

                <Text className="ml-2 flex-1 text-[10px] font-medium leading-5 text-zinc-500">
                  Financial tips are for general educational purposes and are
                  not personalized financial advice.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <View>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4"
        >
          <View className="flex-row">
            <View className="mr-3 h-11 w-11 rounded-xl bg-zinc-100" />

            <View className="flex-1">
              <View className="mb-2 h-2.5 w-20 rounded bg-zinc-100" />

              <View className="mb-2 h-4 w-4/5 rounded bg-zinc-200" />

              <View className="mb-1.5 h-3 w-full rounded bg-zinc-100" />

              <View className="h-3 w-3/4 rounded bg-zinc-100" />

              <View className="mt-3 h-5 w-24 rounded-full bg-zinc-100" />
            </View>

            <View className="h-8 w-8 rounded-full bg-zinc-100" />
          </View>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <View className="items-center rounded-3xl border border-zinc-200 bg-white px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
        <Ionicons
          name={hasFilters ? "search-outline" : "bulb-outline"}
          size={25}
          color="#d97706"
        />
      </View>

      <Text className="mt-4 text-sm font-extrabold text-zinc-900">
        {hasFilters ? "No matching tips" : "No financial tips yet"}
      </Text>

      <Text className="mt-1.5 max-w-[280px] text-center text-xs leading-5 text-zinc-500">
        {hasFilters
          ? "Try another search or change your filters to find more financial education."
          : "Financial tips and educational content will appear here when available."}
      </Text>

      {hasFilters && (
        <Pressable
          onPress={onClear}
          className="mt-4 rounded-xl bg-zinc-950 px-4 py-2.5 active:bg-zinc-800"
        >
          <Text className="text-[10px] font-bold text-white">
            Clear Filters
          </Text>
        </Pressable>
      )}
    </View>
  );
}
