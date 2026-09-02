import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import api from "../services/api";

type AnnouncementType = "info" | "success" | "warning" | "feature";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
  action?: {
    enabled?: boolean;
    label?: string;
    route?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const typeConfig: Record<
  AnnouncementType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    iconColor: string;
    iconBg: string;
    accent: string;
    labelColor: string;
  }
> = {
  info: {
    icon: "information-circle",
    label: "Info",
    iconColor: "#2563eb",
    iconBg: "bg-blue-50",
    accent: "bg-blue-500",
    labelColor: "text-blue-700",
  },

  success: {
    icon: "checkmark-circle",
    label: "Success",
    iconColor: "#059669",
    iconBg: "bg-emerald-50",
    accent: "bg-emerald-500",
    labelColor: "text-emerald-700",
  },

  warning: {
    icon: "warning",
    label: "Important",
    iconColor: "#d97706",
    iconBg: "bg-amber-50",
    accent: "bg-amber-500",
    labelColor: "text-amber-700",
  },

  feature: {
    icon: "sparkles",
    label: "New",
    iconColor: "#7c3aed",
    iconBg: "bg-violet-50",
    accent: "bg-violet-500",
    labelColor: "text-violet-700",
  },
};

const formatDate = (date: string) => {
  const announcementDate = new Date(date);

  if (Number.isNaN(announcementDate.getTime())) {
    return "";
  }

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const target = new Date(
    announcementDate.getFullYear(),
    announcementDate.getMonth(),
    announcementDate.getDate(),
  );

  if (target.getTime() === today.getTime()) {
    return "Today";
  }

  if (target.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return announcementDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function AnnouncementsPreview() {
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/announcements");

      const data = response.data?.data;

      if (Array.isArray(data)) {
        setAnnouncements(data.slice(0, 3));
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Refresh whenever the dashboard comes back into focus.
   *
   * This is useful when:
   * Dashboard → Announcement Screen → Back
   *
   * Any newly published announcement will be picked up.
   */
  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [fetchAnnouncements]),
  );

  const openAnnouncements = () => {
    router.push("/announcements/AnnouncementScreen");
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <View className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5">
        {/* Header skeleton */}
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 rounded-xl bg-zinc-100" />

            <View>
              <View className="mb-2 h-4 w-32 rounded bg-zinc-200" />
              <View className="h-3 w-40 rounded bg-zinc-100" />
            </View>
          </View>

          <View className="h-8 w-8 rounded-full bg-zinc-100" />
        </View>

        {/* Announcement skeletons */}
        {[1, 2].map((item) => (
          <View
            key={item}
            className="mb-3 overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
          >
            <View className="flex-row">
              <View className="mr-3 h-10 w-10 rounded-xl bg-zinc-200" />

              <View className="flex-1">
                <View className="mb-2 h-2.5 w-28 rounded bg-zinc-200" />
                <View className="mb-2 h-4 w-4/5 rounded bg-zinc-200" />
                <View className="mb-1.5 h-3 w-full rounded bg-zinc-100" />
                <View className="h-3 w-3/4 rounded bg-zinc-100" />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  /*
   * No announcements
   *
   * Don't leave an empty card on the dashboard.
   */
  if (announcements.length === 0) {
    return null;
  }

  return (
    <View className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          {/* Icon */}
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
            <Ionicons name="megaphone-outline" size={20} color="#18181b" />
          </View>

          {/* Title */}
          <View>
            <View className="flex-row items-center">
              <Text className="text-base font-bold text-zinc-900">
                Announcements
              </Text>

              {/* Count */}
              <View className="ml-2 min-w-[22px] items-center justify-center rounded-full bg-zinc-100 px-1.5 py-0.5">
                <Text className="text-[10px] font-bold text-zinc-600">
                  {announcements.length}
                </Text>
              </View>
            </View>

            <Text className="mt-0.5 text-xs text-zinc-500">
              Latest updates from FinTrack
            </Text>
          </View>
        </View>

        {/* Header arrow */}
        <Pressable
          onPress={openAnnouncements}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-zinc-50 active:bg-zinc-100"
        >
          <Ionicons name="chevron-forward" size={17} color="#71717a" />
        </Pressable>
      </View>

      {/* ========================================================= */}
      {/* ANNOUNCEMENTS */}
      {/* ========================================================= */}

      <View>
        {announcements.map((announcement, index) => {
          const config = typeConfig[announcement.type] || typeConfig.info;

          const hasAction =
            announcement.action?.enabled === true &&
            Boolean(announcement.action?.label);

          return (
            <Pressable
              key={announcement._id}
              onPress={openAnnouncements}
              className={`relative overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 p-4 active:bg-zinc-100 ${
                index !== announcements.length - 1 ? "mb-3" : ""
              }`}
            >
              {/* Type accent */}
              <View
                className={`absolute bottom-0 left-0 top-0 w-1 ${config.accent}`}
              />

              <View className="flex-row">
                {/* ================================================= */}
                {/* ICON */}
                {/* ================================================= */}

                <View
                  className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${config.iconBg}`}
                >
                  <Ionicons
                    name={config.icon}
                    size={18}
                    color={config.iconColor}
                  />
                </View>

                {/* ================================================= */}
                {/* CONTENT */}
                {/* ================================================= */}

                <View className="flex-1 pr-2">
                  {/* Meta */}
                  <View className="mb-1.5 flex-row items-center">
                    <Text
                      className={`text-[10px] font-extrabold uppercase tracking-wide ${config.labelColor}`}
                    >
                      {config.label}
                    </Text>

                    <View className="mx-2 h-1 w-1 rounded-full bg-zinc-300" />

                    <Text className="text-[10px] font-medium text-zinc-400">
                      {formatDate(announcement.createdAt)}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text
                    numberOfLines={2}
                    className="text-sm font-bold leading-5 text-zinc-900"
                  >
                    {announcement.title}
                  </Text>

                  {/* Message */}
                  <Text
                    numberOfLines={2}
                    className="mt-1 text-xs leading-5 text-zinc-500"
                  >
                    {announcement.message}
                  </Text>

                  {/* Optional action indicator */}
                  {hasAction && (
                    <View className="mt-2.5 flex-row items-center">
                      <Ionicons
                        name="arrow-forward-circle-outline"
                        size={14}
                        color="#71717a"
                      />

                      <Text className="ml-1.5 text-[10px] font-bold text-zinc-500">
                        {announcement.action?.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* ================================================= */}
                {/* ARROW */}
                {/* ================================================= */}

                <View className="ml-1 items-center justify-center">
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
        onPress={openAnnouncements}
        className="mt-4 flex-row items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3.5 active:bg-zinc-800"
      >
        <Ionicons name="megaphone-outline" size={15} color="#ffffff" />

        <Text className="mx-2 text-xs font-bold text-white">
          See all announcements
        </Text>

        <Ionicons name="arrow-forward" size={15} color="#ffffff" />
      </Pressable>
    </View>
  );
}
