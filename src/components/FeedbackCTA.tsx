import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FeedbackCTA() {
  const router = useRouter();

  return (
    <View className="my-5 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
      {/* CTA Section Header */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-bold text-slate-900">
            Help Center & Support
          </Text>
          <Text className="text-[11px] text-slate-500 mt-0.5">
            Encountered a bug or want to suggest a feature? Let us know.
          </Text>
        </View>
        <View className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 items-center justify-center">
          <Ionicons name="chatbubbles" size={17} color="#059669" />
        </View>
      </View>

      {/* Action Buttons Container */}
      <View style={{ gap: 10 }}>
        {/* Help & Feedback Button */}
        <Pressable
          onPress={() => router.push("/feedback/FeedbackScreen")}
          className="flex-row items-center justify-between py-3.5 px-3.5 bg-slate-50 rounded-2xl border border-slate-200/70"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 h-8 rounded-xl bg-white border border-slate-200 items-center justify-center mr-3">
              <Ionicons name="create-outline" size={16} color="#047857" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold text-xs">
                Submit Feedback or Bug Report
              </Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">
                Send a new request directly to our team
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={15} color="#94A3B8" />
        </Pressable>

        {/* View My Submissions & Status Button */}
        <Pressable
          onPress={() => router.push("/feedback/my-feedback")}
          className="flex-row items-center justify-between py-3.5 px-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-8 h-8 rounded-xl bg-white border border-emerald-200 items-center justify-center mr-3">
              <Ionicons name="time-outline" size={16} color="#065f46" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-emerald-950 font-bold text-xs">
                  Track Submissions & Status
                </Text>
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5" />
              </View>
              <Text className="text-[10px] text-emerald-700/80 mt-0.5">
                View progress on your active reports
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={15} color="#047857" />
        </Pressable>
      </View>
    </View>
  );
}
