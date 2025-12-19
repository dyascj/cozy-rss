"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const isInitialized = useSettingsStore((state) => state.isInitialized);
  const applyCurrentTheme = useSettingsStore((state) => state.applyCurrentTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Listen for system preference changes when in "system" mode
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (isInitialized) {
          applyCurrentTheme();
        } else {
          // Fallback before settings are loaded
          root.classList.toggle("dark", mediaQuery.matches);
        }
      };
      handleChange();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // For explicit light/dark mode, apply the theme
      if (isInitialized) {
        applyCurrentTheme();
      } else {
        // Fallback before settings are loaded
        root.classList.toggle("dark", themeMode === "dark");
      }
    }
  }, [themeMode, isInitialized, applyCurrentTheme]);

  return <>{children}</>;
}
