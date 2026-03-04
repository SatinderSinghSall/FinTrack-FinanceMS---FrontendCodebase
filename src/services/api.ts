import axios from "axios";
import { getToken } from "../utils/tokenStorage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://fintrack-financems-backendcodebase.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

if (__DEV__) {
  console.log("API URL:", API_URL);
}

export default api;
