import { create } from "zustand";
import api from "../services/api";
import { saveToken, removeToken, getToken } from "../utils/tokenStorage";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  restoreSession: async () => {
    const token = await getToken();

    if (!token) return;

    try {
      const res = await api.get("/profile");

      if (!res.data?.user) {
        await removeToken();
        set({ user: null, isAuthenticated: false });
        return;
      }

      set({
        user: res.data.user,
        isAuthenticated: true,
      });
    } catch (err) {
      await removeToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      await saveToken(res.data.token);

      set({
        user: res.data.user,
        isAuthenticated: true,
      });

      return null;
    } catch (err: any) {
      return err.response?.data?.message || "Login failed";
    }
  },

  register: async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      await saveToken(res.data.token);

      set({
        user: res.data.user,
        isAuthenticated: true,
      });

      return null;
    } catch (err: any) {
      return err.response?.data?.message || "Registration failed";
    }
  },

  logout: async () => {
    await removeToken();
    set({ user: null, isAuthenticated: false });
  },
}));
