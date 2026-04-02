import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(false);
    Linking.openURL("https://satindersinghsall.github.io/fintrack-privacy/");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="px-4 py-4">
        {/* HEADER */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>

          <Text className="text-xl font-bold ml-4">Settings</Text>
        </View>

        {/* ACCOUNT */}
        <Section title="Account">
          <Item icon="person-outline" label="Edit Profile" />
          <Item icon="lock-closed-outline" label="Change Password" />
        </Section>

        {/* 🔥 PREFERENCES */}
        <Section title="Preferences">
          <SwitchItem
            icon="notifications-outline"
            label="Push Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />

          <Item
            icon="notifications-circle-outline"
            label="Manage Notifications"
            onPress={() => router.push("/notifications-settings")}
          />

          <SwitchItem
            icon="moon-outline"
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </Section>

        {/* APP */}
        <Section title="App">
          <Item icon="help-circle-outline" label="Help & Support" />
          <Item icon="document-text-outline" label="Privacy Policy" />
          <Item icon="information-circle-outline" label="About App" />
        </Section>

        {/* DANGER ZONE */}
        <Section title="Danger Zone">
          <Pressable
            onPress={() => setShowDeleteModal(true)}
            className="flex-row items-center px-4 py-4"
          >
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
            <Text className="ml-4 flex-1 text-red-600 font-semibold">
              Delete Account
            </Text>
          </Pressable>
        </Section>
      </ScrollView>

      {/* DELETE MODAL */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-3xl p-6">
            <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center self-center mb-4">
              <Ionicons name="warning-outline" size={30} color="#dc2626" />
            </View>

            <Text className="text-xl font-bold text-center mb-2">
              Delete Account?
            </Text>

            <Text className="text-gray-500 text-center mb-6">
              This action is permanent and cannot be undone.
            </Text>

            <View className="flex-row">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl mr-2 items-center"
              >
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="flex-1 bg-red-600 py-3 rounded-xl ml-2 items-center"
              >
                <Text className="text-white font-semibold">Yes, Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
function Item({ icon, label, onPress }: any) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4">
      <Ionicons name={icon} size={18} color="#374151" />
      <Text className="ml-4 flex-1 text-gray-800 font-medium">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

/* ---------- SWITCH ---------- */
function SwitchItem({ icon, label, value, onValueChange }: any) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <Ionicons name={icon} size={18} color="#374151" />
      <Text className="ml-4 flex-1 text-gray-800 font-medium">{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
