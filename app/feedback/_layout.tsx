import { Stack } from "expo-router";

export default function FeedbackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Must match the exact filename without extension */}
      <Stack.Screen name="FeedbackScreen" />
    </Stack>
  );
}
