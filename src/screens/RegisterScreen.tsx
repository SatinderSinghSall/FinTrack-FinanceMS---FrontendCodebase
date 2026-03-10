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

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: "All fields are required",
      });

      return;
    }

    setLoading(true);
    setError(null);

    const errorMessage = await register(name.trim(), email.trim(), password);

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: errorMessage,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Account Created",
        text2: "Your account was created successfully",
      });

      router.replace("/(tabs)/dashboard");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center h-14 px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center bg-slate-100"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-base font-semibold text-slate-900">
              Create Account
            </Text>
          </View>

          <View className="w-9" />
        </View>
      </View>

      {/* KEYBOARD HANDLER */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="interactive"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 24,
            minHeight: height - 80,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              alignSelf: "center",
            }}
          >
            {/* TITLE */}
            <View className="mb-6">
              <Text
                className="font-extrabold text-slate-900"
                style={{ fontSize: isTablet ? 34 : 30 }}
              >
                Create account
              </Text>

              <Text className="text-slate-500 mt-2">
                Start tracking your expenses smarter
              </Text>
            </View>

            {/* CARD */}
            <View className="bg-white p-6 rounded-2xl shadow-sm">
              {error && (
                <View className="flex-row items-center bg-red-50 p-3 rounded-lg mb-4">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              )}

              {/* NAME */}
              <View className="mb-4">
                <Text className="text-slate-600 mb-2">Name</Text>

                <View className="flex-row items-center border border-slate-200 rounded-lg px-3">
                  <Ionicons name="person-outline" size={18} color="#64748B" />

                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailRef.current?.focus()}
                    className="flex-1 ml-2 py-3"
                  />
                </View>
              </View>

              {/* EMAIL */}
              <View className="mb-4">
                <Text className="text-slate-600 mb-2">Email</Text>

                <View className="flex-row items-center border border-slate-200 rounded-lg px-3">
                  <Ionicons name="mail-outline" size={18} color="#64748B" />

                  <TextInput
                    ref={emailRef}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    className="flex-1 ml-2 py-3"
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View className="mb-6">
                <Text className="text-slate-600 mb-2">Password</Text>

                <View className="flex-row items-center border border-slate-200 rounded-lg px-3">
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#64748B"
                  />

                  <TextInput
                    ref={passwordRef}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    className="flex-1 ml-2 py-3"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
              />
            </View>

            {/* FOOTER */}
            <Text className="text-slate-400 text-center text-xs mt-8">
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* LOADING */}
      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-4 rounded-xl flex-row items-center">
            <ActivityIndicator size="small" color="#0F172A" />
            <Text className="text-slate-700 ml-3">Creating account...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
