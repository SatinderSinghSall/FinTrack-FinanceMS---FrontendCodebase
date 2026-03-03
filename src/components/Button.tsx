import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
}: ButtonProps) {
  const base =
    variant === "primary" ? "bg-black" : "bg-gray-200 border border-gray-300";

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`${base} py-3 rounded-lg items-center`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#000"} />
      ) : (
        <Text
          className={`font-semibold ${
            variant === "primary" ? "text-white" : "text-black"
          }`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
