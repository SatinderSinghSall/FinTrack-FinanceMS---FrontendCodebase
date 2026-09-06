import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "@/src/services/subscriptionApi";

const categories = [
  "Entertainment",
  "Productivity",
  "Finance",
  "Health",
  "Cloud",
  "Education",
];

const billingCycles = ["weekly", "monthly", "quarterly", "yearly"];

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Entertainment: "play-circle-outline",
  Productivity: "briefcase-outline",
  Finance: "wallet-outline",
  Health: "heart-outline",
  Cloud: "cloud-outline",
  Education: "school-outline",
};

const billingIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  weekly: "calendar-outline",
  monthly: "calendar",
  quarterly: "albums-outline",
  yearly: "calendar-number-outline",
};

export default function EditSubscription() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showValidationModal, setShowValidationModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [autoRenew, setAutoRenew] = useState(true);

  const [errors, setErrors] = useState({
    name: "",
    amount: "",
    paymentMethod: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    amount: "",
    category: "",
    billingCycle: "",
    paymentMethod: "",
    notes: "",
    reminderDaysBefore: "",
    autoRenew: true,
  });

  const fetchSubscription = async () => {
    try {
      setLoading(true);

      const data = await getSubscriptionById(id);

      setName(data.name);
      setAmount(String(data.amount));
      setCategory(data.category);
      setBillingCycle(data.billingCycle);
      setPaymentMethod(data.paymentMethod || "");
      setNotes(data.notes || "");
      setReminderDaysBefore(String(data.reminderDaysBefore));
      setAutoRenew(data.autoRenew);

      setOriginalData({
        name: data.name,
        amount: String(data.amount),
        category: data.category,
        billingCycle: data.billingCycle,
        paymentMethod: data.paymentMethod || "",
        notes: data.notes || "",
        reminderDaysBefore: String(data.reminderDaysBefore),
        autoRenew: data.autoRenew,
      });
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const hasChanges =
    name !== originalData.name ||
    amount !== originalData.amount ||
    category !== originalData.category ||
    billingCycle !== originalData.billingCycle ||
    paymentMethod !== originalData.paymentMethod ||
    notes !== originalData.notes ||
    reminderDaysBefore !== originalData.reminderDaysBefore ||
    autoRenew !== originalData.autoRenew;

  const validateForm = () => {
    const newErrors = {
      name: "",
      amount: "",
      paymentMethod: "",
    };

    let valid = true;

    if (!name.trim()) {
      newErrors.name = "Subscription name is required.";
      valid = false;
    }

    if (!amount.trim()) {
      newErrors.amount = "Amount is required.";
      valid = false;
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid amount.";
      valid = false;
    }

    if (!paymentMethod.trim()) {
      newErrors.paymentMethod = "Payment method is required.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      setShowValidationModal(true);
    }

    return valid;
  };

  const updateHandler = async () => {
    if (saving || deleting) return;

    if (!validateForm()) return;

    if (!hasChanges) {
      setErrorMessage("No changes were made to this subscription.");
      setShowErrorModal(true);
      return;
    }

    try {
      setSaving(true);

      await updateSubscription(id, {
        name,
        amount: Number(amount),
        category,
        billingCycle,
        paymentMethod,
        notes,
        reminderDaysBefore: Number(reminderDaysBefore),
        autoRenew,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.log(error);

      setErrorMessage("Failed to update subscription.");

      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);

    router.replace({
      pathname: "/(drawer)/(tabs)/subscriptions/[id]",
      params: {
        id,
      },
    });
  };

  const confirmDelete = async () => {
    if (deleting || saving) return;

    try {
      setDeleting(true);

      await deleteSubscription(id);

      setShowDeleteModal(false);

      router.replace("/(drawer)/(tabs)/subscriptions");
    } catch (error) {
      console.log(error);

      setShowDeleteModal(false);

      setErrorMessage("Failed to delete subscription.");

      setShowErrorModal(true);
    } finally {
      setDeleting(false);
    }
  };

  const discardChanges = () => {
    setShowDiscardModal(false);

    router.replace({
      pathname: "/(drawer)/(tabs)/subscriptions",
    });
  };

  const handleBack = () => {
    if (saving || deleting) return;

    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      router.replace({
        pathname: "/(drawer)/(tabs)/subscriptions",
      });
    }
  };

  const formattedAmount = useMemo(() => {
    if (!amount) return "0";

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return amount;
    }

    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }, [amount]);

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-100">
        <View className="flex-1 px-5">
          {/* Header skeleton */}
          <View className="flex-row items-center justify-between pt-3">
            <View className="w-12 h-12 rounded-2xl bg-white border border-zinc-200" />

            <View className="items-center">
              <View className="w-20 h-3 rounded-full bg-zinc-200" />
              <View className="w-36 h-6 rounded-full bg-zinc-200 mt-2" />
            </View>

            <View className="w-12 h-12 rounded-2xl bg-white border border-zinc-200" />
          </View>

          {/* Loading hero */}
          <View className="bg-indigo-600 rounded-[36px] mt-6 px-6 py-8 items-center">
            <View className="w-20 h-20 rounded-[25px] bg-white/10 items-center justify-center">
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>

            <View className="w-48 h-6 rounded-full bg-white/10 mt-5" />

            <View className="w-28 h-4 rounded-full bg-white/10 mt-3" />

            <View className="w-40 h-10 rounded-2xl bg-white/10 mt-6" />
          </View>

          {/* Skeleton sections */}
          <View className="mt-6">
            <View className="w-32 h-5 bg-zinc-200 rounded-full" />
            <View className="h-16 bg-white rounded-2xl border border-zinc-200 mt-4" />
            <View className="h-16 bg-white rounded-2xl border border-zinc-200 mt-3" />
            <View className="h-32 bg-white rounded-2xl border border-zinc-200 mt-3" />
          </View>

          <Text className="text-zinc-500 text-center mt-5 font-medium">
            Loading subscription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-zinc-100">
      {/* =====================================================
          VALIDATION MODAL
      ====================================================== */}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7">
            <View className="items-center">
              <View className="w-20 h-20 rounded-[26px] bg-red-50 items-center justify-center">
                <Ionicons name="warning" size={40} color="#EF4444" />
              </View>

              <Text className="text-3xl font-black text-zinc-900 mt-5">
                Validation Error
              </Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6">
                Please fix the highlighted fields before updating.
              </Text>
            </View>

            <View className="mt-7">
              {errors.name !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-2">
                  <Ionicons name="close-circle" size={18} color="#EF4444" />

                  <Text className="text-red-600 ml-2 flex-1 font-semibold">
                    {errors.name}
                  </Text>
                </View>
              )}

              {errors.amount !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-2">
                  <Ionicons name="close-circle" size={18} color="#EF4444" />

                  <Text className="text-red-600 ml-2 flex-1 font-semibold">
                    {errors.amount}
                  </Text>
                </View>
              )}

              {errors.paymentMethod !== "" && (
                <View className="flex-row items-center bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <Ionicons name="close-circle" size={18} color="#EF4444" />

                  <Text className="text-red-600 ml-2 flex-1 font-semibold">
                    {errors.paymentMethod}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowValidationModal(false)}
              className="mt-8 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  alignItems: "center",
                  borderRadius: 18,
                }}
              >
                <Text className="text-white font-black text-lg">Got it</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !deleting && setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7">
            <View className="items-center">
              <View className="w-20 h-20 rounded-[26px] bg-red-50 items-center justify-center">
                <Ionicons name="trash" size={36} color="#EF4444" />
              </View>

              <Text className="text-3xl font-black text-zinc-900 mt-5 text-center">
                Delete Subscription?
              </Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6">
                This will permanently remove this subscription from your
                account.
              </Text>

              <View className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mt-5 w-full">
                <Text className="text-red-700 font-black text-center">
                  {name}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              disabled={deleting}
              activeOpacity={0.88}
              onPress={confirmDelete}
              className={`rounded-2xl min-h-[58px] items-center justify-center mt-7 ${
                deleting ? "bg-red-300" : "bg-red-500"
              }`}
            >
              {deleting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />

                  <Text className="text-white font-black text-base ml-3">
                    Deleting...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="trash-outline" size={21} color="#FFFFFF" />

                  <Text className="text-white font-black text-base ml-2">
                    Delete Forever
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              disabled={deleting}
              activeOpacity={0.7}
              onPress={() => setShowDeleteModal(false)}
              className="items-center mt-5"
            >
              <Text className="text-zinc-500 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7 items-center">
            <View className="w-20 h-20 rounded-[26px] bg-emerald-50 items-center justify-center">
              <Ionicons name="checkmark" size={42} color="#22C55E" />
            </View>

            <Text className="text-3xl font-black text-zinc-900 mt-6">
              Updated!
            </Text>

            <Text className="text-zinc-500 text-center mt-3 leading-6">
              Your subscription has been updated successfully.
            </Text>

            <View className="bg-emerald-50 rounded-2xl px-4 py-3 mt-5 w-full">
              <Text className="text-emerald-700 text-center font-black">
                {name}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={closeSuccessModal}
              className="overflow-hidden rounded-2xl mt-7 w-full"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  alignItems: "center",
                  borderRadius: 18,
                }}
              >
                <View className="flex-row items-center">
                  <Text className="text-white font-black text-lg">
                    Continue
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                    style={{ marginLeft: 9 }}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          ERROR MODAL
      ====================================================== */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7 items-center">
            <View className="w-20 h-20 rounded-[26px] bg-orange-50 items-center justify-center">
              <Ionicons name="alert-circle" size={40} color="#F97316" />
            </View>

            <Text className="text-3xl font-black text-zinc-900 mt-6">
              Oops!
            </Text>

            <Text className="text-zinc-500 text-center mt-3 leading-6">
              {errorMessage}
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowErrorModal(false)}
              className="overflow-hidden rounded-2xl mt-8 w-full"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
                style={{
                  paddingVertical: 18,
                  alignItems: "center",
                  borderRadius: 18,
                }}
              >
                <Text className="text-white font-black text-lg">Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          DISCARD MODAL
      ====================================================== */}
      <Modal
        visible={showDiscardModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowDiscardModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7">
            <View className="items-center">
              <View className="w-20 h-20 rounded-[26px] bg-amber-50 items-center justify-center">
                <Ionicons name="exit-outline" size={38} color="#F59E0B" />
              </View>

              <Text className="text-3xl font-black text-zinc-900 mt-6 text-center">
                Discard Changes?
              </Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6">
                Your edits haven't been saved. Are you sure you want to leave?
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={discardChanges}
              className="bg-red-500 rounded-2xl min-h-[58px] items-center justify-center mt-8"
            >
              <View className="flex-row items-center">
                <Ionicons name="exit-outline" size={21} color="#FFFFFF" />

                <Text className="text-white font-black text-base ml-2">
                  Discard Changes
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDiscardModal(false)}
              className="items-center mt-5"
            >
              <Text className="text-indigo-600 font-bold">
                Continue Editing
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          MAIN FORM
      ====================================================== */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          contentContainerStyle={{
            paddingBottom: 15,
          }}
        >
          {/* =================================================
              HEADER
          ================================================== */}
          <View className="px-5 pt-3 pb-6">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                disabled={saving || deleting}
                activeOpacity={0.75}
                onPress={handleBack}
                className={`w-12 h-12 rounded-2xl bg-white border border-zinc-200 items-center justify-center ${
                  saving || deleting ? "opacity-40" : ""
                }`}
              >
                <Ionicons name="arrow-back" size={22} color="#18181B" />
              </TouchableOpacity>

              <View className="items-center flex-1 mx-3">
                <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  Subscription Manager
                </Text>

                <Text className="text-zinc-900 text-[27px] font-black mt-1">
                  Edit Subscription
                </Text>
              </View>

              <View className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center">
                <Ionicons name="create-outline" size={22} color="#4F46E5" />
              </View>
            </View>

            {/* Current subscription */}
            <View className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-4 flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-indigo-600 items-center justify-center">
                <Ionicons name="repeat-outline" size={21} color="#FFFFFF" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                  Currently editing
                </Text>

                <Text
                  numberOfLines={1}
                  className="text-zinc-900 text-base font-black mt-0.5"
                >
                  {name || "Subscription"}
                </Text>
              </View>

              {hasChanges && (
                <View className="bg-amber-100 px-3 py-1.5 rounded-full">
                  <Text className="text-amber-700 text-[10px] font-black">
                    UNSAVED
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* =================================================
              FORM
          ================================================== */}
          <View className="px-5">
            {/* =================================================
                BASIC DETAILS
            ================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-indigo-100 items-center justify-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={19}
                    color="#4F46E5"
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Basic Details
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Update the subscription information
                  </Text>
                </View>
              </View>

              {/* Name */}
              <View className="mb-4">
                <Text className="text-zinc-700 font-bold mb-2.5">
                  Subscription Name
                </Text>

                <View
                  className={`bg-white rounded-2xl border ${
                    errors.name ? "border-red-300" : "border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-zinc-100 items-center justify-center">
                      <Ionicons
                        name="pricetag-outline"
                        size={18}
                        color="#52525B"
                      />
                    </View>

                    <TextInput
                      editable={!saving && !deleting}
                      value={name}
                      onChangeText={(text) => {
                        setName(text);

                        setErrors((prev) => ({
                          ...prev,
                          name: "",
                        }));
                      }}
                      placeholder="Netflix"
                      placeholderTextColor="#A1A1AA"
                      returnKeyType="next"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-medium"
                    />
                  </View>
                </View>

                {errors.name ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />

                    <Text className="text-red-500 text-xs font-semibold ml-1.5">
                      {errors.name}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Amount */}
              <View>
                <Text className="text-zinc-700 font-bold mb-2.5">Amount</Text>

                <View
                  className={`bg-white rounded-2xl border ${
                    errors.amount ? "border-red-300" : "border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-indigo-50 items-center justify-center">
                      <Text className="text-indigo-600 font-black text-base">
                        ₹
                      </Text>
                    </View>

                    <TextInput
                      editable={!saving && !deleting}
                      value={amount}
                      onChangeText={(text) => {
                        setAmount(text);

                        setErrors((prev) => ({
                          ...prev,
                          amount: "",
                        }));
                      }}
                      keyboardType="numeric"
                      placeholder="499"
                      placeholderTextColor="#A1A1AA"
                      returnKeyType="next"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-bold"
                    />

                    <Text className="text-zinc-400 text-xs font-bold">INR</Text>
                  </View>
                </View>

                {errors.amount ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />

                    <Text className="text-red-500 text-xs font-semibold ml-1.5">
                      {errors.amount}
                    </Text>
                  </View>
                ) : null}

                {amount && !errors.amount && !Number.isNaN(Number(amount)) && (
                  <Text className="text-zinc-400 text-xs mt-2 ml-1">
                    Current amount: ₹{formattedAmount}
                  </Text>
                )}
              </View>
            </View>

            {/* =================================================
                CATEGORY
            ================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-purple-100 items-center justify-center">
                  <Ionicons name="grid-outline" size={18} color="#7C3AED" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Category
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Organize this subscription
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 10,
                }}
              >
                {categories.map((item) => {
                  const selected = category === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      disabled={saving || deleting}
                      activeOpacity={0.8}
                      onPress={() => setCategory(item)}
                      className={`mr-3 rounded-2xl px-4 py-3.5 flex-row items-center border ${
                        selected
                          ? "bg-indigo-600 border-indigo-600"
                          : "bg-white border-zinc-200"
                      } ${saving || deleting ? "opacity-50" : ""}`}
                    >
                      <Ionicons
                        name={categoryIcons[item] ?? "ellipse-outline"}
                        size={18}
                        color={selected ? "#FFFFFF" : "#52525B"}
                      />

                      <Text
                        className={`ml-2 font-bold ${
                          selected ? "text-white" : "text-zinc-700"
                        }`}
                      >
                        {item}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#FFFFFF"
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* =================================================
                BILLING
            ================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-emerald-100 items-center justify-center">
                  <Ionicons name="repeat-outline" size={19} color="#059669" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Billing Cycle
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Change how often you're charged
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                {billingCycles.map((item) => {
                  const selected = billingCycle === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      disabled={saving || deleting}
                      activeOpacity={0.8}
                      onPress={() => setBillingCycle(item)}
                      className={`w-[48%] mr-[2%] mb-3 rounded-2xl border px-4 py-4 ${
                        selected
                          ? "bg-indigo-600 border-indigo-600"
                          : "bg-white border-zinc-200"
                      } ${saving || deleting ? "opacity-50" : ""}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View
                          className={`w-9 h-9 rounded-xl items-center justify-center ${
                            selected ? "bg-white/15" : "bg-zinc-100"
                          }`}
                        >
                          <Ionicons
                            name={billingIcons[item] ?? "calendar-outline"}
                            size={18}
                            color={selected ? "#FFFFFF" : "#52525B"}
                          />
                        </View>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </View>

                      <Text
                        className={`capitalize font-black text-base mt-3 ${
                          selected ? "text-white" : "text-zinc-800"
                        }`}
                      >
                        {item}
                      </Text>

                      <Text
                        className={`text-xs mt-0.5 ${
                          selected ? "text-indigo-100" : "text-zinc-400"
                        }`}
                      >
                        Recurring payment
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* =================================================
                PAYMENT
            ================================================== */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-blue-100 items-center justify-center">
                  <Ionicons name="card-outline" size={18} color="#2563EB" />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Payment
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Update payment and reminder settings
                  </Text>
                </View>
              </View>

              {/* Payment Method */}
              <View className="mb-4">
                <Text className="text-zinc-700 font-bold mb-2.5">
                  Payment Method
                </Text>

                <View
                  className={`bg-white rounded-2xl border ${
                    errors.paymentMethod ? "border-red-300" : "border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center">
                      <Ionicons name="card-outline" size={18} color="#2563EB" />
                    </View>

                    <TextInput
                      editable={!saving && !deleting}
                      value={paymentMethod}
                      onChangeText={(text) => {
                        setPaymentMethod(text);

                        setErrors((prev) => ({
                          ...prev,
                          paymentMethod: "",
                        }));
                      }}
                      placeholder="Credit Card"
                      placeholderTextColor="#A1A1AA"
                      returnKeyType="next"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-medium"
                    />
                  </View>
                </View>

                {errors.paymentMethod ? (
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />

                    <Text className="text-red-500 text-xs font-semibold ml-1.5">
                      {errors.paymentMethod}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Reminder */}
              <View>
                <Text className="text-zinc-700 font-bold mb-2.5">
                  Reminder Days Before
                </Text>

                <View className="bg-white border border-zinc-200 rounded-2xl">
                  <View className="flex-row items-center px-4">
                    <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center">
                      <Ionicons
                        name="notifications-outline"
                        size={18}
                        color="#D97706"
                      />
                    </View>

                    <TextInput
                      editable={!saving && !deleting}
                      value={reminderDaysBefore}
                      onChangeText={setReminderDaysBefore}
                      keyboardType="numeric"
                      placeholder="3"
                      placeholderTextColor="#A1A1AA"
                      returnKeyType="done"
                      className="flex-1 px-3 py-4 text-zinc-900 text-base font-bold"
                    />

                    <Text className="text-zinc-400 text-xs font-black">
                      DAYS
                    </Text>
                  </View>
                </View>

                <Text className="text-zinc-400 text-xs mt-2 ml-1">
                  Choose how early FinTrack should remind you.
                </Text>
              </View>
            </View>

            {/* =================================================
                AUTO RENEW
            ================================================== */}
            <View className="mb-6">
              <TouchableOpacity
                disabled={saving || deleting}
                activeOpacity={0.85}
                onPress={() => setAutoRenew((value) => !value)}
                className={`bg-white border border-zinc-200 rounded-2xl p-5 flex-row items-center justify-between ${
                  saving || deleting ? "opacity-50" : ""
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                      autoRenew ? "bg-emerald-50" : "bg-zinc-100"
                    }`}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={21}
                      color={autoRenew ? "#059669" : "#71717A"}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-zinc-900 font-black text-base">
                      Auto Renew
                    </Text>

                    <Text className="text-zinc-500 text-xs leading-4 mt-1">
                      {autoRenew
                        ? "This subscription renews automatically"
                        : "You'll need to renew it manually"}
                    </Text>
                  </View>
                </View>

                <Switch
                  disabled={saving || deleting}
                  value={autoRenew}
                  onValueChange={setAutoRenew}
                  trackColor={{
                    false: "#D4D4D8",
                    true: "#818CF8",
                  }}
                  thumbColor={autoRenew ? "#4F46E5" : "#F4F4F5"}
                  ios_backgroundColor="#D4D4D8"
                />
              </TouchableOpacity>
            </View>

            {/* =================================================
                NOTES
            ================================================== */}
            <View className="mb-7">
              <View className="flex-row items-center mb-4">
                <View className="w-9 h-9 rounded-xl bg-zinc-200 items-center justify-center">
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#52525B"
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-zinc-900 font-black text-lg">
                    Notes
                  </Text>

                  <Text className="text-zinc-500 text-xs mt-0.5">
                    Update any additional information
                  </Text>
                </View>
              </View>

              <View className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                <TextInput
                  editable={!saving && !deleting}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Additional details..."
                  placeholderTextColor="#A1A1AA"
                  className="text-zinc-900 text-base px-5 py-4 h-32"
                />
              </View>
            </View>

            {/* =================================================
                CHANGE SUMMARY
            ================================================== */}
            <View className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-4 mb-6">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-indigo-600 items-center justify-center">
                  <Ionicons
                    name="git-compare-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-indigo-900 font-black">
                    {hasChanges ? "Changes ready to save" : "No changes yet"}
                  </Text>

                  <Text className="text-indigo-600 text-xs mt-1">
                    {hasChanges
                      ? "Review your details and save when you're ready."
                      : "Edit any field above to make changes."}
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                UPDATE BUTTON
            ================================================== */}
            <TouchableOpacity
              disabled={saving || deleting || !hasChanges}
              activeOpacity={0.88}
              onPress={updateHandler}
              className={`overflow-hidden rounded-[22px] ${
                !hasChanges && !saving ? "opacity-50" : ""
              }`}
            >
              <LinearGradient
                colors={
                  saving ? ["#818CF8", "#6366F1"] : ["#6366F1", "#4F46E5"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  minHeight: 62,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  paddingHorizontal: 20,
                }}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />

                    <Text className="text-white font-black text-base ml-3">
                      Saving Changes...
                    </Text>
                  </>
                ) : (
                  <>
                    <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
                      <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                    </View>

                    <Text className="text-white font-black text-lg ml-3">
                      Update Subscription
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#FFFFFF"
                      style={{ marginLeft: 10 }}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* =================================================
                DELETE BUTTON
            ================================================== */}
            <TouchableOpacity
              disabled={saving || deleting}
              activeOpacity={0.8}
              onPress={() => setShowDeleteModal(true)}
              className={`bg-white border border-red-200 rounded-[22px] min-h-[58px] flex-row items-center justify-center mt-3 ${
                saving || deleting ? "opacity-50" : ""
              }`}
            >
              <View className="w-9 h-9 rounded-full bg-red-50 items-center justify-center">
                <Ionicons name="trash-outline" size={19} color="#EF4444" />
              </View>

              <Text className="text-red-500 font-black text-base ml-3">
                Delete Subscription
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row items-center justify-center mt-5">
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#A1A1AA"
              />

              <Text className="text-zinc-400 text-xs font-medium ml-1.5">
                Your subscription details are securely managed
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =====================================================
          FULL SCREEN SAVING LOADER
      ====================================================== */}
      <Modal
        visible={saving}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/35 items-center justify-center px-6">
          <View className="w-full max-w-[320px] bg-white rounded-[30px] px-7 py-8 items-center">
            <View className="w-20 h-20 rounded-[26px] bg-indigo-50 items-center justify-center">
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>

            <Text className="text-zinc-900 text-xl font-black mt-5">
              Saving Changes
            </Text>

            <Text className="text-zinc-500 text-center text-sm leading-5 mt-2">
              Please wait while we update your subscription details.
            </Text>

            <View className="flex-row items-center mt-5">
              <View className="w-2 h-2 rounded-full bg-indigo-500" />

              <Text className="text-zinc-400 text-xs font-semibold ml-2">
                Updating subscription
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
