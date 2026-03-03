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
        setError("Failed to load expense");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchExpense();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !amount || !category) {
      setError("All fields are required");
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
      setError(err.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-500">Loading expense...</Text>
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
          {/* Width constraint */}
          <View
            style={{
              width: "100%",
              maxWidth: isLargeScreen ? 420 : "100%",
              alignSelf: "center",
            }}
          >
            {/* Header */}
            <Text
              className="font-bold mb-2"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Edit Expense
            </Text>
            <Text className="text-gray-500 mb-6">Update your expense</Text>

            {error && <Text className="text-red-500 mb-4">{error}</Text>}

            <Input label="Title" value={title} onChangeText={setTitle} />

            <Input
              label="Amount (₹)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Input
              label="Category"
              value={category}
              onChangeText={setCategory}
            />

            <Button
              title="Update Expense"
              onPress={handleUpdate}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
