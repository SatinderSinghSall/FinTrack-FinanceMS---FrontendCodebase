import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import {
  FinancialTip,
  getActiveFinancialTips,
} from "../services/financialTipService";

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    textColor: string;
    accent: string;
  }
> = {
  budgeting: {
    label: "Budgeting",
    icon: "pie-chart-outline",
    iconColor: "#2563eb",
    iconBg: "bg-blue-50",
    textColor: "text-blue-700",
    accent: "bg-blue-500",
  },

  saving: {
    label: "Saving",
    icon: "wallet-outline",
    iconColor: "#059669",
    iconBg: "bg-emerald-50",
    textColor: "text-emerald-700",
    accent: "bg-emerald-500",
  },

  expenses: {
    label: "Expenses",
    icon: "receipt-outline",
    iconColor: "#d97706",
    iconBg: "bg-amber-50",
    textColor: "text-amber-700",
    accent: "bg-amber-500",
  },

  debt: {
    label: "Debt",
    icon: "card-outline",
    iconColor: "#dc2626",
    iconBg: "bg-red-50",
    textColor: "text-red-700",
    accent: "bg-red-500",
  },

  investing: {
    label: "Investing",
    icon: "trending-up-outline",
    iconColor: "#7c3aed",
    iconBg: "bg-violet-50",
    textColor: "text-violet-700",
    accent: "bg-violet-500",
  },

  "financial-safety": {
    label: "Financial Safety",
    icon: "shield-checkmark-outline",
    iconColor: "#0891b2",
    iconBg: "bg-cyan-50",
    textColor: "text-cyan-700",
    accent: "bg-cyan-500",
  },

  "money-habits": {
    label: "Money Habits",
    icon: "repeat-outline",
    iconColor: "#4f46e5",
    iconBg: "bg-indigo-50",
    textColor: "text-indigo-700",
    accent: "bg-indigo-500",
  },

  goals: {
    label: "Goals",
    icon: "flag-outline",
    iconColor: "#db2777",
    iconBg: "bg-pink-50",
    textColor: "text-pink-700",
    accent: "bg-pink-500",
  },
};

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  tip: {
    label: "Financial Tip",
    icon: "bulb-outline",
  },

  guide: {
    label: "Guide",
    icon: "book-outline",
  },

  lesson: {
    label: "Lesson",
    icon: "school-outline",
  },

  warning: {
    label: "Important",
    icon: "warning-outline",
  },
};

