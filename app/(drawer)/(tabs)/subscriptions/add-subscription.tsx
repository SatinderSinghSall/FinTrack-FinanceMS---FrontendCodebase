import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

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
  };

  useFocusEffect(
    React.useCallback(() => {
      resetForm();
    }, []),
  );

  const submitHandler = async () => {
    try {
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
      router.push("/(drawer)/(tabs)/subscriptions");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 bg-zinc-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
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
              onChangeText={setName}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* AMOUNT */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Amount</Text>

            <TextInput
              placeholder="499"
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
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
              onChangeText={setPaymentMethod}
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
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
            onPress={submitHandler}
            className="bg-indigo-600 rounded-2xl py-5 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={22} color="white" />

              <Text className="text-white font-black text-lg ml-2">
                Save Subscription
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
