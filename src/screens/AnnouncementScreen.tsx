import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  Announcement,
  getActiveAnnouncements,
} from "../services/announcementService";

const ITEMS_PER_PAGE = 6;

type FilterType = "all" | Announcement["type"];

/*
|--------------------------------------------------------------------------
| Announcement timestamp support
|--------------------------------------------------------------------------
|
| The backend uses Mongoose timestamps, so announcements contain:
|
| createdAt
| updatedAt
|
| Keeping these optional here also prevents the screen from crashing
| if an older cached response does not contain them.
|
*/

type AnnouncementWithTimestamps = Announcement & {
  createdAt?: string;
  updatedAt?: string;
};

const FILTERS: FilterType[] = ["all", "info", "success", "warning", "feature"];

/*
|--------------------------------------------------------------------------
| Date formatting
|--------------------------------------------------------------------------
*/

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| Date + time formatting
|--------------------------------------------------------------------------
*/

const formatDateTime = (dateString?: string) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/*
|--------------------------------------------------------------------------
| Type label
|--------------------------------------------------------------------------
*/

const getTypeLabel = (type: FilterType) => {
  if (type === "all") {
    return "All";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
};

/*
|--------------------------------------------------------------------------
| Type icon
|--------------------------------------------------------------------------
*/

const getAnnouncementIcon = (
  type: Announcement["type"],
): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "success":
      return "checkmark-circle-outline";

    case "warning":
      return "warning-outline";

    case "feature":
      return "sparkles-outline";

    case "info":
    default:
      return "information-circle-outline";
  }
};

/*
|--------------------------------------------------------------------------
| Announcement theme
|--------------------------------------------------------------------------
*/

const getAnnouncementTheme = (type: Announcement["type"]) => {
  switch (type) {
    case "success":
      return {
        card: "bg-emerald-50 border-emerald-200",
        iconBackground: "bg-white",
        iconColor: "#059669",
        badge: "bg-emerald-100",
        badgeText: "text-emerald-700",
        heroBackground: "#ECFDF5",
        heroBorder: "#A7F3D0",
      };

    case "warning":
      return {
        card: "bg-amber-50 border-amber-200",
        iconBackground: "bg-white",
        iconColor: "#D97706",
        badge: "bg-amber-100",
        badgeText: "text-amber-700",
        heroBackground: "#FFFBEB",
        heroBorder: "#FDE68A",
      };

    case "feature":
      return {
        card: "bg-violet-50 border-violet-200",
        iconBackground: "bg-white",
        iconColor: "#7C3AED",
        badge: "bg-violet-100",
        badgeText: "text-violet-700",
        heroBackground: "#F5F3FF",
        heroBorder: "#DDD6FE",
      };

    case "info":
    default:
      return {
        card: "bg-blue-50 border-blue-200",
        iconBackground: "bg-white",
        iconColor: "#2563EB",
        badge: "bg-blue-100",
        badgeText: "text-blue-700",
        heroBackground: "#EFF6FF",
        heroBorder: "#BFDBFE",
      };
  }
};

/*
|--------------------------------------------------------------------------
| Announcement Screen
|--------------------------------------------------------------------------
*/

