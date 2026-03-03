import { View, Text } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Input from "../src/components/Input";
import Button from "../src/components/Button";
import api from "../src/services/api";

export default function AddExpenseScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !amount || !category) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/expenses", {
        title,
        amount: Number(amount),
        category,
      });

      router.back(); // ✅ return to expenses
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-6 pt-12">
      <Text className="text-3xl font-bold mb-2">Add Expense</Text>
      <Text className="text-gray-500 mb-6">Log where your money went</Text>

      {error && <Text className="text-red-500 mb-4">{error}</Text>}

      <Input
        label="Title"
        placeholder="Groceries, Uber..."
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Amount (₹)"
        placeholder="450"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Input
        label="Category"
        placeholder="Food, Travel..."
        value={category}
        onChangeText={setCategory}
      />

      <Button title="Add Expense" onPress={handleSubmit} loading={loading} />
    </View>
  );
}
