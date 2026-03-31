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

export default function EditIncomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  /* ---------------- FETCH INCOME ---------------- */

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await api.get("/income");

        const income = res.data.data.find(
          (i: any) => String(i._id) === String(id),
        );

        if (income) {
          setSource(income.source);
          setAmount(String(income.amount));
          setNote(income.note || "");
        } else {
          setError("Income not found");
        }
      } catch {
        setError("Failed to load income.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchIncome();
  }, [id]);

  /* ---------------- UPDATE ---------------- */

  const handleUpdate = async () => {
    if (!source || !amount) {
      const message = "Please fill all required fields.";

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
      await api.put(`/income/${id}`, {
        source,
        amount: Number(amount),
        note,
      });

      Toast.show({
        type: "success",
        text1: "Income updated",
        text2: `${source} updated successfully`,
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update income.";

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

  /* ---------------- INITIAL LOADING ---------------- */

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-500 mt-3">Loading income...</Text>
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
                  Edit Income
                </Text>
              </View>

              <Text className="text-gray-500">Update your income details</Text>
            </View>

            {/* FORM */}

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

              {/* SOURCE */}

              <View className="mb-5">
                <Input
                  label="Source"
                  value={source}
                  onChangeText={setSource}
                  placeholder="Salary, Freelance"
                />
              </View>

              {/* AMOUNT */}

              <View className="mb-5">
                <Input
                  label="Amount (₹)"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="10000"
                />
              </View>

              {/* NOTE */}

              <View className="mb-6">
                <Input
                  label="Note"
                  value={note}
                  onChangeText={setNote}
                  placeholder="Bonus, extra work..."
                />
              </View>

              {/* BUTTON */}

              <Button
                title="Update Income"
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
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-600 mt-2">Updating income...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
