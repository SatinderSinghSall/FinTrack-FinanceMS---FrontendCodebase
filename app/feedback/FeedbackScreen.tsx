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

import Input from "../../src/components/Input";
import api from "../../src/services/api";
import Toast from "react-native-toast-message";

type FeedbackType = "Contact Us" | "Report a Bug" | "Request a Feature";
type PriorityLevel = "Low" | "Medium" | "High";

export default function FeedbackScreen() {
  const router = useRouter();

  const [type, setType] = useState<FeedbackType>("Contact Us");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    const newErrors = {
      email: "",
      subject: "",
      message: "",
    };

    let valid = true;

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
      valid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address.";
        valid = false;
      }
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required.";
      valid = false;
    }

    if (!message.trim()) {
      newErrors.message = "Message description is required.";
      valid = false;
    } else if (message.trim().length < 10) {
      newErrors.message = "Please enter at least 10 characters.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      const errorMessage = "Please complete all required fields correctly.";
      setError(errorMessage);

      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: errorMessage,
        position: "top",
      });

      setShowValidationModal(true);
    }

    return valid;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/feedback", {
        type,
        priority,
        email,
        subject,
        message,
      });

      Toast.show({
        type: "success",
        text1: "Submitted successfully",
        text2: "Thank you for your feedback!",
        position: "top",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit feedback.";
      setError(errorMessage);

      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: errorMessage,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-zinc-100">
      {/* TOP HEADER */}
      <View
        className="flex-row items-center justify-between px-6 py-3.5 bg-white border-b border-zinc-200"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          className="w-10 h-10 rounded-2xl bg-zinc-100 items-center justify-center active:bg-zinc-200"
        >
          <Ionicons name="arrow-back" size={20} color="#09090b" />
        </Pressable>

        <Text className="text-base font-bold text-zinc-900 tracking-tight">
          Help & Feedback
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* VALIDATION MODAL */}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View
          className="flex-1 justify-center items-center px-5"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <View
            className="w-full bg-white rounded-[32px] overflow-hidden"
            style={{
              maxWidth: 430,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            <View className="items-center px-7 pt-8">
              <View
                className="items-center justify-center"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#f4f4f5",
                }}
              >
                <Ionicons name="warning" size={32} color="#09090b" />
              </View>

              <Text
                className="text-zinc-900 text-2xl font-black mt-5"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Validation Error
              </Text>

              <Text className="text-zinc-500 text-center leading-5 mt-2 text-sm px-4">
                Please make sure all fields are filled properly before
                submitting.
              </Text>
            </View>

            <View className="h-px bg-zinc-200 mx-7 mt-6" />

            <View className="px-7 pt-5">
              {errors.email !== "" && (
                <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 mb-2.5">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text className="ml-3 flex-1 text-zinc-800 font-medium text-xs">
                    {errors.email}
                  </Text>
                </View>
              )}

              {errors.subject !== "" && (
                <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 mb-2.5">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text className="ml-3 flex-1 text-zinc-800 font-medium text-xs">
                    {errors.subject}
                  </Text>
                </View>
              )}

              {errors.message !== "" && (
                <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text className="ml-3 flex-1 text-zinc-800 font-medium text-xs">
                    {errors.message}
                  </Text>
                </View>
              )}
            </View>

            <View className="px-7 pt-6 pb-7">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowValidationModal(false)}
                className="bg-black rounded-2xl py-4 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-white text-base font-black">Got it</Text>
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
            paddingTop: 28,
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
            {/* Header Title Section */}
            <View className="mb-6">
              <Text
                className="font-black text-zinc-900 tracking-tight"
                style={{ fontSize: isLargeScreen ? 34 : 28 }}
              >
                We'd love to hear from you
              </Text>
              <Text className="text-zinc-500 font-medium text-sm mt-1">
                Help us improve your experience with more details
              </Text>
            </View>

            {/* Form Card */}
            <View
              className="bg-white rounded-[28px] p-6 border border-zinc-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {/* Top Error Banner */}
              {error && (
                <View className="flex-row items-center bg-zinc-100 border border-zinc-300 rounded-2xl p-4 mb-5">
                  <Ionicons name="alert-circle" size={18} color="#ef4444" />
                  <Text className="text-zinc-800 font-semibold text-xs ml-3 flex-1 leading-relaxed">
                    {error}
                  </Text>
                </View>
              )}

              {/* Feedback Type Selector */}
              <View className="mb-5">
                <Text className="text-xs font-bold text-zinc-500 mb-2.5 uppercase tracking-wider">
                  Type
                </Text>
                <View className="flex-row gap-2">
                  {(
                    [
                      "Contact Us",
                      "Report a Bug",
                      "Request a Feature",
                    ] as FeedbackType[]
                  ).map((item) => {
                    const isSelected = type === item;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => setType(item)}
                        className={`flex-1 py-3 px-2 rounded-xl items-center justify-center border ${
                          isSelected
                            ? "bg-black border-black"
                            : "bg-zinc-100 border-zinc-200"
                        }`}
                        style={
                          isSelected
                            ? {
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 1,
                              }
                            : undefined
                        }
                      >
                        <Text
                          className={`text-[11px] font-bold text-center ${
                            isSelected ? "text-white" : "text-zinc-600"
                          }`}
                          numberOfLines={1}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Priority Selector */}
              <View className="mb-5">
                <Text className="text-xs font-bold text-zinc-500 mb-2.5 uppercase tracking-wider">
                  Priority Level
                </Text>
                <View className="flex-row gap-2">
                  {(["Low", "Medium", "High"] as PriorityLevel[]).map(
                    (item) => {
                      const isSelected = priority === item;
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setPriority(item)}
                          className={`flex-1 py-2.5 px-2 rounded-xl items-center justify-center border ${
                            isSelected
                              ? "bg-zinc-900 border-zinc-900"
                              : "bg-zinc-100 border-zinc-200"
                          }`}
                          style={
                            isSelected
                              ? {
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 2,
                                  elevation: 1,
                                }
                              : undefined
                          }
                        >
                          <Text
                            className={`text-xs font-bold text-center ${
                              isSelected ? "text-white" : "text-zinc-600"
                            }`}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              </View>

              {/* Email Address Field */}
              <View className="mb-5">
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email !== "" && (
                  <View className="flex-row items-center bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 mt-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-red-500 text-xs font-semibold ml-2 flex-1">
                      {errors.email}
                    </Text>
                  </View>
                )}
              </View>

              {/* Subject Field */}
              <View className="mb-5">
                <Input
                  label="Subject"
                  value={subject}
                  onChangeText={(text) => {
                    setSubject(text);
                    if (error) setError(null);
                    setErrors((prev) => ({ ...prev, subject: "" }));
                  }}
                  placeholder="Brief summary..."
                />
                {errors.subject !== "" && (
                  <View className="flex-row items-center bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 mt-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-red-500 text-xs font-semibold ml-2 flex-1">
                      {errors.subject}
                    </Text>
                  </View>
                )}
              </View>

              {/* Message Field */}
              <View className="mb-6">
                <Input
                  label="Message"
                  value={message}
                  onChangeText={(text) => {
                    setMessage(text);
                    if (error) setError(null);
                    setErrors((prev) => ({ ...prev, message: "" }));
                  }}
                  placeholder="Provide detailed description..."
                />
                {errors.message !== "" && (
                  <View className="flex-row items-center bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 mt-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-red-500 text-xs font-semibold ml-2 flex-1">
                      {errors.message}
                    </Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`py-4 rounded-2xl flex-row items-center justify-center ${
                  loading
                    ? "bg-zinc-700 opacity-90"
                    : "bg-black active:bg-zinc-800"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-black text-base ml-2.5">
                      Submitting...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text className="text-white font-black text-base ml-2">
                      Submit Feedback
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FULLSCREEN LOADING OVERLAY */}
      {loading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            className="bg-white px-6 py-5 rounded-3xl items-center border border-zinc-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            <ActivityIndicator size="large" color="#000000" />
            <Text className="text-zinc-900 font-bold text-sm mt-3">
              Sending your feedback...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
