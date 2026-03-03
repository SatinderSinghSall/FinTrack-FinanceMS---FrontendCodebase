import { View, Text, TextInput } from "react-native";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 mb-1 font-medium">{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        selectionColor="#2563eb"
        cursorColor="#2563eb"
        style={{ color: "#111827" }} // ✅ THIS IS THE FIX
        className="bg-white border border-gray-300 rounded-xl px-4 py-3"
      />
    </View>
  );
}
