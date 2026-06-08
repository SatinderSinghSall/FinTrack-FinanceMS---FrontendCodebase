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

export default function AddSavingScreen() {
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 768;

  const handleSubmit = async () => {
    if (!goal || !amount) {
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
      await api.post("/savings", {
        goal,
        amount: Number(amount),
      });

      Toast.show({
        type: "success",
        text1: "Saving created",
        text2: `${goal} saving added successfully`,
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to add saving.";

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
    <SafeAreaView className="flex-1 bg-emerald-50">
      {/* TOP HEADER */}

      <View className="flex-row items-center justify-between px-6 py-3 bg-white border-b border-emerald-100">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#065f46" />
        </Pressable>

        <Text className="text-base font-semibold text-emerald-900 tracking-tight">
          Add your Saving
        </Text>

        <Pressable className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center">
          <Ionicons name="wallet-outline" size={20} color="#065f46" />
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
            {/* HEADER */}

            <Text
              className="font-bold mb-2 text-emerald-900"
              style={{ fontSize: isLargeScreen ? 34 : 28 }}
            >
              Add Saving
            </Text>

            <Text className="text-emerald-700 mb-6">
              Set your saving goal and target amount
            </Text>

            {/* FORM CARD */}

            <View className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
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

              {/* GOAL */}

              <View className="mb-4">
                <Input
                  label="Saving Goal"
                  placeholder="Emergency Fund, Car..."
                  value={goal}
                  onChangeText={setGoal}
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-5">
                <Input
                  label="Target Amount (₹)"
                  placeholder="10000"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <Button
                title="Save Saving"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>

            {/* TIP */}

            <View className="flex-row items-start mt-5">
              <Ionicons name="leaf-outline" size={18} color="#047857" />

              <Text className="text-emerald-700 text-xs ml-2 flex-1">
                Tip: Small consistent savings can create long-term financial
                stability.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* LOADING */}

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-5 rounded-xl items-center shadow-md">
            <ActivityIndicator size="large" color="#10b981" />

            <Text className="text-emerald-700 mt-2">Creating saving...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
