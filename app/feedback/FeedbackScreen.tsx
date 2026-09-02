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

  /* ---------------- STATE ---------------- */

  const [type, setType] = useState<FeedbackType>("Contact Us");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      setShowSuccessModal(true);
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

  /* ---------------- BACK ---------------- */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  /* ---------------- SUCCESS CLOSE ---------------- */

  const handleSuccessDone = () => {
    setShowSuccessModal(false);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView className="flex-1 bg-zinc-100">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}

      <View
        className="flex-row items-center justify-between border-b border-zinc-200 bg-white px-6 py-3.5"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Pressable
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 active:bg-zinc-200"
        >
          <Ionicons name="arrow-back" size={20} color="#09090b" />
        </Pressable>

        <Text className="text-base font-bold tracking-tight text-zinc-900">
          Help & Feedback
        </Text>

        <View className="h-10 w-10" />
      </View>

      {/* ========================================================= */}
      {/* VALIDATION MODAL */}
      {/* ========================================================= */}

      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View
          className="flex-1 items-center justify-center px-5"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <View
            className="w-full overflow-hidden rounded-[32px] bg-white"
            style={{
              maxWidth: 430,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            {/* Icon */}
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
                className="mt-5 text-2xl font-black text-zinc-900"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Validation Error
              </Text>

              <Text className="mt-2 px-4 text-center text-sm leading-5 text-zinc-500">
                Please make sure all fields are filled properly before
                submitting.
              </Text>
            </View>

            {/* Divider */}
            <View className="mx-7 mt-6 h-px bg-zinc-200" />

            {/* Errors */}
            <View className="px-7 pt-5">
              {errors.email !== "" && (
                <View className="mb-2.5 flex-row items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />

                  <Text className="ml-3 flex-1 text-xs font-medium text-zinc-800">
                    {errors.email}
                  </Text>
                </View>
              )}

              {errors.subject !== "" && (
                <View className="mb-2.5 flex-row items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />

                  <Text className="ml-3 flex-1 text-xs font-medium text-zinc-800">
                    {errors.subject}
                  </Text>
                </View>
              )}

              {errors.message !== "" && (
                <View className="flex-row items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />

                  <Text className="ml-3 flex-1 text-xs font-medium text-zinc-800">
                    {errors.message}
                  </Text>
                </View>
              )}
            </View>

            {/* Button */}
            <View className="px-7 pb-7 pt-6">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowValidationModal(false)}
                className="items-center rounded-2xl bg-black py-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text className="text-base font-black text-white">Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* SUCCESS MODAL */}
      {/* ========================================================= */}

      {/* ========================================================= */}
      {/* SUCCESS MODAL */}
      {/* ========================================================= */}

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View
          className="flex-1 items-center justify-center px-5"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <View
            className="w-full overflow-hidden rounded-[32px] bg-white"
            style={{
              maxWidth: 430,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.22,
              shadowRadius: 18,
              elevation: 12,
            }}
          >
            {/* ===================================================== */}
            {/* SUCCESS HEADER */}
            {/* ===================================================== */}

            <View className="items-center px-7 pt-7">
              {/* Success Icon */}
              <View
                className="h-[76px] w-[76px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: "#f4f4f5",
                }}
              >
                <View
                  className="h-[58px] w-[58px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "#18181b",
                  }}
                >
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
              </View>

              <Text className="mt-5 text-center text-[23px] font-black tracking-tight text-zinc-900">
                Feedback Submitted
              </Text>

              <Text className="mt-2 px-5 text-center text-sm font-medium leading-5 text-zinc-500">
                Thank you for taking the time to share your feedback with us.
              </Text>
            </View>

            {/* ===================================================== */}
            {/* DIVIDER */}
            {/* ===================================================== */}

            <View className="mx-7 mt-6 h-px bg-zinc-200" />

            {/* ===================================================== */}
            {/* SUBMITTED FEEDBACK PREVIEW */}
            {/* ===================================================== */}

            <View className="px-7 pt-5">
              <View className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                {/* Subject */}
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color="#18181b"
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Your feedback
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-0.5 text-sm font-bold text-zinc-900"
                    >
                      {subject.trim()}
                    </Text>
                  </View>
                </View>

                {/* Metadata */}
                <View className="mt-3 flex-row">
                  <View className="mr-2 rounded-lg bg-white px-2.5 py-1.5">
                    <Text className="text-[10px] font-bold text-zinc-600">
                      {type}
                    </Text>
                  </View>

                  <View className="rounded-lg bg-white px-2.5 py-1.5">
                    <Text className="text-[10px] font-bold text-zinc-600">
                      {priority} Priority
                    </Text>
                  </View>
                </View>
              </View>

              {/* Information */}
              <View className="mt-3 flex-row items-start px-1">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#71717a"
                />

                <Text className="ml-2 flex-1 text-xs leading-5 text-zinc-500">
                  Our team will review your feedback and use it to help improve
                  FinTrack.
                </Text>
              </View>
            </View>

            {/* ===================================================== */}
            {/* ACTION BUTTONS */}
            {/* ===================================================== */}

            <View className="px-7 pb-7 pt-6">
              {/* Check Submissions */}
              <Pressable
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push("/feedback/my-feedback");
                }}
                className="flex-row items-center justify-center rounded-2xl bg-black py-4 active:bg-zinc-800"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.12,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Ionicons name="time-outline" size={17} color="#ffffff" />

                <Text className="ml-2.5 text-sm font-black text-white">
                  Check Submissions
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color="#ffffff"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>

              {/* Done */}
              <Pressable
                onPress={handleSuccessDone}
                className="mt-3 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 py-4 active:bg-zinc-200"
              >
                <Text className="text-sm font-bold text-zinc-700">Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* FORM */}
      {/* ========================================================= */}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          scrollEnabled={!showValidationModal && !showSuccessModal}
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
            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <View className="mb-6">
              <Text
                className="font-black tracking-tight text-zinc-900"
                style={{
                  fontSize: isLargeScreen ? 34 : 28,
                }}
              >
                We'd love to hear from you
              </Text>

              <Text className="mt-1 text-sm font-medium text-zinc-500">
                Help us improve your experience with more details
              </Text>
            </View>

            {/* ================================================= */}
            {/* FORM CARD */}
            {/* ================================================= */}

            <View
              className="rounded-[28px] border border-zinc-200 bg-white p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {/* ================================================= */}
              {/* ERROR BANNER */}
              {/* ================================================= */}

              {error && (
                <View className="mb-5 flex-row items-center rounded-2xl border border-zinc-300 bg-zinc-100 p-4">
                  <Ionicons name="alert-circle" size={18} color="#ef4444" />

                  <Text className="ml-3 flex-1 text-xs font-semibold leading-relaxed text-zinc-800">
                    {error}
                  </Text>
                </View>
              )}

              {/* ================================================= */}
              {/* FEEDBACK TYPE */}
              {/* ================================================= */}

              <View className="mb-5">
                <Text className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
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
                        className={`flex-1 items-center justify-center rounded-xl border px-2 py-3 ${
                          isSelected
                            ? "border-black bg-black"
                            : "border-zinc-200 bg-zinc-100"
                        }`}
                        style={
                          isSelected
                            ? {
                                shadowColor: "#000",
                                shadowOffset: {
                                  width: 0,
                                  height: 1,
                                },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 1,
                              }
                            : undefined
                        }
                      >
                        <Text
                          className={`text-center text-[11px] font-bold ${
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

              {/* ================================================= */}
              {/* PRIORITY */}
              {/* ================================================= */}

              <View className="mb-5">
                <Text className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
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
                          className={`flex-1 items-center justify-center rounded-xl border px-2 py-2.5 ${
                            isSelected
                              ? "border-zinc-900 bg-zinc-900"
                              : "border-zinc-200 bg-zinc-100"
                          }`}
                          style={
                            isSelected
                              ? {
                                  shadowColor: "#000",
                                  shadowOffset: {
                                    width: 0,
                                    height: 1,
                                  },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 2,
                                  elevation: 1,
                                }
                              : undefined
                          }
                        >
                          <Text
                            className={`text-center text-xs font-bold ${
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

              {/* ================================================= */}
              {/* EMAIL */}
              {/* ================================================= */}

              <View className="mb-5">
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);

                    if (error) {
                      setError(null);
                    }

                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {errors.email !== "" && (
                  <View className="mt-2 flex-row items-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />

                    <Text className="ml-2 flex-1 text-xs font-semibold text-red-500">
                      {errors.email}
                    </Text>
                  </View>
                )}
              </View>

              {/* ================================================= */}
              {/* SUBJECT */}
              {/* ================================================= */}

              <View className="mb-5">
                <Input
                  label="Subject"
                  value={subject}
                  onChangeText={(text) => {
                    setSubject(text);

                    if (error) {
                      setError(null);
                    }

                    setErrors((prev) => ({
                      ...prev,
                      subject: "",
                    }));
                  }}
                  placeholder="Brief summary..."
                />

                {errors.subject !== "" && (
                  <View className="mt-2 flex-row items-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />

                    <Text className="ml-2 flex-1 text-xs font-semibold text-red-500">
                      {errors.subject}
                    </Text>
                  </View>
                )}
              </View>

              {/* ================================================= */}
              {/* MESSAGE */}
              {/* ================================================= */}

              <View className="mb-6">
                <Input
                  label="Message"
                  value={message}
                  onChangeText={(text) => {
                    setMessage(text);

                    if (error) {
                      setError(null);
                    }

                    setErrors((prev) => ({
                      ...prev,
                      message: "",
                    }));
                  }}
                  placeholder="Provide detailed description..."
                />

                {errors.message !== "" && (
                  <View className="mt-2 flex-row items-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2">
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />

                    <Text className="ml-2 flex-1 text-xs font-semibold text-red-500">
                      {errors.message}
                    </Text>
                  </View>
                )}
              </View>

              {/* ================================================= */}
              {/* SUBMIT BUTTON */}
              {/* ================================================= */}

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`flex-row items-center justify-center rounded-2xl py-4 ${
                  loading
                    ? "bg-zinc-700 opacity-90"
                    : "bg-black active:bg-zinc-800"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />

                    <Text className="ml-2.5 text-base font-black text-white">
                      Submitting...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#fff" />

                    <Text className="ml-2 text-base font-black text-white">
                      Submit Feedback
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================================= */}
      {/* SUBMISSION LOADING OVERLAY */}
      {/* ========================================================= */}

      {loading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
          }}
        >
          <View
            className="w-[250px] items-center rounded-[28px] border border-zinc-200 bg-white px-6 py-7"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.22,
              shadowRadius: 18,
              elevation: 12,
            }}
          >
            {/* Loader */}
            <View className="h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
              <ActivityIndicator size="small" color="#09090b" />
            </View>

            <Text className="mt-5 text-base font-black text-zinc-900">
              Sending feedback
            </Text>

            <Text className="mt-1.5 text-center text-xs font-medium leading-5 text-zinc-500">
              Please wait while we submit your message...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
