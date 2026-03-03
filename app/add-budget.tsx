import { View, Text } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Input from "../src/components/Input";
import Button from "../src/components/Button";
import api from "../src/services/api";

export default function AddBudgetScreen() {
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!category || !limit) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/budgets", {
        category,
        limit: Number(limit),
      });

      router.back(); // ✅ go back to budgets
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-6 pt-12">
      <Text className="text-3xl font-bold mb-2">Add Budget</Text>
      <Text className="text-gray-500 mb-6">Set a monthly spending limit</Text>

      {error && <Text className="text-red-500 mb-4">{error}</Text>}

      <Input
        label="Category"
        placeholder="Food, Rent, Travel..."
        value={category}
        onChangeText={setCategory}
      />

      <Input
        label="Monthly Limit (₹)"
        placeholder="5000"
        keyboardType="numeric"
        value={limit}
        onChangeText={setLimit}
      />

      <Button title="Save Budget" onPress={handleSubmit} loading={loading} />
    </View>
  );
}
