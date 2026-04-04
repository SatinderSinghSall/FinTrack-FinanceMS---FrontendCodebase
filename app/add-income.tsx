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
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Input from "../src/components/Input";
import Button from "../src/components/Button";
import api from "../src/services/api";
import Toast from "react-native-toast-message";

export default function AddIncomeScreen() {
  const router = useRouter();

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const handleSubmit = async () => {
    if (!source || !amount) {
      const message = "Please fill in all required fields.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: message,
        position: "top",
      });

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/income", {
        source,
        amount: Number(amount),
        note,
      });

      Toast.show({
        type: "success",
        text1: "Income added",
        text2: `${source} added successfully`,
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to add income.";

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
      {/* 🔝 TOP HEADER */}
      <View className="flex-row items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        {/* Back Button (modern container) */}
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        {/* Title */}
        <Text className="text-base font-semibold text-gray-900 tracking-tight">
          Add your Income
        </Text>

        {/* Right Action (future ready) */}
        <Pressable className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="options-outline" size={20} color="#111827" />
        </Pressable>
      </View>

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
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isLargeScreen ? 420 : "100%",
              alignSelf: "center",
            }}
          >
            {/* HEADER */}

            <Text
              className="font-bold mb-2"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Add Income
            </Text>

            <Text className="text-gray-500 mb-6">Record money you earned</Text>

            {/* FORM */}

            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {/* ERROR */}

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

              {/* SOURCE */}

              <View className="mb-4">
                <Input
                  label="Source"
                  placeholder="Salary, Freelance..."
                  value={source}
                  onChangeText={setSource}
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-4">
                <Input
                  label="Amount (₹)"
                  placeholder="10000"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* NOTE */}

              <View className="mb-5">
                <Input
                  label="Note (Optional)"
                  placeholder="Bonus, extra work..."
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              {/* BUTTON */}

              <Button
                title="Add Income"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>

            {/* TIP */}

            <View className="flex-row items-start mt-5">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#6b7280"
              />

              <Text className="text-gray-500 text-xs ml-2 flex-1">
                Tip: Track all income sources to understand your total earnings.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* LOADING OVERLAY */}

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-5 rounded-xl items-center shadow-md">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-600 mt-2">Creating Income...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
