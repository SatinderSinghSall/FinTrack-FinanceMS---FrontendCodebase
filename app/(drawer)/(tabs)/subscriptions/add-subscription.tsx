import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { createSubscription } from "@/src/services/subscriptionApi";

const categories = [
  "Entertainment",
  "Productivity",
  "Finance",
  "Health",
  "Cloud",
  "Education",
];

const billingCycles = ["weekly", "monthly", "quarterly", "yearly"];

const initialForm = {
  name: "",
  amount: "",
  category: "Entertainment",
  billingCycle: "monthly",
  paymentMethod: "",
  notes: "",
  reminderDaysBefore: "3",
  autoRenew: true,
};

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Entertainment: "play-circle-outline",
  Productivity: "briefcase-outline",
  Finance: "wallet-outline",
  Health: "heart-outline",
  Cloud: "cloud-outline",
  Education: "school-outline",
};

const billingIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  weekly: "calendar-outline",
  monthly: "calendar",
  quarterly: "albums-outline",
  yearly: "calendar-number-outline",
};

export default function AddSubscription() {
  const [name, setName] = useState(initialForm.name);
  const [amount, setAmount] = useState(initialForm.amount);
  const [category, setCategory] = useState(initialForm.category);
  const [billingCycle, setBillingCycle] = useState(initialForm.billingCycle);
  const [paymentMethod, setPaymentMethod] = useState(initialForm.paymentMethod);
  const [notes, setNotes] = useState(initialForm.notes);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    initialForm.reminderDaysBefore,
  );
  const [autoRenew, setAutoRenew] = useState(initialForm.autoRenew);

  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    amount: "",
    paymentMethod: "",
  });

  const [showErrorModal, setShowErrorModal] = useState(false);

  const resetForm = () => {
    setName(initialForm.name);
    setAmount(initialForm.amount);
    setCategory(initialForm.category);
    setBillingCycle(initialForm.billingCycle);
    setPaymentMethod(initialForm.paymentMethod);
    setNotes(initialForm.notes);
    setReminderDaysBefore(initialForm.reminderDaysBefore);
    setAutoRenew(initialForm.autoRenew);
    setStartDate(new Date());
    setShowDatePicker(false);

    setErrors({
      name: "",
      amount: "",
      paymentMethod: "",
    });

    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      resetForm();
    }, []),
  );

  const validateForm = () => {
    const newErrors = {
      name: "",
      amount: "",
      paymentMethod: "",
    };

    let valid = true;

    if (!name.trim()) {
      newErrors.name = "Subscription name is required.";
      valid = false;
    }

    if (!amount.trim()) {
      newErrors.amount = "Amount is required.";
      valid = false;
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid amount.";
      valid = false;
    }

    if (!paymentMethod.trim()) {
      newErrors.paymentMethod = "Payment method is required.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      setShowErrorModal(true);
    }

    return valid;
  };

  const submitHandler = async () => {
    if (loading) return;

    if (!validateForm()) return;

    try {
      setLoading(true);

      await createSubscription({
        name,
        amount: Number(amount),
        category,
        billingCycle,
        paymentMethod,
        notes,
        reminderDaysBefore: Number(reminderDaysBefore),
        autoRenew,
        startDate,
      });

      Alert.alert("Success", "Subscription added successfully!");

      router.replace("/(drawer)/(tabs)/subscriptions");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          Alert.alert(
            "Error",
            err.response.data?.message ?? "Something went wrong on the server.",
          );
        } else if (err.request) {
          Alert.alert("Network Error", "Unable to connect to the server.");
        } else {
          Alert.alert("Error", err.message);
        }
      } else {
        Alert.alert("Unexpected Error", "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-100">
      {/* =========================================================
          ERROR MODAL
      ========================================================== */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-black/55 justify-center items-center px-6">
          <View className="w-full bg-white rounded-[36px] px-7 pt-8 pb-7">
            {/* Icon */}
            <View className="items-center">
              <LinearGradient
                colors={["#EF4444", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View className="w-[68px] h-[68px] rounded-full bg-white items-center justify-center">
                  <Ionicons name="warning" size={34} color="#EF4444" />
                </View>
              </LinearGradient>

              <Text className="text-zinc-900 text-[30px] font-black mt-6">
                Oops!
              </Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6 text-base">
                Please fix the following fields before saving your subscription.
              </Text>
            </View>

            <View className="h-px bg-zinc-200 my-7" />

            {/* Errors */}
            <View>
              {errors.name !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4 mb-3">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 text-red-700 font-semibold flex-1">
                    {errors.name}
                  </Text>
                </View>
              )}

              {errors.amount !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4 mb-3">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 text-red-700 font-semibold flex-1">
                    {errors.amount}
                  </Text>
                </View>
              )}

              {errors.paymentMethod !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 text-red-700 font-semibold flex-1">
                    {errors.paymentMethod}
                  </Text>
                </View>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowErrorModal(false)}
              className="mt-8 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  alignItems: "center",
                  borderRadius: 18,
                }}
              >
                <Text className="text-white text-lg font-black">Got it</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowErrorModal(false)}
              className="items-center mt-5"
            >
              <Text className="text-zinc-400 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          MAIN KEYBOARD SAFE AREA
      ========================================================== */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          contentContainerStyle={{
            paddingBottom: 5,
          }}
        >
          {/* =====================================================
              HEADER
          ====================================================== */}
          <View className="px-5 pt-4 pb-6">
            <View className="flex-row items-center justify-between">
              {/* Back */}
              <TouchableOpacity
                disabled={loading}
                activeOpacity={0.75}
                onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
                className={`w-12 h-12 rounded-2xl bg-white border border-zinc-200 items-center justify-center ${
                  loading ? "opacity-40" : ""
                }`}
              >
                <Ionicons name="arrow-back" size={22} color="#18181B" />
              </TouchableOpacity>

              {/* Title */}
              <View className="items-center flex-1 mx-4">
                <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  Subscription Manager
                </Text>

                <Text className="text-zinc-900 text-[27px] font-black mt-1">
                  Add Subscription
                </Text>
              </View>

              {/* Right decorative icon */}
              <View className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center">
                <Ionicons name="repeat-outline" size={22} color="#4F46E5" />
              </View>
            </View>

            {/* Intro */}
            <View className="mt-6">
              <Text className="text-zinc-900 text-xl font-black">
                Track a new recurring expense
              </Text>

              <Text className="text-zinc-500 text-sm leading-5 mt-1">
                Add the details below to keep your subscriptions organized.
              </Text>
            </View>
          </View>

          {/* =====================================================
              FORM
          ====================================================== */}
          <View className="px-5">
            {/* ===================================================
                BASIC DETAILS
            ==================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-indigo-100 items-center justify-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={19}
                    color="#4F46E5"
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Basic Details
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    What are you subscribing to?
                  </Text>
                </View>
              </View>

              {/* Name */}
              <View className="mb-4">
                <Text className="text-zinc-700 font-bold mb-2.5">
                  Subscription Name
                </Text>

                <View
                  className={`bg-white rounded-2xl border ${
                    errors.name ? "border-red-300" : "border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-zinc-100 items-center justify-center">
                      <Ionicons
                        name="pricetag-outline"
                        size={18}
                        color="#52525B"
                      />
                    </View>

                    <TextInput
                      editable={!loading}
                      placeholder="Netflix"
                      placeholderTextColor="#A1A1AA"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setErrors((prev) => ({
                          ...prev,
                          name: "",
                        }));
                      }}
                      returnKeyType="next"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-medium"
                    />
                  </View>
                </View>

                {errors.name ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />

                    <Text className="text-red-500 text-xs font-semibold ml-1.5">
                      {errors.name}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Amount */}
              <View>
                <Text className="text-zinc-700 font-bold mb-2.5">Amount</Text>

                <View
                  className={`bg-white rounded-2xl border ${
                    errors.amount ? "border-red-300" : "border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center">
                      <Text className="text-indigo-600 font-black text-base">
                        ₹
                      </Text>
                    </View>

                    <TextInput
                      editable={!loading}
                      placeholder="499"
                      placeholderTextColor="#A1A1AA"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={(text) => {
                        setAmount(text);
                        setErrors((prev) => ({
                          ...prev,
                          amount: "",
                        }));
                      }}
                      returnKeyType="next"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-bold"
                    />

                    <Text className="text-zinc-400 text-xs font-semibold">
                      INR
                    </Text>
                  </View>
                </View>

                {errors.amount ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />

                    <Text className="text-red-500 text-xs font-semibold ml-1.5">
                      {errors.amount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* ===================================================
                CATEGORY
            ==================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-purple-100 items-center justify-center">
                  <Ionicons name="grid-outline" size={18} color="#7C3AED" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Category
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Organize your recurring expense
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 10,
                }}
              >
                {categories.map((item) => {
                  const selected = category === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      disabled={loading}
                      activeOpacity={0.8}
                      onPress={() => setCategory(item)}
                      className={`mr-3 rounded-2xl px-4 py-3.5 flex-row items-center border ${
                        selected
                          ? "bg-indigo-600 border-indigo-600"
                          : "bg-white border-zinc-200"
                      } ${loading ? "opacity-50" : ""}`}
                    >
                      <Ionicons
                        name={categoryIcons[item] ?? "ellipse-outline"}
                        size={18}
                        color={selected ? "#FFFFFF" : "#52525B"}
                      />

                      <Text
                        className={`ml-2 font-bold ${
                          selected ? "text-white" : "text-zinc-700"
                        }`}
                      >
                        {item}
                      </Text>

                      {selected && (
                        <View className="ml-2">
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ===================================================
                BILLING
            ==================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-emerald-100 items-center justify-center">
                  <Ionicons name="repeat-outline" size={19} color="#059669" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Billing Cycle
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    How often are you charged?
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                {billingCycles.map((item) => {
                  const selected = billingCycle === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      disabled={loading}
                      activeOpacity={0.8}
                      onPress={() => setBillingCycle(item)}
                      className={`w-[48%] mr-[2%] mb-3 rounded-2xl border px-4 py-4 ${
                        selected
                          ? "bg-indigo-600 border-indigo-600"
                          : "bg-white border-zinc-200"
                      } ${loading ? "opacity-50" : ""}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View
                          className={`w-9 h-9 rounded-xl items-center justify-center ${
                            selected ? "bg-white/15" : "bg-zinc-100"
                          }`}
                        >
                          <Ionicons
                            name={billingIcons[item] ?? "calendar-outline"}
                            size={18}
                            color={selected ? "#FFFFFF" : "#52525B"}
                          />
                        </View>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </View>

                      <Text
                        className={`capitalize font-black text-base mt-3 ${
                          selected ? "text-white" : "text-zinc-800"
                        }`}
                      >
                        {item}
                      </Text>

                      <Text
                        className={`capitalize text-xs mt-0.5 ${
                          selected ? "text-indigo-100" : "text-zinc-400"
                        }`}
                      >
                        Recurring
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ===================================================
                START DATE
            ==================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-orange-100 items-center justify-center">
                  <Ionicons name="calendar-outline" size={18} color="#EA580C" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Start Date
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    When did this subscription begin?
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                disabled={loading}
                activeOpacity={0.8}
                onPress={() => setShowDatePicker(true)}
                className={`bg-white border border-zinc-200 rounded-2xl p-4 flex-row items-center justify-between ${
                  loading ? "opacity-50" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <View className="w-11 h-11 rounded-xl bg-orange-50 items-center justify-center">
                    <Ionicons name="calendar" size={21} color="#EA580C" />
                  </View>

                  <View className="ml-3">
                    <Text className="text-zinc-400 text-xs font-semibold">
                      Subscription started
                    </Text>

                    <Text className="text-zinc-900 font-bold text-base mt-1">
                      {formattedDate}
                    </Text>
                  </View>
                </View>

                <View className="w-9 h-9 rounded-xl bg-zinc-100 items-center justify-center">
                  <Ionicons name="chevron-forward" size={18} color="#71717A" />
                </View>
              </TouchableOpacity>

              {showDatePicker && !loading && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);

                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* ===================================================
                PAYMENT
            ==================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-blue-100 items-center justify-center">
                  <Ionicons name="card-outline" size={18} color="#2563EB" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Payment
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    How do you pay for it?
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-zinc-700 font-bold mb-2.5">
                  Payment Method
                </Text>

                <View
                  className={`bg-white rounded-2xl border ${
                    errors.paymentMethod ? "border-red-300" : "border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center">
                      <Ionicons name="card-outline" size={18} color="#2563EB" />
                    </View>

                    <TextInput
                      editable={!loading}
                      placeholder="Credit Card"
                      placeholderTextColor="#A1A1AA"
                      value={paymentMethod}
                      onChangeText={(text) => {
                        setPaymentMethod(text);
                        setErrors((prev) => ({
                          ...prev,
                          paymentMethod: "",
                        }));
                      }}
                      returnKeyType="next"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-medium"
                    />
                  </View>
                </View>

                {errors.paymentMethod ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />

                    <Text className="text-red-500 text-xs font-semibold ml-1.5">
                      {errors.paymentMethod}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Reminder */}
              <View>
                <Text className="text-zinc-700 font-bold mb-2.5">
                  Reminder Days Before
                </Text>

                <View className="bg-white border border-zinc-200 rounded-2xl">
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center">
                      <Ionicons
                        name="notifications-outline"
                        size={18}
                        color="#D97706"
                      />
                    </View>

                    <TextInput
                      editable={!loading}
                      placeholder="3"
                      placeholderTextColor="#A1A1AA"
                      keyboardType="numeric"
                      value={reminderDaysBefore}
                      onChangeText={setReminderDaysBefore}
                      returnKeyType="done"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-bold"
                    />

                    <Text className="text-zinc-400 text-xs font-bold">
                      DAYS
                    </Text>
                  </View>
                </View>

                <Text className="text-zinc-400 text-xs mt-2 ml-1">
                  You’ll be reminded before the next renewal.
                </Text>
              </View>
            </View>

            {/* ===================================================
                AUTO RENEW
            ==================================================== */}
            <View className="mb-6">
              <TouchableOpacity
                disabled={loading}
                activeOpacity={0.85}
                onPress={() => setAutoRenew((value) => !value)}
                className={`bg-white border border-zinc-200 rounded-2xl p-5 flex-row items-center justify-between ${
                  loading ? "opacity-50" : ""
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                      autoRenew ? "bg-emerald-50" : "bg-zinc-100"
                    }`}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={21}
                      color={autoRenew ? "#059669" : "#71717A"}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-zinc-900 font-black text-base">
                      Auto Renew
                    </Text>

                    <Text className="text-zinc-500 text-xs leading-4 mt-1">
                      Automatically renew this subscription
                    </Text>
                  </View>
                </View>

                <Switch
                  disabled={loading}
                  value={autoRenew}
                  onValueChange={setAutoRenew}
                  trackColor={{
                    false: "#D4D4D8",
                    true: "#818CF8",
                  }}
                  thumbColor={autoRenew ? "#4F46E5" : "#F4F4F5"}
                  ios_backgroundColor="#D4D4D8"
                />
              </TouchableOpacity>
            </View>

            {/* ===================================================
                NOTES
            ==================================================== */}
            <View className="mb-7">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-zinc-200 items-center justify-center">
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#52525B"
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Notes
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Add anything you want to remember
                  </Text>
                </View>
              </View>

              <View className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <TextInput
                  editable={!loading}
                  placeholder="Additional details..."
                  placeholderTextColor="#A1A1AA"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={notes}
                  onChangeText={setNotes}
                  className="text-zinc-900 text-base px-5 py-4 h-32"
                />
              </View>
            </View>

            {/* ===================================================
                SAVE BUTTON
            ==================================================== */}
            <View className="mb-2">
              <TouchableOpacity
                disabled={loading}
                activeOpacity={0.88}
                onPress={submitHandler}
                className={`overflow-hidden rounded-[22px] ${
                  loading ? "opacity-90" : ""
                }`}
              >
                <LinearGradient
                  colors={
                    loading ? ["#818CF8", "#6366F1"] : ["#6366F1", "#4F46E5"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    minHeight: 62,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    paddingHorizontal: 20,
                  }}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />

                      <Text className="text-white font-black text-base ml-3">
                        Saving Subscription...
                      </Text>
                    </>
                  ) : (
                    <>
                      <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
                        <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                      </View>

                      <Text className="text-white font-black text-lg ml-3">
                        Save Subscription
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginLeft: 10 }}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center mt-4">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#A1A1AA"
                />

                <Text className="text-zinc-400 text-xs font-medium ml-1.5">
                  Your subscription details stay organized in FinTrack
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================================================
          FULL SCREEN SUBMIT LOADER
      ========================================================== */}
      <Modal
        visible={loading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/35 items-center justify-center px-6">
          <View className="w-full max-w-[320px] bg-white rounded-[30px] px-7 py-8 items-center">
            <View className="w-20 h-20 rounded-[26px] bg-indigo-50 items-center justify-center">
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>

            <Text className="text-zinc-900 text-xl font-black mt-5">
              Saving Subscription
            </Text>

            <Text className="text-zinc-500 text-center text-sm leading-5 mt-2">
              Please wait while we securely save your subscription details.
            </Text>

            <View className="flex-row items-center mt-5">
              <View className="w-2 h-2 rounded-full bg-indigo-500" />

              <Text className="text-zinc-400 text-xs font-semibold ml-2">
                Do not close this screen
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
