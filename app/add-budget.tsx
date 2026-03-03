import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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

      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add budget");
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
              Add Budget
            </Text>
            <Text className="text-gray-500 mb-6">
              Set a monthly spending limit
            </Text>

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

            <Button
              title="Save Budget"
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
