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

export default function EditBudgetScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-gray-500">Loading budget...</Text>
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
              Edit Budget
            </Text>
            <Text className="text-gray-500 mb-6">
              Update your spending limit
            </Text>

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

            <Button
              title="Update Budget"
              onPress={handleUpdate}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
