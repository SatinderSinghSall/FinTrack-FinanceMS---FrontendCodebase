import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import api from "../../src/services/api";

export default function EditExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await api.get("/expenses");
        const expense = res.data.find((e: any) => e._id === id);

        if (expense) {
          setTitle(expense.title);
          setAmount(String(expense.amount));
          setCategory(expense.category);
        }
      } catch {
        setError("Failed to load expense.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchExpense();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !amount || !category) {
      setError("Please fill all fields before updating.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.put(`/expenses/${id}`, {
        title,
        amount: Number(amount),
        category,
      });

      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Ionicons name="hourglass-outline" size={28} color="#9ca3af" />
        <Text className="text-gray-500 mt-2">Loading expense...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 32,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isLargeScreen ? 420 : "100%",
              alignSelf: "center",
            }}
          >
            <Text
              className="font-bold mb-2"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Edit Expense
            </Text>

            <Text className="text-gray-500 mb-6">
              Update your expense details
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {error && (
                <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#dc2626"
                  />
                  <Text className="text-red-600 ml-2 text-sm flex-1">
                    {error}
                  </Text>
                </View>
              )}

              <View className="mb-4">
                <Input label="Title" value={title} onChangeText={setTitle} />
              </View>

              <View className="mb-4">
                <Input
                  label="Amount (₹)"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <View className="mb-5">
                <Input
                  label="Category"
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <Button
                title="Update Expense"
                onPress={handleUpdate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
