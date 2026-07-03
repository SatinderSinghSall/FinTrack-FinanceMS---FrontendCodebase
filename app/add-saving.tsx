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

export default function AddSavingScreen() {
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showValidationModal, setShowValidationModal] = useState(false);

  const [errors, setErrors] = useState({
    goal: "",
    amount: "",
  });

  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 768;

  const validateForm = () => {
    const newErrors = {
      goal: "",
      amount: "",
    };

    let valid = true;

    if (!goal.trim()) {
      newErrors.goal = "Saving goal is required.";
      valid = false;
    }

    if (!amount.trim()) {
      newErrors.amount = "Target amount is required.";
      valid = false;
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid target amount.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      const message = "Please complete all required fields before saving.";

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
            <View className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-red-50" />
            <View className="absolute -bottom-20 -left-16 w-44 h-44 rounded-full bg-orange-50" />

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
                  className="bg-white items-center justify-center"
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
                Please complete all required fields before creating your saving
                goal.
              </Text>
            </View>

            <View className="h-px bg-zinc-100 mx-7 mt-7" />

            <View className="px-7 pt-6">
              {errors.goal !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4 mb-3">
                  <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 flex-1 text-red-700 font-semibold text-[15px]">
                    {errors.goal}
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

            <View className="px-7 pt-8 pb-7">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowValidationModal(false)}
                className="bg-indigo-600 rounded-2xl py-5 items-center"
              >
                <Text className="text-white text-lg font-black">Got it</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowValidationModal(false)}
                className="items-center mt-5"
              >
                <Text className="text-zinc-400 font-semibold text-base">
                  ✕ Close
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
          scrollEnabled={!showValidationModal}
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
                  onChangeText={(text) => {
                    setGoal(text);

                    if (error) setError(null);

                    setErrors((prev) => ({
                      ...prev,
                      goal: "",
                    }));
                  }}
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-5">
                <Input
                  label="Target Amount (₹)"
                  placeholder="10000"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);

                    if (error) setError(null);

                    setErrors((prev) => ({
                      ...prev,
                      amount: "",
                    }));
                  }}
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
