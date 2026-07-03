import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Alert, ActivityIndicator } from "react-native";
import axios from "axios";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from "react-native";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

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

    // Clear validation errors
    setErrors({
      name: "",
      amount: "",
      paymentMethod: "",
    });

    setLoading(false);
  };

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    amount: "",
    paymentMethod: "",
  });

  const [showErrorModal, setShowErrorModal] = useState(false);

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

  return (
    <View className="flex-1 bg-zinc-100">
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        statusBarTranslucent
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

            {/* Divider */}

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

            {/* Buttons */}

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 15,
        }}
      >
        {/* HEADER */}
        <View className="px-5 pt-16 pb-8">
          <View className="flex-row items-center justify-between">
            {/* BACK BUTTON */}

            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
              className="
                bg-white

                border border-zinc-200

                w-12 h-12

                rounded-2xl

                items-center justify-center
              "
            >
              <Ionicons name="arrow-back" size={24} color="#18181b" />
            </TouchableOpacity>

            {/* TITLE */}

            <View className="items-center">
              <Text className="text-zinc-500 text-sm font-medium">
                Subscription Manager
              </Text>

              <Text className="text-zinc-900 text-3xl font-black mt-1">
                Add Subscription
              </Text>
            </View>

            {/* RIGHT SPACER */}

            <View
              style={{
                width: 48,
              }}
            />
          </View>
        </View>

        {/* FORM */}

        <View className="px-5">
          {/* NAME */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">
              Subscription Name
            </Text>

            <TextInput
              placeholder="Netflix"
              placeholderTextColor="#71717a"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({
                  ...prev,
                  name: "",
                }));
              }}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />

            {errors.name ? (
              <Text className="text-red-500 mt-2">{errors.name}</Text>
            ) : null}
          </View>

          {/* AMOUNT */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Amount</Text>

            <TextInput
              placeholder="499"
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setErrors((prev) => ({
                  ...prev,
                  amount: "",
                }));
              }}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />

            {errors.amount ? (
              <Text className="text-red-500 mt-2">{errors.amount}</Text>
            ) : null}
          </View>

          {/* CATEGORY */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Category</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategory(item)}
                  className={`mr-3 px-5 py-3 rounded-2xl ${
                    category === item
                      ? "bg-indigo-600"
                      : "bg-white border border-zinc-200"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      category === item ? "text-white" : "text-zinc-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* BILLING CYCLE */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Billing Cycle</Text>

            <View className="flex-row flex-wrap">
              {billingCycles.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setBillingCycle(item)}
                  className={`mr-3 mb-3 px-5 py-3 rounded-2xl ${
                    billingCycle === item
                      ? "bg-indigo-600"
                      : "bg-white border border-zinc-200"
                  }`}
                >
                  <Text
                    className={`capitalize font-bold ${
                      billingCycle === item ? "text-white" : "text-zinc-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* START DATE */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">
              Subscription Start Date
            </Text>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#52525b" />

                <Text className="text-zinc-900 ml-3 font-medium">
                  {startDate.toDateString()}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#71717a" />
            </TouchableOpacity>

            {showDatePicker && (
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

          {/* PAYMENT METHOD */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Payment Method</Text>

            <TextInput
              placeholder="Credit Card"
              placeholderTextColor="#71717a"
              value={paymentMethod}
              onChangeText={(text) => {
                setPaymentMethod(text);
                setErrors((prev) => ({
                  ...prev,
                  paymentMethod: "",
                }));
              }}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />

            {errors.paymentMethod ? (
              <Text className="text-red-500 mt-2">{errors.paymentMethod}</Text>
            ) : null}
          </View>

          {/* REMINDER DAYS */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">
              Reminder Days Before
            </Text>

            <TextInput
              placeholder="3"
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              value={reminderDaysBefore}
              onChangeText={setReminderDaysBefore}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* AUTO RENEW */}

          <View className="bg-white border border-zinc-200 rounded-2xl p-5 flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-zinc-900 font-black text-lg">
                Auto Renew
              </Text>

              <Text className="text-zinc-500 mt-1">
                Subscription renews automatically
              </Text>
            </View>

            <Switch value={autoRenew} onValueChange={setAutoRenew} />
          </View>

          {/* NOTES */}

          <View className="mb-8">
            <Text className="text-zinc-700 font-bold mb-3">Notes</Text>

            <TextInput
              placeholder="Additional details..."
              placeholderTextColor="#71717a"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 h-32"
            />
          </View>

          {/* SAVE BUTTON */}

          <TouchableOpacity
            disabled={loading}
            onPress={submitHandler}
            className={`rounded-2xl py-5 items-center ${
              loading ? "bg-indigo-400" : "bg-indigo-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={22} color="white" />

                <Text className="text-white font-black text-lg ml-2">
                  Save Subscription
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
