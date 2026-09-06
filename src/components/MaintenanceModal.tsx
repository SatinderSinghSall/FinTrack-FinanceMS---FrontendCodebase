import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MaintenanceInfo } from "../utils/maintenance";

type Props = {
  visible: boolean;
  maintenance: MaintenanceInfo | null;
  onClose: () => void;
};

const formatCountdown = (milliseconds: number) => {
  if (milliseconds <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(
      minutes,
    ).padStart(2, "0")}m`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
};

const formatEndDate = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function MaintenanceModal({
  visible,
  maintenance,
  onClose,
}: Props) {
  const { width, height } = useWindowDimensions();

  const [now, setNow] = useState(Date.now());

  const restricted = maintenance ? !maintenance.allowUserAccess : false;

  const endDate = maintenance?.endDate ? new Date(maintenance.endDate) : null;

  const endTimestamp =
    endDate && !Number.isNaN(endDate.getTime()) ? endDate.getTime() : null;

  /*
   * Responsive sizing.
   *
   * The UI remains visually the same, but spacing and
   * larger elements shrink slightly on smaller devices.
   */
  const isSmallHeight = height < 700;
  const isVerySmallHeight = height < 620;

  const horizontalPadding = width < 360 ? 18 : 20;

  const cardPadding = isVerySmallHeight ? 18 : isSmallHeight ? 20 : 24;

  const topPadding = isVerySmallHeight ? 20 : isSmallHeight ? 22 : 28;

  const bottomPadding = isVerySmallHeight ? 18 : isSmallHeight ? 20 : 24;

  const iconOuterSize = isVerySmallHeight ? 68 : isSmallHeight ? 74 : 82;

  const iconInnerSize = isVerySmallHeight ? 52 : isSmallHeight ? 58 : 62;

  const iconSize = isVerySmallHeight ? 27 : isSmallHeight ? 30 : 32;

  const titleSize = isVerySmallHeight ? 21 : isSmallHeight ? 23 : 25;

  /*
   * Live countdown.
   */
  useEffect(() => {
    if (!visible || !endTimestamp) {
      return;
    }

    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, endTimestamp]);

  const remainingTime = endTimestamp ? Math.max(0, endTimestamp - now) : null;

  const hasEnded =
    endTimestamp !== null && remainingTime !== null && remainingTime <= 0;

  const isEndingSoon =
    endTimestamp !== null &&
    remainingTime !== null &&
    remainingTime > 0 &&
    remainingTime <= 60 * 60 * 1000;

  const formattedEndDate = useMemo(() => {
    if (!maintenance?.endDate) {
      return null;
    }

    return formatEndDate(maintenance.endDate);
  }, [maintenance?.endDate]);

  if (!maintenance) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={restricted ? undefined : onClose}
    >
      <SafeAreaView className="flex-1 bg-black/70">
        <View
          className="flex-1 items-center justify-center"
          style={{
            paddingHorizontal: horizontalPadding,
            paddingVertical: isVerySmallHeight ? 8 : 12,
          }}
        >
          <View
            className="w-full overflow-hidden rounded-[28px] bg-white"
            style={{
              maxWidth: 440,
            }}
          >
            {/* Top accent */}
            <View className="h-1.5 bg-amber-500" />

            {/* Main content */}
            <View
              style={{
                paddingHorizontal: cardPadding,
                paddingTop: topPadding,
                paddingBottom: bottomPadding,
              }}
            >
              {/* Status icon */}
              <View className="items-center">
                <View className="relative">
                  <View
                    className="items-center justify-center rounded-full bg-amber-50"
                    style={{
                      width: iconOuterSize,
                      height: iconOuterSize,
                    }}
                  >
                    <View
                      className="items-center justify-center rounded-full bg-amber-100"
                      style={{
                        width: iconInnerSize,
                        height: iconInnerSize,
                      }}
                    >
                      <Ionicons
                        name={
                          restricted
                            ? "lock-closed-outline"
                            : "construct-outline"
                        }
                        size={iconSize}
                        color="#d97706"
                      />
                    </View>
                  </View>

                  {/* Status dot */}
                  <View
                    className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-white bg-amber-500"
                    style={{
                      width: isVerySmallHeight ? 21 : 24,
                      height: isVerySmallHeight ? 21 : 24,
                    }}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={isVerySmallHeight ? 11 : 13}
                      color="white"
                    />
                  </View>
                </View>

                {/* Status badge */}
                <View
                  className="flex-row items-center rounded-full bg-amber-50 px-3"
                  style={{
                    marginTop: isVerySmallHeight ? 10 : 14,
                    paddingVertical: isVerySmallHeight ? 5 : 6,
                  }}
                >
                  <View className="mr-2 h-2 w-2 rounded-full bg-amber-500" />

                  <Text className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    {restricted ? "Maintenance Mode" : "Limited Access"}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  className="text-center font-bold tracking-tight text-zinc-950"
                  style={{
                    marginTop: isVerySmallHeight ? 9 : 12,
                    fontSize: titleSize,
                    lineHeight: titleSize + 5,
                  }}
                  numberOfLines={2}
                >
                  {maintenance.title}
                </Text>

                {/* Message */}
                <Text
                  className="text-center text-zinc-500"
                  style={{
                    marginTop: isVerySmallHeight ? 5 : 7,
                    fontSize: isVerySmallHeight ? 13 : 14,
                    lineHeight: isVerySmallHeight ? 18 : 20,
                  }}
                  numberOfLines={3}
                >
                  {maintenance.message}
                </Text>
              </View>

              {/* Countdown */}
              {endTimestamp !== null && formattedEndDate && (
                <View
                  className="overflow-hidden rounded-2xl border border-amber-100 bg-amber-50"
                  style={{
                    marginTop: isVerySmallHeight ? 10 : 14,
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: isVerySmallHeight ? 12 : 14,
                      paddingVertical: isVerySmallHeight ? 10 : 12,
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="items-center justify-center rounded-xl bg-white"
                        style={{
                          width: isVerySmallHeight ? 34 : 38,
                          height: isVerySmallHeight ? 34 : 38,
                        }}
                      >
                        <Ionicons
                          name={
                            hasEnded
                              ? "checkmark-circle-outline"
                              : "time-outline"
                          }
                          size={isVerySmallHeight ? 18 : 20}
                          color={hasEnded ? "#16a34a" : "#d97706"}
                        />
                      </View>

                      <View className="ml-3 flex-1">
                        <Text
                          className="font-medium uppercase tracking-wide text-amber-700"
                          style={{
                            fontSize: isVerySmallHeight ? 9 : 10,
                          }}
                          numberOfLines={1}
                        >
                          {hasEnded
                            ? "Maintenance end time reached"
                            : isEndingSoon
                              ? "Maintenance ending soon"
                              : "Estimated completion"}
                        </Text>

                        <Text
                          className="font-semibold text-zinc-900"
                          style={{
                            marginTop: 2,
                            fontSize: isVerySmallHeight ? 12 : 13,
                          }}
                          numberOfLines={2}
                        >
                          Ends at {formattedEndDate}
                        </Text>
                      </View>
                    </View>

                    {/* Timer */}
                    {!hasEnded && remainingTime !== null && (
                      <View
                        className="items-center rounded-xl bg-white"
                        style={{
                          marginTop: isVerySmallHeight ? 8 : 10,
                          paddingVertical: isVerySmallHeight ? 7 : 8,
                        }}
                      >
                        <Text
                          className="font-semibold uppercase tracking-[1.5px] text-zinc-400"
                          style={{
                            fontSize: isVerySmallHeight ? 9 : 10,
                          }}
                        >
                          Time remaining
                        </Text>

                        <Text
                          className="font-bold tracking-tight text-zinc-950"
                          style={{
                            marginTop: 1,
                            fontSize: isVerySmallHeight ? 21 : 23,
                            lineHeight: isVerySmallHeight ? 25 : 28,
                          }}
                        >
                          {formatCountdown(remainingTime)}
                        </Text>
                      </View>
                    )}

                    {/* Ended */}
                    {hasEnded && (
                      <View
                        className="flex-row items-center justify-center rounded-xl bg-white"
                        style={{
                          marginTop: isVerySmallHeight ? 8 : 10,
                          paddingVertical: isVerySmallHeight ? 8 : 9,
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#16a34a"
                        />

                        <Text
                          className="ml-2 font-semibold text-green-700"
                          style={{
                            fontSize: isVerySmallHeight ? 11 : 12,
                          }}
                        >
                          Scheduled end time has passed
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Information card */}
              <View
                className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50"
                style={{
                  marginTop:
                    endTimestamp !== null
                      ? isVerySmallHeight
                        ? 8
                        : 10
                      : isVerySmallHeight
                        ? 12
                        : 16,
                }}
              >
                {/* Access status */}
                <View
                  className="flex-row items-center"
                  style={{
                    paddingHorizontal: isVerySmallHeight ? 12 : 14,
                    paddingVertical: isVerySmallHeight ? 10 : 12,
                  }}
                >
                  <View
                    className="items-center justify-center rounded-xl bg-white"
                    style={{
                      width: isVerySmallHeight ? 34 : 38,
                      height: isVerySmallHeight ? 34 : 38,
                    }}
                  >
                    <Ionicons
                      name={
                        restricted
                          ? "lock-closed-outline"
                          : "checkmark-circle-outline"
                      }
                      size={isVerySmallHeight ? 18 : 20}
                      color={restricted ? "#d97706" : "#16a34a"}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      className="font-semibold text-zinc-900"
                      style={{
                        fontSize: isVerySmallHeight ? 12 : 13,
                      }}
                      numberOfLines={2}
                    >
                      {restricted
                        ? "App access is temporarily unavailable"
                        : "You can continue using FinTrack"}
                    </Text>

                    <Text
                      className="text-zinc-500"
                      style={{
                        marginTop: 2,
                        fontSize: isVerySmallHeight ? 10 : 11,
                        lineHeight: isVerySmallHeight ? 14 : 16,
                      }}
                      numberOfLines={2}
                    >
                      {restricted
                        ? "Please try again once maintenance has been completed."
                        : "Some features may be temporarily unavailable or behave differently."}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="mx-4 h-px bg-zinc-200" />

                {/* Support message */}
                <View
                  className="flex-row items-center"
                  style={{
                    paddingHorizontal: isVerySmallHeight ? 12 : 14,
                    paddingVertical: isVerySmallHeight ? 10 : 12,
                  }}
                >
                  <View
                    className="items-center justify-center rounded-xl bg-white"
                    style={{
                      width: isVerySmallHeight ? 34 : 38,
                      height: isVerySmallHeight ? 34 : 38,
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={isVerySmallHeight ? 18 : 20}
                      color="#71717a"
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      className="font-semibold text-zinc-900"
                      style={{
                        fontSize: isVerySmallHeight ? 12 : 13,
                      }}
                    >
                      Thanks for your patience
                    </Text>

                    <Text
                      className="text-zinc-500"
                      style={{
                        marginTop: 2,
                        fontSize: isVerySmallHeight ? 10 : 11,
                        lineHeight: isVerySmallHeight ? 14 : 16,
                      }}
                      numberOfLines={2}
                    >
                      We're working to keep FinTrack reliable and available.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action */}
              <View
                style={{
                  marginTop: isVerySmallHeight ? 10 : 14,
                }}
              >
                {!restricted ? (
                  <Pressable
                    onPress={onClose}
                    className="flex-row items-center justify-center rounded-2xl bg-zinc-950 active:opacity-80"
                    style={{
                      height: isVerySmallHeight ? 44 : 48,
                    }}
                  >
                    <Text
                      className="font-bold text-white"
                      style={{
                        fontSize: isVerySmallHeight ? 13 : 14,
                      }}
                    >
                      Continue to FinTrack
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  </Pressable>
                ) : (
                  <View
                    className="flex-row items-center justify-center rounded-2xl bg-zinc-100"
                    style={{
                      height: isVerySmallHeight ? 44 : 48,
                    }}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={17}
                      color="#71717a"
                    />

                    <Text
                      className="ml-2 font-semibold text-zinc-500"
                      style={{
                        fontSize: isVerySmallHeight ? 13 : 14,
                      }}
                    >
                      Please try again later
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer */}
              <View
                className="flex-row items-center justify-center"
                style={{
                  marginTop: isVerySmallHeight ? 8 : 12,
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={13}
                  color="#a1a1aa"
                />

                <Text
                  className="ml-1.5 text-zinc-400"
                  style={{
                    fontSize: isVerySmallHeight ? 9 : 10,
                  }}
                >
                  FinTrack • System status
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
