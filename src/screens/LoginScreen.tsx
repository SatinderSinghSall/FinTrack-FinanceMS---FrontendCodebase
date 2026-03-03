import { View, Text, ActivityIndicator } from "react-native";
import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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
    <View className="flex-1 bg-slate-50 px-6 justify-center">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-slate-900">
          Welcome back
        </Text>
        <Text className="text-slate-500 mt-2">
          Log in to continue tracking your finances
        </Text>
      </View>

      {/* Form Card */}
      <View className="bg-white p-6 rounded-2xl shadow-sm">
        {error && (
          <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>
        )}

        <Input label="Email" value={email} onChangeText={setEmail} />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Login" onPress={handleLogin} loading={loading} />
      </View>

      {/* Footer */}
      <Text className="text-slate-400 text-center text-xs mt-8">
        Secure login • Your data stays private
      </Text>

      {/* Screen Loader */}
      {loading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white px-6 py-4 rounded-xl flex-row items-center">
            <ActivityIndicator size="small" color="#0F172A" />
            <Text className="text-slate-700 ml-3">Logging you in...</Text>
          </View>
        </View>
      )}
    </View>
  );
}
