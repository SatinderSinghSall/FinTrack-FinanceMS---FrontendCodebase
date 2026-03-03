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

export default function AddExpenseScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

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

      router.back();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add expense");
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
              Add Expense
            </Text>
            <Text className="text-gray-500 mb-6">
              Log where your money went
            </Text>

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

            <Button
              title="Add Expense"
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
