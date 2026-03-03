import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "auth_token";

export const saveToken = async (token: string) => {
  if (Platform.OS === "web") localStorage.setItem(KEY, token);
  else await SecureStore.setItemAsync(KEY, token);
};

export const getToken = async () => {
  if (Platform.OS === "web") return localStorage.getItem(KEY);
  return await SecureStore.getItemAsync(KEY);
};

export const removeToken = async () => {
  if (Platform.OS === "web") localStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
};
