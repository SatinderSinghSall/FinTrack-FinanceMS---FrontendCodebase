import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  Linking,
  Alert,
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

  /* ============================================================
     EXTERNAL WEBPAGE MODAL
  ============================================================ */

  const [showWebpageModal, setShowWebpageModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");

  /* ============================================================
     OPEN EXTERNAL PAGE CONFIRMATION
  ============================================================ */

  const handleExternalPage = (pageName: string, url: string) => {
    setSelectedPage(pageName);
    setSelectedUrl(url);
    setShowWebpageModal(true);
  };

  /* ============================================================
     OPEN WEBPAGE
  ============================================================ */

  const openWebpage = async () => {
    setShowWebpageModal(false);

    try {
      const supported = await Linking.canOpenURL(selectedUrl);

      if (supported) {
        await Linking.openURL(selectedUrl);
      } else {
        Alert.alert(
          "Unable to open webpage",
          "This webpage could not be opened on your device.",
        );
      }
    } catch (error) {
      console.log("Webpage opening error:", error);

      Alert.alert(
        "Unable to open webpage",
        "Something went wrong while opening the webpage.",
      );
    }
  };

  /* ============================================================
     DELETE ACCOUNT
  ============================================================ */

  const handleDelete = () => {
    setShowDeleteModal(false);

    Linking.openURL("https://fintrack-policy.vercel.app");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="px-4 py-4">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>

          <Text className="text-xl font-bold ml-4">Settings</Text>
        </View>

        {/* ================================================== */}
        {/* ACCOUNT */}
        {/* ================================================== */}

        <Section title="Account">
          <Item
            icon="person-outline"
            label="Edit Profile"
            onPress={() =>
              handleExternalPage(
                "Edit Profile",
                "https://fintrack-policy.vercel.app",
              )
            }
          />

          <Item
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() =>
              handleExternalPage(
                "Change Password",
                "https://fintrack-policy.vercel.app",
              )
            }
          />
        </Section>

        {/* ================================================== */}
        {/* PREFERENCES */}
        {/* ================================================== */}

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

        {/* ================================================== */}
        {/* APP */}
        {/* ================================================== */}

        <Section title="App">
          <Item
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() =>
              handleExternalPage(
                "Help & Support",
                "https://fintrack-policy.vercel.app",
              )
            }
          />

          <Item
            icon="document-text-outline"
            label="Privacy Policy"
            onPress={() =>
              handleExternalPage(
                "Privacy Policy",
                "https://fintrack-policy.vercel.app",
              )
            }
          />

          <Item
            icon="information-circle-outline"
            label="About App"
            onPress={() =>
              handleExternalPage(
                "About App",
                "https://fintrack-app-satinder.vercel.app",
              )
            }
          />
        </Section>

        {/* ================================================== */}
        {/* DANGER ZONE */}
        {/* ================================================== */}

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

      {/* ====================================================== */}
      {/* EXTERNAL WEBPAGE CONFIRMATION MODAL */}
      {/* ====================================================== */}

      <Modal
        transparent
        visible={showWebpageModal}
        animationType="fade"
        onRequestClose={() => setShowWebpageModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View
            className="bg-white w-full rounded-[26px] p-5"
            style={{
              maxWidth: 420,
              shadowColor: "#0F172A",
              shadowOffset: {
                width: 0,
                height: 10,
              },
              shadowOpacity: 0.15,
              shadowRadius: 25,
              elevation: 10,
            }}
          >
            {/* ================================================= */}
            {/* ICON */}
            {/* ================================================= */}

            <View className="items-center">
              <View className="w-16 h-16 rounded-[20px] bg-blue-50 items-center justify-center">
                <Ionicons name="open-outline" size={28} color="#2563EB" />
              </View>

              {/* ================================================= */}
              {/* TITLE */}
              {/* ================================================= */}

              <Text className="text-slate-900 text-lg font-extrabold mt-4 text-center">
                Leaving FinTrack
              </Text>

              {/* ================================================= */}
              {/* DESCRIPTION */}
              {/* ================================================= */}

              <Text className="text-slate-500 text-sm text-center mt-2 leading-5">
                You are being directed to an external webpage to view{" "}
                <Text className="font-semibold text-slate-700">
                  {selectedPage}
                </Text>
                .
              </Text>

              {/* ================================================= */}
              {/* URL */}
              {/* ================================================= */}

              <View className="w-full bg-slate-50 rounded-xl px-3 py-2.5 mt-4 flex-row items-center">
                <Ionicons name="globe-outline" size={16} color="#64748B" />

                <Text
                  className="text-slate-500 text-[10px] ml-2 flex-1"
                  numberOfLines={1}
                >
                  {selectedUrl.replace("https://", "")}
                </Text>
              </View>

              {/* ================================================= */}
              {/* BUTTONS */}
              {/* ================================================= */}

              <View className="flex-row w-full mt-5">
                {/* CANCEL */}

                <Pressable
                  onPress={() => setShowWebpageModal(false)}
                  className="flex-1 bg-slate-100 rounded-xl py-3.5 items-center mr-2"
                >
                  <Text className="text-slate-600 font-bold text-sm">
                    Cancel
                  </Text>
                </Pressable>

                {/* CONTINUE */}

                <Pressable
                  onPress={openWebpage}
                  className="flex-1 bg-blue-600 rounded-xl py-3.5 items-center ml-2"
                >
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-sm">
                      Continue
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color="#FFFFFF"
                      style={{
                        marginLeft: 6,
                      }}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================================== */}
      {/* DELETE MODAL */}
      {/* ====================================================== */}

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

/* ============================================================ */
/* SECTION */
/* ============================================================ */

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

/* ============================================================ */
/* ITEM */
/* ============================================================ */

function Item({ icon, label, onPress }: any) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4">
      <Ionicons name={icon} size={18} color="#374151" />

      <Text className="ml-4 flex-1 text-gray-800 font-medium">{label}</Text>

      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

/* ============================================================ */
/* SWITCH */
/* ============================================================ */

function SwitchItem({ icon, label, value, onValueChange }: any) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <Ionicons name={icon} size={18} color="#374151" />

      <Text className="ml-4 flex-1 text-gray-800 font-medium">{label}</Text>

      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
