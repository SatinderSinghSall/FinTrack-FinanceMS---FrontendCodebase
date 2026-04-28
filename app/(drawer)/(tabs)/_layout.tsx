import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const insets = useSafeAreaInsets();

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -2,
          fontWeight: "600",
        },

        tabBarItemStyle: {
          paddingVertical: 6,
        },

        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,

          backgroundColor: "#ffffff",

          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",

          elevation: 0,

          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <Ionicons name="swap-horizontal-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="expenses" options={{ href: null }} />
      <Tabs.Screen name="income" options={{ href: null }} />
      <Tabs.Screen name="budgets" options={{ href: null }} />
    </Tabs>
  );
}
