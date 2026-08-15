import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  /* ============================================================
     VALIDATION
  ============================================================ */

  const emailError =
    email.length === 0
      ? "Please enter your email address"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Please enter a valid email address"
        : null;

  const passwordError =
    password.length === 0 ? "Please enter your password" : null;

  const handleLogin = async () => {
    /*
     * Keep the existing validation behaviour.
     * We additionally surface the errors directly beneath
     * their respective fields.
     */

    if (!email || !password) {
      setError("Please enter your email and password");

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Please enter your email and password",
      });

      return;
    }

    setLoading(true);
    setError(null);

    const errorMessage = await login(email.trim(), password);

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: "Welcome back!",
      });

      router.replace("/(tabs)/dashboard");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" backgroundColor="#F8FAFC" />

      {/* ============================================================
          HEADER
      ============================================================ */}

      <View className="border-b border-slate-100 bg-white">
        <View className="h-14 flex-row items-center px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 active:opacity-70"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={19} color="#0F172A" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <View className="flex-row items-center">
              <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
                <Ionicons name="wallet-outline" size={15} color="#FFFFFF" />
              </View>

              <Text className="text-base font-bold text-slate-900">
                FinTrack | Login
              </Text>
            </View>
          </View>

          <View className="w-10" />
        </View>
      </View>

      {/* ============================================================
          KEYBOARD HANDLER
      ============================================================ */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: isTablet ? 40 : 24,
            paddingVertical: 32,
            minHeight: height - 80,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isTablet ? 480 : 420,
              alignSelf: "center",
            }}
          >
            {/* ======================================================
                INTRO
            ====================================================== */}

            <View className="mb-7">
              {/* Small eyebrow */}
              <View className="mb-4 flex-row items-center">
                <View className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />

                <Text className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
                  Welcome back
                </Text>
              </View>

              <Text
                className="font-extrabold text-slate-900"
                style={{
                  fontSize: isTablet ? 38 : 32,
                  lineHeight: isTablet ? 44 : 38,
                  letterSpacing: -0.7,
                }}
              >
                Welcome back.
              </Text>

              <Text className="mt-2 text-[15px] leading-6 text-slate-500">
                Log in to continue tracking your finances.
              </Text>
            </View>

            {/* ======================================================
                LOGIN CARD
            ====================================================== */}

            <View
              className="rounded-3xl border border-slate-200 bg-white p-6"
              style={{
                shadowColor: "#0F172A",
                shadowOpacity: 0.07,
                shadowRadius: 18,
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                elevation: 3,
              }}
            >
              {/* ==================================================
                  GLOBAL ERROR
              ================================================== */}

              {error && (
                <View className="mb-5 overflow-hidden rounded-xl border border-red-100 bg-red-50">
                  <View className="flex-row items-start p-3.5">
                    <View className="h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                      <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="text-[13px] font-bold text-red-700">
                        Login failed
                      </Text>

                      <Text className="mt-0.5 text-[12px] leading-5 text-red-500">
                        {error}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ==================================================
                  EMAIL
              ================================================== */}

              <View className="mb-5">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[13px] font-semibold text-slate-700">
                    Email address
                  </Text>

                  <Text className="text-[11px] text-slate-400">Required</Text>
                </View>

                <View
                  className={`flex-row items-center rounded-xl border px-3.5 ${
                    emailError && email.length > 0
                      ? "border-red-300 bg-red-50/30"
                      : emailFocused
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-slate-200 bg-white"
                  }`}
                  style={{
                    minHeight: 52,
                  }}
                >
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-lg ${
                      emailFocused ? "bg-indigo-50" : "bg-slate-50"
                    }`}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={emailFocused ? "#6366F1" : "#64748B"}
                    />
                  </View>

                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (error) setError(null);
                    }}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    className="ml-3 flex-1 py-3 text-[14px] text-slate-900"
                  />
                </View>

                {/* Inline email error */}
                {emailError && (
                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#EF4444"
                    />

                    <Text className="ml-1.5 text-[11px] font-medium text-red-500">
                      {emailError}
                    </Text>
                  </View>
                )}
              </View>

              {/* ==================================================
                  PASSWORD
              ================================================== */}

              <View className="mb-6">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[13px] font-semibold text-slate-700">
                    Password
                  </Text>

                  <Text className="text-[11px] text-slate-400">Required</Text>
                </View>

                <View
                  className={`flex-row items-center rounded-xl border px-3.5 ${
                    passwordError && password.length > 0
                      ? "border-red-300 bg-red-50/30"
                      : passwordFocused
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-slate-200 bg-white"
                  }`}
                  style={{
                    minHeight: 52,
                  }}
                >
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-lg ${
                      passwordFocused ? "bg-indigo-50" : "bg-slate-50"
                    }`}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={17}
                      color={passwordFocused ? "#6366F1" : "#64748B"}
                    />
                  </View>

                  <TextInput
                    ref={passwordRef}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onSubmitEditing={handleLogin}
                    className="ml-3 flex-1 py-3 text-[14px] text-slate-900"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="h-9 w-9 items-center justify-center rounded-lg active:bg-slate-100"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                {/* Inline password error */}
                {passwordError && (
                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#EF4444"
                    />

                    <Text className="ml-1.5 text-[11px] font-medium text-red-500">
                      {passwordError}
                    </Text>
                  </View>
                )}
              </View>

              {/* ==================================================
                  LOGIN BUTTON
              ================================================== */}

              <View
                style={{
                  opacity: loading ? 0.65 : 1,
                }}
              >
                <Button title="Login" onPress={handleLogin} loading={loading} />
              </View>

              {/* Small trust row */}
              <View className="mt-5 flex-row items-center justify-center">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#94A3B8"
                />

                <Text className="ml-1.5 text-[11px] text-slate-400">
                  Your credentials are securely protected
                </Text>
              </View>
            </View>

            {/* ======================================================
                SIGN UP PROMPT
            ====================================================== */}

            <View className="mt-7 items-center">
              <Text className="text-[13px] text-slate-500">
                Don't have a FinTrack account?
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/register")}
                className="mt-2 rounded-lg px-3 py-1 active:opacity-60"
                activeOpacity={0.7}
              >
                <Text className="text-[13px] font-bold text-indigo-600">
                  Create an account
                </Text>
              </TouchableOpacity>
            </View>

            {/* ======================================================
                FOOTER
            ====================================================== */}

            <View className="mt-8 items-center">
              <View className="mb-3 h-px w-12 bg-slate-200" />

              <Text className="text-[10px] text-slate-400">
                Secure login • Your data stays private
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ============================================================
          LOADING OVERLAY
      ============================================================ */}

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-slate-950/20">
          <View
            className="flex-row items-center rounded-2xl border border-slate-100 bg-white px-5 py-4"
            style={{
              shadowColor: "#0F172A",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: {
                width: 0,
                height: 8,
              },
              elevation: 8,
            }}
          >
            <ActivityIndicator size="small" color="#6366F1" />

            <Text className="ml-3 text-[13px] font-semibold text-slate-700">
              Logging you in...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
