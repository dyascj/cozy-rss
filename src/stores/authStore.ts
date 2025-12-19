"use client";

import { create } from "zustand";
import { useFeedStore } from "./feedStore";
import { useArticleStore } from "./articleStore";
import { useTagStore } from "./tagStore";
import { useSettingsStore } from "./settingsStore";

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

// Helper to reset all stores
function resetAllStores() {
  useFeedStore.getState().reset();
  useArticleStore.getState().reset();
  useTagStore.getState().reset();
  useSettingsStore.getState().reset();
}

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sessionChecked: false,
  error: null,

  signIn: async (username: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        set({ isLoading: false, error: data.error || "Sign in failed" });
        return false;
      }

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: "An error occurred during sign in",
      });
      console.error("Sign in error:", error);
      return false;
    }
  },

  signUp: async (username: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        set({ isLoading: false, error: data.error || "Sign up failed" });
        return false;
      }

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: "An error occurred during sign up",
      });
      console.error("Sign up error:", error);
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Reset all data stores
      resetAllStores();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionChecked: false,
        error: null,
      });

      // Redirect to landing page
      window.location.href = "/landing";
    }
  },

  checkSession: async () => {
    // Skip if already checked, loading, or authenticated
    const state = get();
    if (state.sessionChecked || state.isLoading || state.isAuthenticated) {
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionChecked: true,
        });
        return;
      }

      const data = await response.json();

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
      });
    } catch (error) {
      console.error("Check session error:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionChecked: true,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
