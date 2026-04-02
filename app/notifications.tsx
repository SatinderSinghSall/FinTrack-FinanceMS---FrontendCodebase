import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import api from "../src/services/api";

export default function NotificationScreen() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const [expenseRes, incomeRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/income"),
      ]);

      const expenses = (expenseRes.data || []).map((e: any) => ({
        id: e._id,
        title: "Expense Added",
        message: `₹${e.amount} spent on ${e.title || "Expense"}`,
        time: new Date(e.date),
        type: "expense",
      }));

      const income = (incomeRes.data?.data || []).map((i: any) => ({
        id: i._id,
        title: "Income Received",
        message: `₹${i.amount} received from ${i.source || "Income"}`,
        time: new Date(i.date),
        type: "income",
      }));

      // 👨‍💻 Developer Notification
      const developer = {
        id: "dev",
        title: "Meet the Developer 👨‍💻",
        message: "Tap to view portfolio",
        time: new Date(),
        type: "info",
        action: () => Linking.openURL("https://satinder-portfolio.vercel.app/"),
      };

      const merged = [...expenses, ...income, developer].sort(
        (a, b) => b.time.getTime() - a.time.getTime(),
      );

      setData(merged);
    } catch (e) {
      console.log("Notification error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // 🧠 GROUPING (Today / Earlier)
  const grouped = useMemo(() => {
    const today: any[] = [];
    const earlier: any[] = [];

    const now = new Date();

    data.forEach((item) => {
      const diff = now.getTime() - item.time.getTime();
      const isToday = diff < 24 * 60 * 60 * 1000;

      if (isToday) today.push(item);
      else earlier.push(item);
    });

    return { today, earlier };
  }, [data]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-gray-500 mt-2">Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} />
            </Pressable>

            <Text className="text-2xl font-bold ml-4">Notifications</Text>
          </View>

          <Ionicons name="notifications-outline" size={22} />
        </View>

        {/* TODAY */}
        <Section title="Today">
          {grouped.today.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))}
        </Section>

        {/* EARLIER */}
        <Section title="Earlier">
          {grouped.earlier.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))}
        </Section>

        {/* EMPTY */}
        {data.length === 0 && (
          <View className="items-center mt-20">
            <Ionicons name="notifications-outline" size={40} color="#9ca3af" />
            <Text className="text-gray-500 mt-3">No notifications yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SECTION ---------- */

function Section({ title, children }: any) {
  if (!children || children.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm mb-2 font-semibold">{title}</Text>
      {children}
    </View>
  );
}

/* ---------- CARD ---------- */

function NotificationCard({ item }: any) {
  const getStyle = () => {
    switch (item.type) {
      case "income":
        return { bg: "bg-green-100", color: "#16a34a", icon: "arrow-down" };
      case "expense":
        return { bg: "bg-red-100", color: "#dc2626", icon: "arrow-up" };
      case "alert":
        return {
          bg: "bg-yellow-100",
          color: "#ca8a04",
          icon: "alert-circle-outline",
        };
      default:
        return {
          bg: "bg-blue-100",
          color: "#2563eb",
          icon: "information-circle-outline",
        };
    }
  };

  const style = getStyle();

  return (
    <Pressable
      onPress={item.action}
      className="bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm"
    >
      <View className={`p-3 rounded-full mr-3 ${style.bg}`}>
        <Ionicons name={style.icon} size={18} color={style.color} />
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-gray-900">{item.title}</Text>

        <Text className="text-gray-500 text-sm mt-1">{item.message}</Text>

        <Text className="text-gray-400 text-xs mt-1">
          {item.time.toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}
