import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";

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

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  /* ---------------- FETCH EXPENSE ---------------- */

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await api.get("/expenses");

        const expense = res.data.find((e: any) => String(e._id) === String(id));

        if (expense) {
          setTitle(expense.title);
          setAmount(String(expense.amount));
          setCategory(expense.category);
        } else {
          setError("Expense not found");
        }
      } catch {
        setError("Failed to load expense.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchExpense();
  }, [id]);

  /* ---------------- UPDATE ---------------- */

  const handleUpdate = async () => {
    if (!title || !amount || !category) {
      const message = "Please fill all fields before updating.";
      setError(message);

      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: message,
        position: "top",
      });

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

      Toast.show({
        type: "success",
        text1: "Expense updated",
        text2: `${title} updated successfully`,
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to update expense.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INITIAL LOADING ---------------- */

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="text-gray-500 mt-3">Loading expense...</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isDesktop ? 500 : isTablet ? 420 : "100%",
              alignSelf: "center",
            }}
          >
            {/* HEADER */}

            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Pressable onPress={() => router.back()} className="mr-3">
                  <Ionicons name="arrow-back" size={22} color="#111" />
                </Pressable>

                <Text
                  className="font-bold"
                  style={{ fontSize: isTablet ? 34 : 28 }}
                >
                  Edit Expense
                </Text>
              </View>

              <Text className="text-gray-500">Update your expense details</Text>
            </View>

            {/* FORM CARD */}

            <View className="bg-white rounded-2xl p-6 shadow-sm">
              {/* ERROR */}

              {error && (
                <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
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

              {/* TITLE */}

              <View className="mb-5">
                <Input
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Coffee, Uber, Groceries"
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-5">
                <Input
                  label="Amount (₹)"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="500"
                />
              </View>

              {/* CATEGORY */}

              <View className="mb-6">
                <Input
                  label="Category"
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Food, Transport, Shopping"
                />
              </View>

              {/* UPDATE BUTTON */}

              <Button
                title="Update Expense"
                onPress={handleUpdate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FULLSCREEN LOADING OVERLAY */}

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-5 rounded-xl items-center shadow-md">
            <ActivityIndicator size="large" color="#ef4444" />
            <Text className="text-gray-600 mt-2">Updating expense...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
