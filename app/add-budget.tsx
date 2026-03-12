import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Input from "../src/components/Input";
import Button from "../src/components/Button";
import api from "../src/services/api";
import Toast from "react-native-toast-message";

export default function AddBudgetScreen() {
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const handleSubmit = async () => {
    if (!category || !limit) {
      setError("Please fill in all fields before saving.");

      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill in all fields before saving.",
        position: "top",
      });

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/budgets", {
        category,
        limit: Number(limit),
      });

      Toast.show({
        type: "success",
        text1: "Budget created",
        text2: `${category} budget added successfully`,
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to add budget.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

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
            {/* Header */}

            <Text
              className="font-bold mb-2"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Add Budget
            </Text>

            <Text className="text-gray-500 mb-6">
              Set a monthly spending limit for a category
            </Text>

            {/* Form Card */}

            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Error Message */}

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

              {/* Category Input */}

              <View className="mb-4">
                <Input
                  label="Category"
                  placeholder="Food, Rent, Travel..."
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              {/* Limit Input */}

              <View className="mb-5">
                <Input
                  label="Monthly Limit (₹)"
                  placeholder="5000"
                  keyboardType="numeric"
                  value={limit}
                  onChangeText={setLimit}
                />
              </View>

              {/* Save Button */}

              <Button
                title="Save Budget"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>

            {/* Helper Tip */}

            <View className="flex-row items-start mt-5">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#6b7280"
              />

              <Text className="text-gray-500 text-xs ml-2 flex-1">
                Tip: Setting budgets helps you track and control your monthly
                spending.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FULLSCREEN LOADING OVERLAY */}

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-5 rounded-xl items-center shadow-md">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-600 mt-2">Creating budget...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
