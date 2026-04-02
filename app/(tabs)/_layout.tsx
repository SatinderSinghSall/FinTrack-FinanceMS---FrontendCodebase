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
          fontWeight: "500",
        },

        tabBarItemStyle: {
          paddingVertical: 4,
        },

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,

          backgroundColor: "#ffffff",

          borderTopWidth: 0.5,
          borderTopColor: "#e5e7eb",

          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
      }}
    >
      {/* DASHBOARD */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />

      {/* TRANSACTIONS */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <Ionicons name="swap-horizontal-outline" size={22} color={color} />
          ),
        }}
      />

      {/* ANALYTICS */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={22} color={color} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />

      {/* HIDDEN SCREENS */}
      <Tabs.Screen name="expenses" options={{ href: null }} />
      <Tabs.Screen name="income" options={{ href: null }} />
      <Tabs.Screen name="budgets" options={{ href: null }} />
    </Tabs>
  );
}
