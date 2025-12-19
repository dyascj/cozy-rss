import { create } from "zustand";
import {
  Theme as ColorTheme,
  CustomTheme,
  CURATED_THEMES,
  getThemeById,
  applyTheme,
} from "@/lib/themes";

export type ThemeMode = "light" | "dark" | "system";
// Backward compatibility alias
export type Theme = ThemeMode;
export type FontSize = "small" | "medium" | "large";
export type SwipeAction = "star" | "readLater" | "markRead" | "none";

interface SettingsState {
  themeMode: ThemeMode;
  activeThemeId: string;
  customThemes: CustomTheme[];
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
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setActiveTheme: (themeId: string) => Promise<void>;
  addCustomTheme: (theme: CustomTheme) => Promise<void>;
  removeCustomTheme: (themeId: string) => Promise<void>;
  setFontSize: (fontSize: FontSize) => Promise<void>;
  setMarkAsReadOnSelect: (value: boolean) => Promise<void>;
  setDefaultRefreshInterval: (minutes: number) => Promise<void>;
  setMaxArticlesPerFeed: (count: number) => Promise<void>;
  setCompactMode: (value: boolean) => Promise<void>;
  setSwipeEnabled: (value: boolean) => Promise<void>;
  setSwipeLeftAction: (action: SwipeAction) => Promise<void>;
  setSwipeRightAction: (action: SwipeAction) => Promise<void>;
  getActiveTheme: () => ColorTheme | CustomTheme | undefined;
  applyCurrentTheme: () => void;
  reset: () => void;
}

const defaultSettings: Omit<SettingsState, "isLoading" | "isInitialized" | "error"> = {
  themeMode: "system",
  activeThemeId: "default",
  customThemes: [],
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

        // Parse custom themes from JSON if present
        let customThemes: CustomTheme[] = [];
        if (settings?.customThemes) {
          try {
            customThemes =
              typeof settings.customThemes === "string"
                ? JSON.parse(settings.customThemes)
                : settings.customThemes;
          } catch {
            customThemes = [];
          }
        }

        set({
          themeMode: settings?.themeMode || settings?.theme || defaultSettings.themeMode,
          activeThemeId: settings?.activeThemeId || defaultSettings.activeThemeId,
          customThemes,
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

        // Apply theme after loading
        get().applyCurrentTheme();
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

    setThemeMode: async (mode) => {
      const prev = get().themeMode;
      set({ themeMode: mode });
      get().applyCurrentTheme();
      const success = await updateSetting("themeMode", mode);
      if (!success) {
        set({ themeMode: prev });
        get().applyCurrentTheme();
      }
    },

    setActiveTheme: async (themeId) => {
      const prev = get().activeThemeId;
      set({ activeThemeId: themeId });
      get().applyCurrentTheme();
      const success = await updateSetting("activeThemeId", themeId);
      if (!success) {
        set({ activeThemeId: prev });
        get().applyCurrentTheme();
      }
    },

    addCustomTheme: async (theme) => {
      const current = get().customThemes;
      // Limit to 3 custom themes
      if (current.length >= 3) {
        return;
      }
      const updated = [...current, theme];
      set({ customThemes: updated });
      const success = await updateSetting("customThemes", JSON.stringify(updated));
      if (!success) {
        set({ customThemes: current });
      }
    },

    removeCustomTheme: async (themeId) => {
      const current = get().customThemes;
      const updated = current.filter((t) => t.id !== themeId);
      set({ customThemes: updated });

      // If the removed theme was active, switch to default
      if (get().activeThemeId === themeId) {
        set({ activeThemeId: "default" });
        get().applyCurrentTheme();
      }

      const success = await updateSetting("customThemes", JSON.stringify(updated));
      if (!success) {
        set({ customThemes: current });
      }
    },

    getActiveTheme: () => {
      const { activeThemeId, customThemes, themeMode } = get();

      // Check custom themes first
      const customTheme = customThemes.find((t) => t.id === activeThemeId);
      if (customTheme) return customTheme;

      // Check curated themes
      const curatedTheme = getThemeById(activeThemeId);
      if (curatedTheme) return curatedTheme;

      // Fallback based on theme mode
      if (themeMode === "system") {
        const prefersDark =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? getThemeById("midnight") : getThemeById("default");
      }

      return themeMode === "dark"
        ? getThemeById("midnight")
        : getThemeById("default");
    },

    applyCurrentTheme: () => {
      if (typeof window === "undefined") return;

      const { themeMode } = get();
      let theme = get().getActiveTheme();

      if (!theme) {
        theme = getThemeById("default");
      }

      if (theme) {
        // Handle system preference
        if (themeMode === "system") {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          // If theme doesn't match system preference, find a matching one
          if (prefersDark !== theme.isDark) {
            const matchingTheme = CURATED_THEMES.find(
              (t) => t.isDark === prefersDark
            );
            if (matchingTheme) theme = matchingTheme;
          }
        }
        applyTheme(theme);
      }
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
