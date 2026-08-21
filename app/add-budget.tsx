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
import api from "../src/services/api";
import Toast from "react-native-toast-message";

export default function AddBudgetScreen() {
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const [errors, setErrors] = useState({
    category: "",
    limit: "",
  });

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const validateForm = () => {
    const newErrors = {
      category: "",
      limit: "",
    };

    let valid = true;

    if (!category.trim()) {
      newErrors.category = "Budget category is required.";
      valid = false;
    }

    if (!limit.trim()) {
      newErrors.limit = "Monthly budget limit is required.";
      valid = false;
    } else if (isNaN(Number(limit)) || Number(limit) <= 0) {
      newErrors.limit = "Enter a valid monthly budget.";
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
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* TOP HEADER */}
      <View className="flex-row items-center justify-between px-6 py-3.5 bg-white border-b border-slate-100 shadow-sm">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center active:bg-slate-200"
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>

        <Text className="text-base font-bold text-slate-900 tracking-tight">
          Add Budget
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* VALIDATION MODAL (Strictly preserved from your original budget modal) */}
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
                Please complete all required fields before creating your budget.
              </Text>
            </View>

            <View className="h-px bg-zinc-100 mx-7 mt-7" />

            <View className="px-7 pt-6">
              {errors.category !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4 mb-3">
                  <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 flex-1 text-red-700 font-semibold text-[15px]">
                    {errors.category}
                  </Text>
                </View>
              )}

              {errors.limit !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-4">
                  <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </View>

                  <Text className="ml-3 flex-1 text-red-700 font-semibold text-[15px]">
                    {errors.limit}
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
            paddingTop: 24,
            paddingBottom: 40,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isLargeScreen ? 450 : "100%",
              alignSelf: "center",
            }}
          >
            {/* Header info */}
            <View className="mb-6">
              <Text
                className="font-black text-slate-900 tracking-tight"
                style={{ fontSize: isLargeScreen ? 34 : 28 }}
              >
                Add Budget
              </Text>
              <Text className="text-slate-500 font-medium text-sm mt-0.5">
                Set a monthly spending limit for a category
              </Text>
            </View>

            {/* Form Card */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              {/* Top Error Banner */}
              {error && (
                <View className="flex-row items-center bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 shadow-sm">
                  <View className="w-8 h-8 rounded-xl bg-red-100 items-center justify-center mr-3">
                    <Ionicons name="alert" size={16} color="#dc2626" />
                  </View>
                  <Text className="text-red-700 font-bold text-xs flex-1 leading-relaxed">
                    {error}
                  </Text>
                </View>
              )}

              {/* Category Field */}
              <View className="mb-5">
                <Input
                  label="Category"
                  placeholder="Food, Rent, Travel..."
                  value={category}
                  onChangeText={(text) => {
                    setCategory(text);
                    if (error) setError(null);
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                />
                {errors.category !== "" && (
                  <View className="flex-row items-center bg-red-50/80 border border-red-100 rounded-xl px-3 py-2 mt-2">
                    <Ionicons name="alert-circle" size={14} color="#dc2626" />
                    <Text className="text-red-700 text-xs font-bold ml-2 flex-1">
                      {errors.category}
                    </Text>
                  </View>
                )}
              </View>

              {/* Limit Field */}
              <View className="mb-6">
                <Input
                  label="Monthly Limit (₹)"
                  placeholder="5000"
                  keyboardType="numeric"
                  value={limit}
                  onChangeText={(text) => {
                    setLimit(text);
                    if (error) setError(null);
                    setErrors((prev) => ({ ...prev, limit: "" }));
                  }}
                />
                {errors.limit !== "" && (
                  <View className="flex-row items-center bg-red-50/80 border border-red-100 rounded-xl px-3 py-2 mt-2">
                    <Ionicons name="alert-circle" size={14} color="#dc2626" />
                    <Text className="text-red-700 text-xs font-bold ml-2 flex-1">
                      {errors.limit}
                    </Text>
                  </View>
                )}
              </View>

              {/* Submit Button with Loading State */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
                  loading
                    ? "bg-slate-700 opacity-90"
                    : "bg-slate-900 active:bg-slate-800"
                }`}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-bold text-base ml-2.5">
                      Creating Budget...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text className="text-white font-bold text-base ml-2">
                      Save Budget
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Helper Tip */}
            <View className="flex-row items-center bg-slate-100/70 border border-slate-200/60 rounded-2xl p-4 mt-5">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#64748b"
              />
              <Text className="text-slate-600 font-medium text-xs ml-2.5 flex-1 leading-relaxed">
                Tip: Setting budgets helps you track and control your monthly
                spending.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FULLSCREEN LOADING OVERLAY */}
      {loading && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center">
          <View className="bg-white px-6 py-5 rounded-3xl items-center shadow-2xl">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-slate-800 font-bold text-sm mt-3">
              Creating budget...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
