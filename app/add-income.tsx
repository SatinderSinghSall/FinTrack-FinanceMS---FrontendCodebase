import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
  Modal,
  TouchableOpacity,
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
  const [showValidationModal, setShowValidationModal] = useState(false);

  const [errors, setErrors] = useState({
    source: "",
    amount: "",
  });

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const validateForm = () => {
    const newErrors = {
      source: "",
      amount: "",
    };

    let valid = true;

    if (!source.trim()) {
      newErrors.source = "Income source is required.";
      valid = false;
    }

    if (!amount.trim()) {
      newErrors.amount = "Amount is required.";
      valid = false;
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid amount.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      const message = "Please fill in all required fields.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: message,
        position: "top",
      });

      setShowValidationModal(true);
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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

      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-5">
          <View
            className="w-full bg-white rounded-[40px] overflow-hidden"
            style={{
              maxWidth: 430,
            }}
          >
            {/* Decorative Background */}

            <View className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-red-50" />

            <View className="absolute -bottom-20 -left-16 w-44 h-44 rounded-full bg-orange-50" />

            {/* Header */}

            <View className="items-center px-7 pt-8">
              <View
                className="items-center justify-center"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: "#FEE2E2",
                }}
              >
                <View
                  className="items-center justify-center bg-white"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                  }}
                >
                  <Ionicons name="warning" size={36} color="#EF4444" />
                </View>
              </View>

              <Text className="text-zinc-900 text-[30px] font-black mt-6">
                Validation Error
              </Text>

              <Text className="text-zinc-500 text-center leading-6 mt-3 text-[15px] px-4">
                Please complete all required fields before adding your income.
              </Text>
            </View>

            {/* Divider */}

            <View className="h-px bg-zinc-100 mx-7 mt-7" />

            {/* Errors */}

            <View className="px-7 pt-6">
              {errors.source !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4 mb-3">
                  <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 flex-1 text-red-700 font-semibold text-[15px]">
                    {errors.source}
                  </Text>
                </View>
              )}

              {errors.amount !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                  <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 flex-1 text-red-700 font-semibold text-[15px]">
                    {errors.amount}
                  </Text>
                </View>
              )}
            </View>

            {/* Buttons */}

            <View className="px-7 pt-8 pb-7">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowValidationModal(false)}
                className="bg-emerald-600 rounded-2xl py-5 items-center"
              >
                <Text className="text-white text-lg font-black">Got it</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowValidationModal(false)}
                className="items-center mt-5"
              >
                <Text className="text-zinc-400 font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                  onChangeText={(text) => {
                    setSource(text);

                    setErrors((prev) => ({
                      ...prev,
                      source: "",
                    }));
                  }}
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-4">
                <Input
                  label="Amount (₹)"
                  placeholder="10000"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);

                    setErrors((prev) => ({
                      ...prev,
                      amount: "",
                    }));
                  }}
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
