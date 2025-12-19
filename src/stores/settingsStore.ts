import { create } from "zustand";

export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";
export type SwipeAction = "star" | "readLater" | "markRead" | "none";

interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  markAsReadOnSelect: boolean;
  defaultRefreshInterval: number;
  maxArticlesPerFeed: number;
  compactMode: boolean;
  swipeEnabled: boolean;
  swipeLeftAction: SwipeAction;
  swipeRightAction: SwipeAction;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface SettingsActions {
  initialize: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setFontSize: (fontSize: FontSize) => Promise<void>;
  setMarkAsReadOnSelect: (value: boolean) => Promise<void>;
  setDefaultRefreshInterval: (minutes: number) => Promise<void>;
  setMaxArticlesPerFeed: (count: number) => Promise<void>;
  setCompactMode: (value: boolean) => Promise<void>;
  setSwipeEnabled: (value: boolean) => Promise<void>;
  setSwipeLeftAction: (action: SwipeAction) => Promise<void>;
  setSwipeRightAction: (action: SwipeAction) => Promise<void>;
  reset: () => void;
}

const defaultSettings: Omit<SettingsState, "isLoading" | "isInitialized" | "error"> = {
  theme: "system",
  fontSize: "medium",
  markAsReadOnSelect: true,
  defaultRefreshInterval: 30,
  maxArticlesPerFeed: 50,
  compactMode: false,
  swipeEnabled: true,
  swipeLeftAction: "readLater",
  swipeRightAction: "markRead",
};

const initialState: SettingsState = {
  ...defaultSettings,
  isLoading: false,
  isInitialized: false,
  error: null,
};

async function updateSetting(key: string, value: unknown): Promise<boolean> {
  try {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to update setting:", error);
    return false;
  }
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  (set, get) => ({
    ...initialState,

    initialize: async () => {
      if (get().isInitialized || get().isLoading) return;

      set({ isLoading: true, error: null });

      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");

        const { settings } = await res.json();

        set({
          theme: settings?.theme || defaultSettings.theme,
          fontSize: settings?.fontSize || defaultSettings.fontSize,
          markAsReadOnSelect:
            settings?.markAsReadOnSelect ?? defaultSettings.markAsReadOnSelect,
          defaultRefreshInterval:
            settings?.defaultRefreshInterval ??
            defaultSettings.defaultRefreshInterval,
          maxArticlesPerFeed:
            settings?.maxArticlesPerFeed ?? defaultSettings.maxArticlesPerFeed,
          compactMode: settings?.compactMode ?? defaultSettings.compactMode,
          swipeEnabled: settings?.swipeEnabled ?? defaultSettings.swipeEnabled,
          swipeLeftAction:
            settings?.swipeLeftAction || defaultSettings.swipeLeftAction,
          swipeRightAction:
            settings?.swipeRightAction || defaultSettings.swipeRightAction,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Failed to initialize settings store:", error);
        set({
          isLoading: false,
          isInitialized: true, // Still mark as initialized to use defaults
          error:
            error instanceof Error ? error.message : "Failed to load settings",
        });
      }
    },

    setTheme: async (theme) => {
      const prev = get().theme;
      set({ theme });
      const success = await updateSetting("theme", theme);
      if (!success) set({ theme: prev });
    },

    setFontSize: async (fontSize) => {
      const prev = get().fontSize;
      set({ fontSize });
      const success = await updateSetting("fontSize", fontSize);
      if (!success) set({ fontSize: prev });
    },

    setMarkAsReadOnSelect: async (value) => {
      const prev = get().markAsReadOnSelect;
      set({ markAsReadOnSelect: value });
      const success = await updateSetting("markAsReadOnSelect", value);
      if (!success) set({ markAsReadOnSelect: prev });
    },

    setDefaultRefreshInterval: async (minutes) => {
      const prev = get().defaultRefreshInterval;
      set({ defaultRefreshInterval: minutes });
      const success = await updateSetting("defaultRefreshInterval", minutes);
      if (!success) set({ defaultRefreshInterval: prev });
    },

    setMaxArticlesPerFeed: async (count) => {
      const prev = get().maxArticlesPerFeed;
      set({ maxArticlesPerFeed: count });
      const success = await updateSetting("maxArticlesPerFeed", count);
      if (!success) set({ maxArticlesPerFeed: prev });
    },

    setCompactMode: async (value) => {
      const prev = get().compactMode;
      set({ compactMode: value });
      const success = await updateSetting("compactMode", value);
      if (!success) set({ compactMode: prev });
    },

    setSwipeEnabled: async (value) => {
      const prev = get().swipeEnabled;
      set({ swipeEnabled: value });
      const success = await updateSetting("swipeEnabled", value);
      if (!success) set({ swipeEnabled: prev });
    },

    setSwipeLeftAction: async (action) => {
      const prev = get().swipeLeftAction;
      set({ swipeLeftAction: action });
      const success = await updateSetting("swipeLeftAction", action);
      if (!success) set({ swipeLeftAction: prev });
    },

    setSwipeRightAction: async (action) => {
      const prev = get().swipeRightAction;
      set({ swipeRightAction: action });
      const success = await updateSetting("swipeRightAction", action);
      if (!success) set({ swipeRightAction: prev });
    },

    reset: () => {
      set(initialState);
    },
  })
);