const formatDate = (date: string) => {
  const targetDate = new Date(date);

  if (Number.isNaN(targetDate.getTime())) {
    return "";
  }

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  if (target.getTime() === today.getTime()) {
    return "Today";
  }

  if (target.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return targetDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getReadingTime = (content?: string) => {
  if (!content?.trim()) {
    return "1 min read";
  }

  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return `${minutes} min read`;
};

export default function FinancialTipsPreview() {
  const router = useRouter();

  const [tips, setTips] = useState<FinancialTip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getActiveFinancialTips();

      if (Array.isArray(data)) {
        setTips(data.slice(0, 3));
      } else {
        setTips([]);
      }
    } catch (error) {
      console.error("Failed to fetch financial tips:", error);
      setTips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Refresh whenever the dashboard comes back into focus.
   *
   * Dashboard → Financial Tips → Back
   *
   * This ensures newly published tips appear automatically.
   */
  useFocusEffect(
    useCallback(() => {
      fetchTips();
    }, [fetchTips]),
  );

  const featuredCount = useMemo(
    () => tips.filter((tip) => tip.featured).length,
    [tips],
  );

  const openFinancialTips = () => {
    router.push("/financial-tips/FinancialTipsScreen");
  };

  /*
   * Open the full Financial Tips screen.
   *
   * We intentionally use the Financial Tips screen rather than
   * trying to navigate directly from the dashboard preview card.
   */
  const openTip = () => {
    openFinancialTips();
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <View className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5">
        {/* Header skeleton */}
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-11 w-11 rounded-2xl bg-amber-50" />

            <View>
              <View className="mb-2 h-4 w-32 rounded bg-zinc-200" />
              <View className="h-3 w-44 rounded bg-zinc-100" />
            </View>
          </View>

          <View className="h-9 w-9 rounded-full bg-zinc-100" />
        </View>

        {/* Tip skeletons */}
        {[1, 2].map((item) => (
          <View
            key={item}
            className={`overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 p-4 ${
              item !== 2 ? "mb-3" : ""
            }`}
          >
            <View className="flex-row">
              <View className="mr-3 h-10 w-10 rounded-xl bg-amber-100" />

              <View className="flex-1">
                <View className="mb-2 h-2.5 w-28 rounded bg-zinc-200" />

                <View className="mb-2 h-4 w-4/5 rounded bg-zinc-200" />

                <View className="mb-1.5 h-3 w-full rounded bg-zinc-100" />

                <View className="mb-3 h-3 w-3/4 rounded bg-zinc-100" />

                <View className="h-3 w-20 rounded bg-zinc-200" />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  /*
   * Don't render an empty section.
   */
  if (tips.length === 0) {
    return null;
  }

  return (
    <View className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          {/* Lightbulb icon */}
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
            <Ionicons name="bulb" size={21} color="#d97706" />
          </View>

          {/* Title */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-bold text-zinc-900">
                Financial Tips
              </Text>

              {/* Count */}
              <View className="ml-2 min-w-[22px] items-center justify-center rounded-full bg-amber-50 px-1.5 py-0.5">
                <Text className="text-[10px] font-extrabold text-amber-700">
                  {tips.length}
                </Text>
              </View>

              {/* Featured indicator */}
              {featuredCount > 0 && (
                <View className="ml-1.5 flex-row items-center rounded-full bg-zinc-100 px-1.5 py-0.5">
                  <Ionicons name="star" size={9} color="#a16207" />

                  <Text className="ml-0.5 text-[9px] font-bold text-zinc-600">
                    {featuredCount}
                  </Text>
                </View>
              )}
            </View>

            <Text className="mt-0.5 text-xs text-zinc-500">
              Simple ideas to improve your finances
            </Text>
          </View>
        </View>

        {/* Header arrow */}
        <Pressable
          onPress={openFinancialTips}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="View all financial tips"
          className="h-9 w-9 items-center justify-center rounded-full bg-zinc-50 active:bg-zinc-100"
        >
          <Ionicons name="chevron-forward" size={17} color="#71717a" />
        </Pressable>
      </View>

      {/* ========================================================= */}
      {/* FINANCIAL TIPS */}
      {/* ========================================================= */}

      <View>
        {tips.map((tip, index) => {
          const category =
            CATEGORY_CONFIG[tip.category] || CATEGORY_CONFIG["money-habits"];

          const type = TYPE_CONFIG[tip.type] || TYPE_CONFIG.tip;

          const hasAction =
            tip.action?.enabled === true && Boolean(tip.action?.label);

          return (
            <Pressable
              key={tip._id}
              onPress={openTip}
              accessibilityRole="button"
              accessibilityLabel={`Read financial tip: ${tip.title}`}
              className={`relative overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 p-4 active:bg-zinc-100 ${
                index !== tips.length - 1 ? "mb-3" : ""
              }`}
            >
              {/* ================================================= */}
              {/* CATEGORY ACCENT */}
              {/* ================================================= */}

              <View
                className={`absolute bottom-0 left-0 top-0 w-1 ${category.accent}`}
              />

              <View className="flex-row">
                {/* ================================================= */}
                {/* ICON */}
                {/* ================================================= */}

                <View
                  className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${category.iconBg}`}
                >
                  <Ionicons
                    name={category.icon}
                    size={19}
                    color={category.iconColor}
                  />
                </View>

                {/* ================================================= */}
                {/* CONTENT */}
                {/* ================================================= */}

                <View className="flex-1 pr-1">
                  {/* Meta row */}
                  <View className="mb-1.5 flex-row items-center">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={type.icon}
                        size={11}
                        color={category.iconColor}
                      />

                      <Text
                        className={`ml-1 text-[9px] font-extrabold uppercase tracking-wide ${category.textColor}`}
                      >
                        {type.label}
                      </Text>
                    </View>

                    <View className="mx-2 h-1 w-1 rounded-full bg-zinc-300" />

                    <Text className="text-[9px] font-medium text-zinc-400">
                      {formatDate(tip.createdAt)}
                    </Text>
                  </View>

                  {/* Title row */}
                  <View className="flex-row items-start">
                    <Text
                      numberOfLines={2}
                      className="flex-1 text-sm font-bold leading-5 text-zinc-900"
                    >
                      {tip.title}
                    </Text>

                    {/* Featured */}
                    {tip.featured && (
                      <View className="ml-2 mt-0.5 flex-row items-center rounded-full bg-amber-100 px-1.5 py-1">
                        <Ionicons name="star" size={9} color="#a16207" />

                        <Text className="ml-0.5 text-[8px] font-extrabold text-amber-700">
                          FEATURED
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Short description */}
                  <Text
                    numberOfLines={2}
                    className="mt-1 text-xs leading-5 text-zinc-500"
                  >
                    {tip.shortDescription}
                  </Text>

                  {/* Bottom meta */}
                  <View className="mt-3 flex-row items-center">
                    {/* Category */}
                    <View
                      className={`flex-row items-center rounded-full px-2 py-1 ${category.iconBg}`}
                    >
                      <Ionicons
                        name={category.icon}
                        size={10}
                        color={category.iconColor}
                      />

                      <Text
                        className={`ml-1 text-[9px] font-bold ${category.textColor}`}
                      >
                        {category.label}
                      </Text>
                    </View>

                    {/* Reading time */}
                    <View className="ml-2 flex-row items-center">
                      <Ionicons name="time-outline" size={11} color="#a1a1aa" />

                      <Text className="ml-1 text-[9px] font-medium text-zinc-400">
                        {getReadingTime(tip.content)}
                      </Text>
                    </View>
                  </View>

                  {/* ================================================= */}
                  {/* ADMIN CTA */}
                  {/* ================================================= */}

                  {hasAction && (
                    <View className="mt-3">
                      <View className="flex-row items-center rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                        <View className="h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
                          <Ionicons
                            name="arrow-forward"
                            size={13}
                            color="#18181b"
                          />
                        </View>

                        <Text className="ml-2 flex-1 text-[10px] font-bold text-zinc-700">
                          {tip.action?.label}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={13}
                          color="#a1a1aa"
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* ================================================= */}
                {/* CARD ARROW */}
                {/* ================================================= */}

                <View className="ml-2 items-center justify-center">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color="#a1a1aa"
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ========================================================= */}
      {/* SEE ALL CTA */}
      {/* ========================================================= */}

      <Pressable
        onPress={openFinancialTips}
        accessibilityRole="button"
        accessibilityLabel="Explore all financial tips"
        className="mt-4 flex-row items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3.5 active:bg-zinc-800"
      >
        <Ionicons name="bulb-outline" size={15} color="#ffffff" />

        <Text className="mx-2 text-xs font-bold text-white">
          Explore all financial tips
        </Text>

        <Ionicons name="arrow-forward" size={15} color="#ffffff" />
      </Pressable>
    </View>
  );
}
