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

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  /* ---------------- FETCH BUDGET ---------------- */

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await api.get("/budgets");

        const budget = res.data.find(
          (b: any) => String(b._id || b.id) === String(id),
        );

        if (budget) {
          setCategory(budget.category);
          setLimit(String(budget.limit));
        } else {
          setError("Budget not found");
        }
      } catch {
        setError("Failed to load budget.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchBudget();
  }, [id]);

  /* ---------------- UPDATE ---------------- */

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

  /* ---------------- INITIAL LOADING ---------------- */

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-3">Loading budget...</Text>
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
                  Edit Budget
                </Text>
              </View>

              <Text className="text-gray-500">
                Update your monthly spending limit
              </Text>
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

              {/* CATEGORY */}

              <View className="mb-5">
                <Input
                  label="Category"
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Food, Rent, Travel"
                />
              </View>

              {/* LIMIT */}

              <View className="mb-6">
                <Input
                  label="Monthly Limit (₹)"
                  keyboardType="numeric"
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="5000"
                />
              </View>

              {/* UPDATE BUTTON */}

              <Button
                title="Update Budget"
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
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-600 mt-2">Updating budget...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
