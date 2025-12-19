// Theme system for CozyRSS
// Each theme defines CSS variable values (RGB format for Tailwind compatibility)

export interface ThemeColors {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  sidebarBg: string;
  card: string;
  cardForeground: string;
  success: string;
  warning: string;
  destructive: string;
}

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
}

export interface CustomTheme extends Theme {
  isCustom: true;
  createdAt: number;
}

// Light themes
const defaultLight: Theme = {
  id: "default",
  name: "Default",
  isDark: false,
  colors: {
    background: "251 251 249",
    foreground: "28 27 24",
    muted: "245 245 243",
    mutedForeground: "135 134 127",
    accent: "130 159 123",
    accentForeground: "255 255 255",
    border: "235 235 232",
    sidebarBg: "245 245 243",
    card: "255 255 255",
    cardForeground: "28 27 24",
    success: "76 140 74",
    warning: "199 138 61",
    destructive: "180 82 82",
  },
};

const cream: Theme = {
  id: "cream",
  name: "Cream",
  isDark: false,
  colors: {
    background: "255 253 247",
    foreground: "45 42 38",
    muted: "250 247 240",
    mutedForeground: "140 135 125",
    accent: "180 140 100",
    accentForeground: "255 255 255",
    border: "240 235 225",
    sidebarBg: "250 247 240",
    card: "255 255 255",
    cardForeground: "45 42 38",
    success: "90 145 85",
    warning: "195 145 70",
    destructive: "175 90 90",
  },
};

const sage: Theme = {
  id: "sage",
  name: "Sage",
  isDark: false,
  colors: {
    background: "248 251 248",
    foreground: "30 35 30",
    muted: "240 245 240",
    mutedForeground: "120 130 120",
    accent: "95 140 95",
    accentForeground: "255 255 255",
    border: "225 235 225",
    sidebarBg: "240 245 240",
    card: "255 255 255",
    cardForeground: "30 35 30",
    success: "80 145 80",
    warning: "185 150 70",
    destructive: "170 85 85",
  },
};

const sand: Theme = {
  id: "sand",
  name: "Sand",
  isDark: false,
  colors: {
    background: "253 251 247",
    foreground: "55 50 40",
    muted: "247 244 238",
    mutedForeground: "145 135 120",
    accent: "175 145 110",
    accentForeground: "255 255 255",
    border: "235 230 220",
    sidebarBg: "247 244 238",
    card: "255 255 255",
    cardForeground: "55 50 40",
    success: "110 150 95",
    warning: "190 150 80",
    destructive: "175 95 85",
  },
};

// Dark themes
const midnight: Theme = {
  id: "midnight",
  name: "Midnight",
  isDark: true,
  colors: {
    background: "18 18 24",
    foreground: "235 235 240",
    muted: "28 28 36",
    mutedForeground: "145 145 160",
    accent: "130 140 200",
    accentForeground: "18 18 24",
    border: "45 45 55",
    sidebarBg: "22 22 30",
    card: "25 25 32",
    cardForeground: "235 235 240",
    success: "95 170 130",
    warning: "210 170 90",
    destructive: "200 100 100",
  },
};

const forest: Theme = {
  id: "forest",
  name: "Forest",
  isDark: true,
  colors: {
    background: "20 25 22",
    foreground: "230 240 232",
    muted: "30 38 32",
    mutedForeground: "140 160 145",
    accent: "120 175 130",
    accentForeground: "20 25 22",
    border: "45 55 48",
    sidebarBg: "25 32 27",
    card: "28 35 30",
    cardForeground: "230 240 232",
    success: "100 180 120",
    warning: "200 165 85",
    destructive: "195 95 95",
  },
};

const ocean: Theme = {
  id: "ocean",
  name: "Ocean",
  isDark: true,
  colors: {
    background: "18 22 28",
    foreground: "230 238 245",
    muted: "26 32 42",
    mutedForeground: "135 155 175",
    accent: "100 160 200",
    accentForeground: "18 22 28",
    border: "40 50 65",
    sidebarBg: "22 28 36",
    card: "24 30 40",
    cardForeground: "230 238 245",
    success: "90 175 140",
    warning: "205 170 95",
    destructive: "195 100 105",
  },
};

const lavender: Theme = {
  id: "lavender",
  name: "Lavender",
  isDark: true,
  colors: {
    background: "22 20 28",
    foreground: "240 235 245",
    muted: "32 28 42",
    mutedForeground: "155 145 170",
    accent: "160 140 200",
    accentForeground: "22 20 28",
    border: "50 45 65",
    sidebarBg: "28 25 35",
    card: "30 27 38",
    cardForeground: "240 235 245",
    success: "130 175 140",
    warning: "200 170 100",
    destructive: "195 105 115",
  },
};

export const CURATED_THEMES: Theme[] = [
  defaultLight,
  cream,
  sage,
  sand,
  midnight,
  forest,
  ocean,
  lavender,
];

export const LIGHT_THEMES = CURATED_THEMES.filter((t) => !t.isDark);
export const DARK_THEMES = CURATED_THEMES.filter((t) => t.isDark);

export function getThemeById(id: string): Theme | undefined {
  return CURATED_THEMES.find((t) => t.id === id);
}

// Generate a cohesive theme from a single accent color
export function generateThemeFromAccent(
  accentHex: string,
  isDark: boolean,
  name: string
): CustomTheme {
  const rgb = hexToRgb(accentHex);
  const accent = `${rgb.r} ${rgb.g} ${rgb.b}`;

  // Generate complementary colors based on the accent
  const baseTheme = isDark ? midnight : defaultLight;

  return {
    id: `custom-${Date.now()}`,
    name,
    isDark,
    isCustom: true,
    createdAt: Date.now(),
    colors: {
      ...baseTheme.colors,
      accent,
      accentForeground: isDark ? "18 18 24" : "255 255 255",
    },
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 130, g: 159, b: 123 }; // Default to sage green
}

// Apply theme by setting CSS variables on document root
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--foreground", theme.colors.foreground);
  root.style.setProperty("--muted", theme.colors.muted);
  root.style.setProperty("--muted-foreground", theme.colors.mutedForeground);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--accent-foreground", theme.colors.accentForeground);
  root.style.setProperty("--border", theme.colors.border);
  root.style.setProperty("--sidebar-bg", theme.colors.sidebarBg);
  root.style.setProperty("--card", theme.colors.card);
  root.style.setProperty("--card-foreground", theme.colors.cardForeground);
  root.style.setProperty("--success", theme.colors.success);
  root.style.setProperty("--warning", theme.colors.warning);
  root.style.setProperty("--destructive", theme.colors.destructive);

  // Toggle dark class for Tailwind dark mode
  if (theme.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
