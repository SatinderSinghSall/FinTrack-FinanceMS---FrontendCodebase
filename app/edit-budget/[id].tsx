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

        console.log("Route ID:", id);
        console.log("Budgets:", res.data);

        const budget = res.data.find(
          (b: any) => String(b._id || b.id) === String(id),
        );

        if (budget) {
          setCategory(budget.category);
          setLimit(String(budget.limit));
        } else {
          setError("Budget not found");
        }
      } catch (err) {
        setError("Failed to load budget.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchBudget();
  }, [id]);

  const handleUpdate = async () => {
    if (!category || !limit) {
      setError("Please fill all fields before updating.");
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
      setError(err.response?.data?.message || "Failed to update budget.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Ionicons name="hourglass-outline" size={30} color="#9ca3af" />
        <Text className="text-gray-500 mt-2">Loading budget...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 pt-2">
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

            {/* Form Card */}

            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Error Alert */}

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

              {/* Category */}

              <View className="mb-4">
                <Input
                  label="Category"
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Food, Rent, Travel"
                />
              </View>

              {/* Limit */}

              <View className="mb-5">
                <Input
                  label="Monthly Limit (₹)"
                  keyboardType="numeric"
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="5000"
                />
              </View>

              {/* Button */}

              <Button
                title="Update Budget"
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
