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
import Toast from "react-native-toast-message";

export default function EditSavingScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [goal, setGoal] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  /* FETCH SAVING */

  useEffect(() => {
    const fetchSaving = async () => {
      try {
        const res = await api.get("/savings");

        const saving = res.data.find(
          (s: any) => String(s._id || s.id) === String(id),
        );

        if (saving) {
          setGoal(saving.goal);
          setAmount(String(saving.amount));
        } else {
          setError("Saving not found");
        }
      } catch {
        setError("Failed to load saving.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchSaving();
  }, [id]);

  /* UPDATE */

  const handleUpdate = async () => {
    if (!goal || !amount) {
      setError("Please fill all fields before updating.");

      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill all fields before updating.",
        position: "top",
      });

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.put(`/savings/${id}`, {
        goal,
        amount: Number(amount),
      });

      Toast.show({
        type: "success",
        text1: "Saving updated",
        text2: `${goal} saving updated successfully`,
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update saving.";

      setError(message);

      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  /* INITIAL LOADING */

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-emerald-50 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />

        <Text className="text-emerald-700 mt-3">Loading saving...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
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
                  <Ionicons name="arrow-back" size={22} color="#065f46" />
                </Pressable>

                <Text
                  className="font-bold text-emerald-900"
                  style={{
                    fontSize: isTablet ? 34 : 28,
                  }}
                >
                  Edit Saving
                </Text>
              </View>

              <Text className="text-emerald-700">Update your saving goal</Text>
            </View>

            {/* FORM */}

            <View className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
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

              {/* GOAL */}

              <View className="mb-5">
                <Input
                  label="Saving Goal"
                  value={goal}
                  onChangeText={setGoal}
                  placeholder="Emergency Fund"
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-6">
                <Input
                  label="Target Amount (₹)"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="10000"
                />
              </View>

              <Button
                title="Update Saving"
                onPress={handleUpdate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* LOADING OVERLAY */}

      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-5 rounded-xl items-center shadow-md">
            <ActivityIndicator size="large" color="#10b981" />

            <Text className="text-emerald-700 mt-2">Updating saving...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
