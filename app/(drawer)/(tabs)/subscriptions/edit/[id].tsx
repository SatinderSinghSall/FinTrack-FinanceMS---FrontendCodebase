import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-100">
        <ActivityIndicator size="large" color="#4F46E5" />

        <Text className="text-zinc-500 mt-4 font-medium">
          Loading subscription...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100">
      {/* Validation Modal */}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center">
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
                <Text className="text-red-600 mb-2">• {errors.name}</Text>
              )}

              {errors.amount !== "" && (
                <Text className="text-red-600 mb-2">• {errors.amount}</Text>
              )}

              {errors.paymentMethod !== "" && (
                <Text className="text-red-600">• {errors.paymentMethod}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowValidationModal(false)}
              className="mt-8 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
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

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center">
                <Ionicons name="trash" size={36} color="#EF4444" />
              </View>

              <Text className="text-3xl font-black mt-5">
                Delete Subscription?
              </Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6">
                This action cannot be undone.
              </Text>
            </View>

            <TouchableOpacity
              disabled={deleting}
              onPress={confirmDelete}
              className="bg-red-500 rounded-2xl py-5 items-center mt-8"
            >
              <Text className="text-white font-black text-lg">
                {deleting ? "Deleting..." : "Delete Forever"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              className="items-center mt-5"
            >
              <Text className="text-zinc-500 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7 items-center">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
              <Ionicons name="checkmark" size={42} color="#22C55E" />
            </View>

            <Text className="text-3xl font-black mt-6">Updated!</Text>

            <Text className="text-zinc-500 text-center mt-3 leading-6">
              Your subscription has been updated successfully.
            </Text>

            <TouchableOpacity
              onPress={closeSuccessModal}
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
                <Text className="text-white font-black text-lg">Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7 items-center">
            <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center">
              <Ionicons name="alert-circle" size={40} color="#F97316" />
            </View>

            <Text className="text-3xl font-black mt-6">Oops!</Text>

            <Text className="text-zinc-500 text-center mt-3 leading-6">
              {errorMessage}
            </Text>

            <TouchableOpacity
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

      {/* Discard Changes Modal */}
      <Modal
        visible={showDiscardModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[34px] w-full p-7">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-amber-100 items-center justify-center">
                <Ionicons name="exit-outline" size={38} color="#F59E0B" />
              </View>

              <Text className="text-3xl font-black mt-6">Discard Changes?</Text>

              <Text className="text-zinc-500 text-center mt-3 leading-6">
                Your edits haven't been saved.
              </Text>
            </View>

            <TouchableOpacity
              onPress={discardChanges}
              className="bg-red-500 rounded-2xl py-5 items-center mt-8"
            >
              <Text className="text-white font-black text-lg">Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 15,
        }}
      >
        {/* HEADER */}

        <View className="px-5 pt-16 pb-8">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                if (hasChanges) {
                  setShowDiscardModal(true);
                } else {
                  router.replace({
                    pathname: "/(drawer)/(tabs)/subscriptions",
                  });
                }
              }}
              className="bg-white border border-zinc-200 w-12 h-12 rounded-2xl items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#18181b" />
            </TouchableOpacity>

            <Text className="text-zinc-900 text-3xl font-black">
              Edit Subscription
            </Text>

            <View
              style={{
                width: 48,
              }}
            />
          </View>
        </View>

        {/* FORM */}

        <View className="px-5">
          {/* NAME */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">
              Subscription Name
            </Text>

            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({
                  ...prev,
                  name: "",
                }));
              }}
              placeholder="Netflix"
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* AMOUNT */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Amount</Text>

            <TextInput
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
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* CATEGORY */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Category</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategory(item)}
                  className={`mr-3 px-5 py-3 rounded-2xl ${
                    category === item
                      ? "bg-indigo-600"
                      : "bg-white border border-zinc-200"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      category === item ? "text-white" : "text-zinc-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* BILLING */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Billing Cycle</Text>

            <View className="flex-row flex-wrap">
              {billingCycles.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setBillingCycle(item)}
                  className={`mr-3 mb-3 px-5 py-3 rounded-2xl ${
                    billingCycle === item
                      ? "bg-indigo-600"
                      : "bg-white border border-zinc-200"
                  }`}
                >
                  <Text
                    className={`capitalize font-bold ${
                      billingCycle === item ? "text-white" : "text-zinc-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PAYMENT */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">Payment Method</Text>

            <TextInput
              value={paymentMethod}
              onChangeText={(text) => {
                setPaymentMethod(text);
                setErrors((prev) => ({
                  ...prev,
                  paymentMethod: "",
                }));
              }}
              placeholder="Credit Card"
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* REMINDER */}

          <View className="mb-5">
            <Text className="text-zinc-700 font-bold mb-3">
              Reminder Days Before
            </Text>

            <TextInput
              value={reminderDaysBefore}
              onChangeText={setReminderDaysBefore}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900"
            />
          </View>

          {/* AUTO RENEW */}

          <View className="bg-white border border-zinc-200 rounded-2xl p-5 flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-zinc-900 font-black text-lg">
                Auto Renew
              </Text>

              <Text className="text-zinc-500 mt-1">
                Automatically renew subscription
              </Text>
            </View>

            <Switch value={autoRenew} onValueChange={setAutoRenew} />
          </View>

          {/* NOTES */}

          <View className="mb-8">
            <Text className="text-zinc-700 font-bold mb-3">Notes</Text>

            <TextInput
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details..."
              placeholderTextColor="#71717a"
              className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 h-32"
            />
          </View>

          {/* UPDATE */}

          <TouchableOpacity
            onPress={updateHandler}
            disabled={saving}
            className="bg-indigo-600 rounded-2xl py-5 items-center mb-4"
          >
            <Text className="text-white font-black text-lg">
              {saving ? "Saving..." : "Update Subscription"}
            </Text>
          </TouchableOpacity>

          {/* DELETE */}

          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="bg-red-500 rounded-2xl py-5 items-center"
          >
            <Text className="text-white font-black text-lg">
              Delete Subscription
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
