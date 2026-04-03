import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Pressable,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AppHeader from "../components/AppHeader";
import { useNavigation } from "@react-navigation/native";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const navigation = useNavigation();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // 🔥 FETCH DATA (SAFE)
  const fetchData = async () => {
    try {
      const [expenseRes, incomeRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/income"),
      ]);

      // console.log("EXPENSE:", expenseRes.data);
      // console.log("INCOME:", incomeRes.data);

      const expenses = (expenseRes.data || []).map((e: any) => ({
        ...e,
        type: "expense",
      }));

      const income = (incomeRes.data?.data || []).map((i: any) => ({
        ...i,
        type: "income",
      }));

      const merged = [...expenses, ...income].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setTransactions(merged);
    } catch (err) {
      console.log("Transactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 FILTER + SEARCH
  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const matchFilter =
        filter === "All" || item.type === filter.toLowerCase();

      const matchSearch = (item.source || item.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [transactions, filter, search]);

  // 💰 TOTAL BALANCE
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, item) => {
      return item.type === "income" ? acc + item.amount : acc - item.amount;
    }, 0);
  }, [transactions]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* 🔥 PREMIUM HEADER */}
      <AppHeader
        title="Transactions"
        showMenu
        onMenuPress={() => navigation.openDrawer()}
      />
      {/* 🔷 HEADER */}
      <View className="bg-blue-600 px-5 pt-4 pb-6 rounded-b-3xl">
        <Text className="text-white text-sm">Total Balance</Text>
        <Text className="text-white text-2xl font-bold mt-1">
          ₹{totalBalance}
        </Text>

        {/* FILTER BUTTONS */}
        <View className="flex-row mt-4">
          {["All", "Income", "Expense"].map((f) => (
            <Text
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-full mr-2 text-sm ${
                filter === f
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white"
              }`}
            >
              {f}
            </Text>
          ))}
        </View>
      </View>

      {/* 🔍 SEARCH */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-xl px-3 py-2 flex-row items-center">
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            className="ml-2 flex-1"
          />
        </View>
      </View>

      {/* 🚀 QUICK ACTION BUTTONS */}
      <View className="px-4 mt-3">
        <View className="flex-row justify-between gap-3">
          {/* 💸 EXPENSE BUTTON */}
          <View className="flex-1">
            <Text
              onPress={() => router.push("/expenses")}
              className="bg-red-500 py-3 rounded-2xl text-white text-center font-semibold flex-row"
            >
              <Ionicons name="arrow-up" size={16} color="white" /> Expense
            </Text>
          </View>

          {/* 💰 INCOME BUTTON */}
          <View className="flex-1">
            <Text
              onPress={() => router.push("/income")}
              className="bg-green-500 py-3 rounded-2xl text-white text-center font-semibold"
            >
              <Ionicons name="arrow-down" size={16} color="white" /> Income
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/budgets")}
          className="w-full mt-4 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">Add Budget</Text>
        </Pressable>
      </View>

      {/* 📄 LIST */}
      <ScrollView
        className="px-4 mt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {filtered.length === 0 ? (
          <View className="items-center mt-20">
            <Ionicons name="document-text-outline" size={40} color="#9ca3af" />
            <Text className="text-gray-500 mt-3">No transactions found.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View
              key={item._id}
              className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center"
            >
              <View className="flex-row items-center">
                <View
                  className={`p-2 rounded-lg ${
                    item.type === "income" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Ionicons
                    name={item.type === "income" ? "arrow-down" : "arrow-up"}
                    size={18}
                    color={item.type === "income" ? "#16a34a" : "#dc2626"}
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-gray-800 font-medium">
                    {item.source || item.title}
                  </Text>

                  <Text className="text-gray-400 text-xs">
                    {new Date(item.date).toDateString()}
                  </Text>
                </View>
              </View>

              <Text
                className={`font-semibold ${
                  item.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.type === "income" ? "+" : "-"}₹{item.amount}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
