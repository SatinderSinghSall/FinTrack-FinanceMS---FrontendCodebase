import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function NotificationScreen() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [expenseAlert, setExpenseAlert] = useState(true);
  const [budgetAlert, setBudgetAlert] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="px-4 py-4">
        {/* HEADER */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>

          <Text className="text-xl font-bold ml-4">Notifications</Text>
        </View>

        {/* GENERAL */}
        <Section title="General">
          <SwitchItem
            icon="notifications-outline"
            label="Push Notifications"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />

          <SwitchItem
            icon="mail-outline"
            label="Email Notifications"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
          />
        </Section>

        {/* ALERTS */}
        <Section title="Alerts">
          <SwitchItem
            icon="card-outline"
            label="Expense Alerts"
            value={expenseAlert}
            onValueChange={setExpenseAlert}
          />

          <SwitchItem
            icon="wallet-outline"
            label="Budget Alerts"
            value={budgetAlert}
            onValueChange={setBudgetAlert}
          />
        </Section>

        {/* INFO */}
        <Section title="Info">
          <Item
            icon="information-circle-outline"
            label="Notification Preferences Info"
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SECTION ---------- */

function Section({ title, children }: any) {
  return (
    <View className="mb-6">
      <Text className="text-gray-500 mb-2 font-semibold">{title}</Text>

      <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        {children}
      </View>
    </View>
  );
}

/* ---------- ITEM ---------- */

function Item({ icon, label }: any) {
  return (
    <Pressable className="flex-row items-center px-4 py-4">
      <Ionicons name={icon} size={18} color="#374151" />

      <Text className="ml-4 flex-1 text-gray-800 font-medium">{label}</Text>

      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

/* ---------- SWITCH ITEM ---------- */

function SwitchItem({ icon, label, value, onValueChange }: any) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <Ionicons name={icon} size={18} color="#374151" />

      <Text className="ml-4 flex-1 text-gray-800 font-medium">{label}</Text>

      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
