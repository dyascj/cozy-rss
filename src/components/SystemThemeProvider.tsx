"use client";

import { useEffect } from "react";

/**
 * A simple theme provider for public pages (landing, signin, signup, onboarding)
 * that respects the user's system preference for light/dark mode.
 */
export function SystemThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      root.classList.toggle("dark", e.matches);
    };

    // Set initial theme
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return <>{children}</>;
}
