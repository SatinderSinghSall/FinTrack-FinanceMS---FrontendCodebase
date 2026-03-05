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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError(null);

    const errorMessage = await login(email, password);

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);
    } else {
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
              Login
            </Text>
          </View>

          <View className="w-9" />
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                  Welcome back
                </Text>

                <Text className="text-slate-500 mt-2">
                  Log in to continue tracking your finances
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

                {/* EMAIL */}
                <View className="mb-4">
                  <Text className="text-slate-600 mb-2">Email</Text>

                  <View className="flex-row items-center border border-slate-200 rounded-lg px-3">
                    <Ionicons name="mail-outline" size={18} color="#64748B" />

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="example@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
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
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      secureTextEntry={!showPassword}
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

                {/* BUTTON */}
                <Button title="Login" onPress={handleLogin} loading={loading} />
              </View>

              {/* FOOTER */}
              <Text className="text-slate-400 text-center text-xs mt-8">
                Secure login • Your data stays private
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* LOADER */}
      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-4 rounded-xl flex-row items-center">
            <ActivityIndicator size="small" color="#0F172A" />
            <Text className="text-slate-700 ml-3">Logging you in...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
