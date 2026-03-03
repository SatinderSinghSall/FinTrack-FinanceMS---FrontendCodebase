import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import api from "../../src/services/api";

export default function EditBudgetScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await api.get("/budgets");
        const budget = res.data.find((b: any) => b._id === id);

        if (budget) {
          setCategory(budget.category);
          setLimit(String(budget.limit));
        }
      } catch {
        setError("Failed to load budget");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchBudget();
  }, [id]);

  const handleUpdate = async () => {
    if (!category || !limit) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.put(`/budgets/${id}`, {
        category,
        limit: Number(limit),
      });

      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500">Loading budget...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-6 pt-12">
      <Text className="text-3xl font-bold mb-2">Edit Budget</Text>
      <Text className="text-gray-500 mb-6">Update your spending limit</Text>

      {error && <Text className="text-red-500 mb-4">{error}</Text>}

      <Input
        label="Category"
        value={category}
        onChangeText={setCategory}
        placeholder="Food, Rent, Travel"
      />

      <Input
        label="Monthly Limit (₹)"
        keyboardType="numeric"
        value={limit}
        onChangeText={setLimit}
        placeholder="5000"
      />

      <Button title="Update Budget" onPress={handleUpdate} loading={loading} />
    </View>
  );
}
