import { View, Text } from "react-native";
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
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500">Loading expense...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-6 pt-12">
      <Text className="text-3xl font-bold mb-2">Edit Expense</Text>
      <Text className="text-gray-500 mb-6">Update your expense</Text>

      {error && <Text className="text-red-500 mb-4">{error}</Text>}

      <Input label="Title" value={title} onChangeText={setTitle} />
      <Input
        label="Amount (₹)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Input label="Category" value={category} onChangeText={setCategory} />

      <Button title="Update Expense" onPress={handleUpdate} loading={loading} />
    </View>
  );
}
