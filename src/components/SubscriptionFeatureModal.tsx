import React from "react";

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SubscriptionFeatureModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.75)" />

      {/* OVERLAY */}
      <View className="flex-1 bg-black/80 justify-center px-4">
        {/* MODAL */}
        <View
          className="bg-white rounded-[40px] overflow-hidden self-center"
          style={{
            width: "100%",
            maxHeight: height * 0.93,
          }}
        >
          {/* FLOATING DECORATION */}
          <View className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-indigo-100 opacity-70" />

          <View className="absolute top-44 -left-24 w-56 h-56 rounded-full bg-purple-100 opacity-40" />

          {/* CLOSE BUTTON */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            className="
              absolute
              top-5
              right-5
              z-50
              bg-white
              w-12
              h-12
              rounded-2xl
              items-center
              justify-center
              shadow-sm
            "
          >
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 34,
            }}
          >
            {/* HEADER */}
            <View className="px-7 pt-8">
              {/* BADGE */}
              <View className="bg-indigo-100 self-start px-4 py-2 rounded-full">
                <Text className="text-indigo-700 font-black text-xs tracking-wider">
                  ✨ NEW FEATURE
                </Text>
              </View>

              {/* TITLE */}
              <Text className="text-zinc-900 text-[38px] font-black mt-5 leading-tight">
                Subscription{"\n"}Manager
              </Text>

              {/* DESCRIPTION */}
              <Text className="text-zinc-500 text-[15px] leading-7 mt-5">
                Manage recurring bills, track upcoming renewals, monitor monthly
                spending and get powerful subscription analytics in one premium
                dashboard.
              </Text>
            </View>

            {/* FEATURE TAGS */}
            <View className="flex-row flex-wrap px-7 mt-7">
              {[
                "Recurring Bills",
                "Renewal Alerts",
                "Smart Analytics",
                "Monthly Tracking",
              ].map((item) => (
                <View
                  key={item}
                  className="
                    bg-zinc-100
                    px-4
                    py-3
                    rounded-2xl
                    mr-3
                    mb-3
                  "
                >
                  <Text className="text-zinc-800 font-bold text-sm">
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* SCREENSHOTS */}
            <ScrollView
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={width * 0.82}
              showsHorizontalScrollIndicator={false}
              className="mt-9"
              contentContainerStyle={{
                paddingHorizontal: 18,
              }}
            >
              {/* IMAGE 1 */}
              <View
                className="
                  bg-zinc-100
                  rounded-[34px]
                  overflow-hidden
                  mr-5
                  border
                  border-zinc-200
                "
                style={{
                  width: width * 0.82,
                }}
              >
                <Image
                  source={require("../../assets/screenshots/subscription-img1.jpg")}
                  resizeMode="cover"
                  style={{
                    width: "100%",
                    height: 620,
                  }}
                />
              </View>

              {/* IMAGE 2 */}
              <View
                className="
                  bg-zinc-100
                  rounded-[34px]
                  overflow-hidden
                  border
                  border-zinc-200
                "
                style={{
                  width: width * 0.82,
                }}
              >
                <Image
                  source={require("../../assets/screenshots/subscription-img2.jpg")}
                  resizeMode="cover"
                  style={{
                    width: "100%",
                    height: 620,
                  }}
                />
              </View>
            </ScrollView>

            {/* FEATURES */}
            <View className="px-7 mt-10">
              {/* ITEM */}
              <View className="flex-row mb-7">
                <View className="bg-emerald-100 p-3 rounded-2xl mr-4 self-start">
                  <Ionicons name="notifications" size={22} color="#059669" />
                </View>

                <View className="flex-1">
                  <Text className="text-zinc-900 text-[17px] font-black">
                    Smart Renewal Reminders
                  </Text>

                  <Text className="text-zinc-500 leading-7 mt-2">
                    Never miss upcoming subscription renewals and recurring
                    payments again.
                  </Text>
                </View>
              </View>

              {/* ITEM */}
              <View className="flex-row mb-7">
                <View className="bg-indigo-100 p-3 rounded-2xl mr-4 self-start">
                  <Ionicons name="analytics" size={22} color="#4F46E5" />
                </View>

                <View className="flex-1">
                  <Text className="text-zinc-900 text-[17px] font-black">
                    Subscription Analytics
                  </Text>

                  <Text className="text-zinc-500 leading-7 mt-2">
                    Understand your monthly and yearly recurring spending with
                    premium insights.
                  </Text>
                </View>
              </View>

              {/* ITEM */}
              <View className="flex-row">
                <View className="bg-pink-100 p-3 rounded-2xl mr-4 self-start">
                  <Ionicons name="albums" size={22} color="#DB2777" />
                </View>

                <View className="flex-1">
                  <Text className="text-zinc-900 text-[17px] font-black">
                    All Subscriptions In One Place
                  </Text>

                  <Text className="text-zinc-500 leading-7 mt-2">
                    Organize Netflix, Spotify, YouTube Premium, AWS and more in
                    one beautiful dashboard.
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA */}
            <View className="px-7 mt-12">
              {/* PRIMARY */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  onClose();

                  router.push("/subscriptions");
                }}
                className="
                  bg-indigo-600
                  rounded-[28px]
                  py-5
                  items-center
                  shadow-lg
                "
              >
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={22} color="white" />

                  <Text className="text-white font-black text-lg ml-3">
                    Explore Subscription Manager
                  </Text>
                </View>
              </TouchableOpacity>

              {/* SECONDARY */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onClose}
                className="
                  bg-zinc-100
                  rounded-[28px]
                  py-5
                  items-center
                  mt-4
                "
              >
                <Text className="text-zinc-700 font-bold text-base">
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