const AnnouncementScreen = () => {
  const [announcements, setAnnouncements] = useState<
    AnnouncementWithTimestamps[]
  >([]);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementWithTimestamps | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load announcements
  |--------------------------------------------------------------------------
  */

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await getActiveAnnouncements();

      setAnnouncements(data as AnnouncementWithTimestamps[]);
    } catch (error) {
      console.error("Failed to load announcements:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  /*
  |--------------------------------------------------------------------------
  | Search + filter
  |--------------------------------------------------------------------------
  */

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return announcements.filter((announcement) => {
      const matchesFilter = filter === "all" || announcement.type === filter;

      const matchesSearch =
        query.length === 0 ||
        announcement.title.toLowerCase().includes(query) ||
        announcement.message.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [announcements, search, filter]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE),
  );

  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredAnnouncements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAnnouncements, currentPage]);

  /*
  |--------------------------------------------------------------------------
  | Reset pagination when search/filter changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  /*
  |--------------------------------------------------------------------------
  | Keep page valid
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
  |--------------------------------------------------------------------------
  | Pull to refresh
  |--------------------------------------------------------------------------
  */

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnnouncements();
  }, [loadAnnouncements]);

  /*
  |--------------------------------------------------------------------------
  | Pagination actions
  |--------------------------------------------------------------------------
  */

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((page) => page + 1);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        <View className="flex-1 items-center justify-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <ActivityIndicator size="small" color="#111827" />
          </View>

          <Text className="mt-4 text-sm font-semibold text-gray-500">
            Loading announcements...
          </Text>

          <Text className="mt-1 text-xs text-gray-400">
            Please wait a moment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main screen
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="flex-1 bg-gray-50">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#111827"
            />
          }
        >
          {/* ======================================================
              HEADER
          ====================================================== */}

          <View className="pb-5 pt-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[28px] font-extrabold leading-[34px] text-gray-950">
                  Announcements
                </Text>

                <Text className="mt-1.5 text-[13px] leading-[19px] text-gray-500">
                  Stay updated with the latest from FinTrack
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <Ionicons name="megaphone-outline" size={21} color="#111827" />
              </View>
            </View>
          </View>

          {/* ======================================================
              SEARCH
          ====================================================== */}

          <View className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
            <Ionicons name="search-outline" size={19} color="#9CA3AF" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search announcements..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              className="h-12 flex-1 px-3 text-sm text-gray-900"
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              >
                <Ionicons name="close" size={17} color="#6B7280" />
              </Pressable>
            )}
          </View>

          {/* ======================================================
              FILTERS
          ====================================================== */}

          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {FILTERS.map((item) => {
                const active = filter === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => setFilter(item)}
                    className={`rounded-full border px-4 py-2.5 active:opacity-80 ${
                      active
                        ? "border-gray-900 bg-gray-900"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {getTypeLabel(item)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ======================================================
              RESULTS HEADER
          ====================================================== */}

          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-1.5 w-1.5 rounded-full bg-gray-900" />

              <Text className="text-[15px] font-extrabold text-gray-900">
                Latest Announcements
              </Text>
            </View>

            <Text className="text-xs font-medium text-gray-400">
              {filteredAnnouncements.length}{" "}
              {filteredAnnouncements.length === 1 ? "result" : "results"}
            </Text>
          </View>

          {/* ======================================================
              ANNOUNCEMENT CARDS
          ====================================================== */}

          {paginatedAnnouncements.length > 0 ? (
            <View>
              {paginatedAnnouncements.map((announcement) => {
                const theme = getAnnouncementTheme(announcement.type);

                return (
                  <Pressable
                    key={announcement._id}
                    onPress={() => setSelectedAnnouncement(announcement)}
                    className={`mb-3 flex-row rounded-2xl border p-4 active:opacity-80 ${theme.card}`}
                  >
                    {/* ICON */}

                    <View
                      className={`mr-3 h-11 w-11 items-center justify-center rounded-full ${theme.iconBackground}`}
                    >
                      <Ionicons
                        name={getAnnouncementIcon(announcement.type)}
                        size={21}
                        color={theme.iconColor}
                      />
                    </View>

                    {/* CONTENT */}

                    <View className="flex-1">
                      {/* TYPE */}

                      <View className="mb-1.5 flex-row items-center justify-between">
                        <View
                          className={`rounded-full px-2.5 py-1 ${theme.badge}`}
                        >
                          <Text
                            className={`text-[9px] font-extrabold uppercase tracking-wider ${theme.badgeText}`}
                          >
                            {announcement.type}
                          </Text>
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color="#9CA3AF"
                        />
                      </View>

                      {/* TITLE */}

                      <Text
                        numberOfLines={2}
                        className="text-[16px] font-extrabold leading-[21px] text-gray-900"
                      >
                        {announcement.title}
                      </Text>

                      {/* MESSAGE */}

                      <Text
                        numberOfLines={3}
                        className="mt-1.5 text-[13px] leading-[19px] text-gray-600"
                      >
                        {announcement.message}
                      </Text>

                      {/* TIMESTAMP */}

                      <View className="mt-3 flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#9CA3AF"
                        />

                        <Text className="ml-1.5 text-[10px] font-medium text-gray-400">
                          Added {formatDateTime(announcement.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            /* ====================================================
               EMPTY STATE
            ==================================================== */

            <View className="items-center rounded-3xl border border-gray-200 bg-white px-6 py-14">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Ionicons name="megaphone-outline" size={27} color="#9CA3AF" />
              </View>

              <Text className="mt-5 text-base font-extrabold text-gray-900">
                No announcements found
              </Text>

              <Text className="mt-1.5 max-w-[280px] text-center text-[13px] leading-[19px] text-gray-500">
                {search.length > 0
                  ? "Try changing your search or filter."
                  : "There are currently no active announcements."}
              </Text>

              {(search.length > 0 || filter !== "all") && (
                <Pressable
                  onPress={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-gray-900 px-5 py-3 active:bg-gray-800"
                >
                  <Text className="text-xs font-bold text-white">
                    Clear Filters
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ======================================================
              PAGINATION
          ====================================================== */}

          {filteredAnnouncements.length > ITEMS_PER_PAGE && (
            <View className="mt-5 rounded-2xl border border-gray-200 bg-white p-3">
              <View className="flex-row items-center justify-between">
                {/* PREVIOUS */}

                <Pressable
                  onPress={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`h-10 flex-row items-center rounded-xl px-3 ${
                    currentPage === 1
                      ? "bg-gray-100"
                      : "bg-gray-900 active:bg-gray-800"
                  }`}
                >
                  <Ionicons
                    name="chevron-back"
                    size={17}
                    color={currentPage === 1 ? "#9CA3AF" : "#FFFFFF"}
                  />

                  <Text
                    className={`ml-1 text-xs font-bold ${
                      currentPage === 1 ? "text-gray-400" : "text-white"
                    }`}
                  >
                    Previous
                  </Text>
                </Pressable>

                {/* PAGE NUMBERS */}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mx-2 flex-1"
                  contentContainerClassName="items-center justify-center gap-1"
                >
                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1,
                  ).map((page) => {
                    const active = currentPage === page;

                    return (
                      <Pressable
                        key={page}
                        onPress={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 items-center justify-center rounded-lg px-2 active:opacity-80 ${
                          active ? "bg-gray-900" : "bg-gray-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            active ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {page}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* NEXT */}

                <Pressable
                  onPress={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`h-10 flex-row items-center rounded-xl px-3 ${
                    currentPage === totalPages
                      ? "bg-gray-100"
                      : "bg-gray-900 active:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`mr-1 text-xs font-bold ${
                      currentPage === totalPages
                        ? "text-gray-400"
                        : "text-white"
                    }`}
                  >
                    Next
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={currentPage === totalPages ? "#9CA3AF" : "#FFFFFF"}
                  />
                </Pressable>
              </View>

              <Text className="mt-2 text-center text-[10px] font-medium text-gray-400">
                Page {currentPage} of {totalPages}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ========================================================
            PREMIUM ANNOUNCEMENT DETAIL MODAL
        ======================================================== */}

        <Modal
          visible={selectedAnnouncement !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedAnnouncement(null)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="max-h-[92%] overflow-hidden rounded-t-[30px] bg-white">
              {/* ==================================================
                  MODAL TOP HANDLE
              ================================================== */}

              <View className="items-center pt-3">
                <View className="h-1.5 w-12 rounded-full bg-gray-200" />
              </View>

              {/* ==================================================
                  MODAL HEADER
              ================================================== */}

              <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                    <Ionicons
                      name="megaphone-outline"
                      size={17}
                      color="#111827"
                    />
                  </View>

                  <View className="ml-3">
                    <Text className="text-sm font-extrabold text-gray-900">
                      Announcement
                    </Text>

                    <Text className="mt-0.5 text-[10px] text-gray-400">
                      From FinTrack
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setSelectedAnnouncement(null)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <Ionicons name="close" size={19} color="#4B5563" />
                </Pressable>
              </View>

              {/* ==================================================
                  MODAL CONTENT
              ================================================== */}

              {selectedAnnouncement && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerClassName="px-5 pb-8"
                >
                  {(() => {
                    const theme = getAnnouncementTheme(
                      selectedAnnouncement.type,
                    );

                    const icon = getAnnouncementIcon(selectedAnnouncement.type);

                    return (
                      <>
                        {/* ======================================
                            HERO
                        ====================================== */}

                        <View
                          className="rounded-[24px] border p-5"
                          style={{
                            backgroundColor: theme.heroBackground,
                            borderColor: theme.heroBorder,
                          }}
                        >
                          <View className="flex-row items-start justify-between">
                            <View
                              className="h-14 w-14 items-center justify-center rounded-2xl"
                              style={{
                                backgroundColor: "#FFFFFF",
                              }}
                            >
                              <Ionicons
                                name={icon}
                                size={27}
                                color={theme.iconColor}
                              />
                            </View>

                            <View
                              className={`rounded-full px-3 py-1.5 ${theme.badge}`}
                            >
                              <Text
                                className={`text-[9px] font-extrabold uppercase tracking-wider ${theme.badgeText}`}
                              >
                                {selectedAnnouncement.type}
                              </Text>
                            </View>
                          </View>

                          <Text className="mt-5 text-[25px] font-extrabold leading-[32px] text-gray-950">
                            {selectedAnnouncement.title}
                          </Text>

                          <View className="mt-3 flex-row items-center">
                            <Ionicons
                              name="shield-checkmark-outline"
                              size={13}
                              color="#9CA3AF"
                            />

                            <Text className="ml-1.5 text-[10px] font-medium text-gray-400">
                              Official FinTrack announcement
                            </Text>
                          </View>
                        </View>

                        {/* ======================================
                            MESSAGE
                        ====================================== */}

                        <View className="mt-5">
                          <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                            Message
                          </Text>

                          <View className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <Text className="text-[14px] leading-[23px] text-gray-700">
                              {selectedAnnouncement.message}
                            </Text>
                          </View>
                        </View>

                        {/* ======================================
                            INFORMATION
                        ====================================== */}

                        <View className="mt-5">
                          <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                            Announcement Details
                          </Text>

                          <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                            {/* START DATE */}

                            <View className="flex-row items-center border-b border-gray-100 px-4 py-3.5">
                              <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                                <Ionicons
                                  name="calendar-outline"
                                  size={17}
                                  color="#4B5563"
                                />
                              </View>

                              <View className="ml-3 flex-1">
                                <Text className="text-[10px] font-medium text-gray-400">
                                  Start Date
                                </Text>

                                <Text className="mt-0.5 text-[13px] font-bold text-gray-900">
                                  {formatDate(selectedAnnouncement.startDate)}
                                </Text>
                              </View>
                            </View>

                            {/* END DATE */}

                            {selectedAnnouncement.endDate && (
                              <View className="flex-row items-center border-b border-gray-100 px-4 py-3.5">
                                <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                                  <Ionicons
                                    name="calendar-clear-outline"
                                    size={17}
                                    color="#4B5563"
                                  />
                                </View>

                                <View className="ml-3 flex-1">
                                  <Text className="text-[10px] font-medium text-gray-400">
                                    End Date
                                  </Text>

                                  <Text className="mt-0.5 text-[13px] font-bold text-gray-900">
                                    {formatDate(selectedAnnouncement.endDate)}
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* ADDED */}

                            <View className="flex-row items-center border-b border-gray-100 px-4 py-3.5">
                              <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                                <Ionicons
                                  name="time-outline"
                                  size={17}
                                  color="#4B5563"
                                />
                              </View>

                              <View className="ml-3 flex-1">
                                <Text className="text-[10px] font-medium text-gray-400">
                                  Added
                                </Text>

                                <Text className="mt-0.5 text-[13px] font-bold text-gray-900">
                                  {formatDateTime(
                                    selectedAnnouncement.createdAt,
                                  )}
                                </Text>
                              </View>
                            </View>

                            {/* UPDATED */}

                            <View className="flex-row items-center px-4 py-3.5">
                              <View className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                                <Ionicons
                                  name="refresh-outline"
                                  size={17}
                                  color="#4B5563"
                                />
                              </View>

                              <View className="ml-3 flex-1">
                                <Text className="text-[10px] font-medium text-gray-400">
                                  Last Updated
                                </Text>

                                <Text className="mt-0.5 text-[13px] font-bold text-gray-900">
                                  {formatDateTime(
                                    selectedAnnouncement.updatedAt,
                                  )}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* ======================================
                            ACTION
                        ====================================== */}

                        {selectedAnnouncement.action?.enabled &&
                          selectedAnnouncement.action.label && (
                            <View className="mt-5">
                              <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                                Quick Action
                              </Text>
                              <Pressable
                                onPress={() => {
                                  console.log(
                                    "Announcement action:",
                                    selectedAnnouncement.action?.route,
                                  );
                                }}
                                className="mt-5 h-12 w-full flex-row items-center justify-center rounded-xl bg-gray-950 px-5 active:bg-gray-800"
                              >
                                <Text className="text-[13px] font-extrabold tracking-[0.2px] text-white">
                                  {selectedAnnouncement.action.label}
                                </Text>

                                <View className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-white/10">
                                  <Ionicons
                                    name="arrow-forward"
                                    size={14}
                                    color="#FFFFFF"
                                  />
                                </View>
                              </Pressable>
                            </View>
                          )}

                        {/* ======================================
                            CLOSE
                        ====================================== */}

                        <Pressable
                          onPress={() => setSelectedAnnouncement(null)}
                          className="mt-3 h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
                        >
                          <Text className="text-sm font-bold text-gray-700">
                            Close
                          </Text>
                        </Pressable>
                      </>
                    );
                  })()}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default AnnouncementScreen;
