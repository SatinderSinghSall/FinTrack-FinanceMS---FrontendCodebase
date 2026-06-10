import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "@/src/services/subscriptionApi";

const categories = [
  "Entertainment",
  "Productivity",
  "Finance",
  "Health",
  "Cloud",
  "Education",
];

const billingCycles = ["weekly", "monthly", "quarterly", "yearly"];

export default function EditSubscription() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");

  const [amount, setAmount] = useState("");

  const [category, setCategory] = useState("Entertainment");

  const [billingCycle, setBillingCycle] = useState("monthly");

  const [paymentMethod, setPaymentMethod] = useState("");

  const [notes, setNotes] = useState("");

  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");

  const [autoRenew, setAutoRenew] = useState(true);

  const fetchSubscription = async () => {
    try {
      const data = await getSubscriptionById(id);

      setName(data.name);

      setAmount(String(data.amount));

      setCategory(data.category);

      setBillingCycle(data.billingCycle);

      setPaymentMethod(data.paymentMethod || "");

      setNotes(data.notes || "");

      setReminderDaysBefore(String(data.reminderDaysBefore));

      setAutoRenew(data.autoRenew);
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const updateHandler = async () => {
    try {
      setSaving(true);

      await updateSubscription(id, {
        name,

        amount: Number(amount),

        category,

        billingCycle,

        paymentMethod,

        notes,

        reminderDaysBefore: Number(reminderDaysBefore),

        autoRenew,
      });

      Alert.alert("Success", "Subscription updated successfully");

      router.replace({
        pathname: "/(drawer)/(tabs)/subscriptions/[id]",

        params: {
          id,
        },
      });
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to update subscription");
    } finally {
      setSaving(false);
    }
  };

  const deleteHandler = () => {
    Alert.alert(
      "Delete Subscription",
      "Are you sure you want to delete this subscription?",
      [
        {
          text: "Cancel",

          style: "cancel",
        },

        {
          text: "Delete",

          style: "destructive",

          onPress: async () => {
            try {
              await deleteSubscription(id);

              router.replace("/(drawer)/(tabs)/subscriptions");
            } catch (error) {
              console.log(error);

              Alert.alert("Error", "Failed to delete subscription");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-100">
        <ActivityIndicator size="large" color="#4F46E5" />

        <Text className="text-zinc-500 mt-4 font-medium">
          Loading subscription...
        </Text>
      </View>
    );
  }

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
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/subscriptions")}
              className="bg-white border border-zinc-200 w-12 h-12 rounded-2xl items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#18181b" />
            </TouchableOpacity>

            <Text className="text-zinc-900 text-3xl font-black">
              Edit Subscription
            </Text>

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
              value={name}
              onChangeText={setName}
              placeholder="Netflix"
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* AMOUNT */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Amount</Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="499"
              placeholderTextColor="#71717a"
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

          {/* BILLING */}

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

          {/* PAYMENT */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Payment Method</Text>

            <TextInput
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="Credit Card"
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* REMINDER */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">
              Reminder Days Before
            </Text>

            <TextInput
              value={reminderDaysBefore}
              onChangeText={setReminderDaysBefore}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor="#71717a"
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
                Automatically renew subscription
              </Text>
            </View>

            <Switch value={autoRenew} onValueChange={setAutoRenew} />
          </View>

          {/* NOTES */}

          <View className="mb-8">
            <Text className="text-zinc-700 font-bold mb-3">Notes</Text>

            <TextInput
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details..."
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 h-32"
            />
          </View>

          {/* UPDATE */}

          <TouchableOpacity
            onPress={updateHandler}
            disabled={saving}
            className="bg-indigo-600 rounded-2xl py-5 items-center mb-4"
          >
            <Text className="text-white font-black text-lg">
              {saving ? "Saving..." : "Update Subscription"}
            </Text>
          </TouchableOpacity>

          {/* DELETE */}

          <TouchableOpacity
            onPress={deleteHandler}
            className="bg-red-500 rounded-2xl py-5 items-center"
          >
            <Text className="text-white font-black text-lg">
              Delete Subscription
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
