"use client";

import { create } from "zustand";
import { useFeedStore } from "./feedStore";
import { useArticleStore } from "./articleStore";
import { useTagStore } from "./tagStore";
import { useSettingsStore } from "./settingsStore";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  error: string | null;
}

interface AuthActions {
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

      // Redirect to signin page
      window.location.href = "/signin";
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
