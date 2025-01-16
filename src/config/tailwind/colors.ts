import { adminTheme } from "../admin.theme";

export const colors = {
  ...adminTheme.colors,
  admin: {
    ...adminTheme.colors.admin,
    border: '#4A5568',
    focus: '#667EEA',
  },
  champagne: "#F7E6D0",
  rose: {
    50: "#FFF0F5",
    100: "#FFE4ED",
    200: "#FFB8D2",
    300: "#FF8CB7",
    400: "#FF609C",
    500: "#FF3481",
    600: "#FF0066",
    700: "#CC0052",
    800: "#99003D",
    900: "#660029",
  },
  burgundy: {
    50: "#FCE8E8",
    100: "#F9D1D1",
    200: "#F3A3A3",
    300: "#ED7575",
    400: "#E74747",
    500: "#E11919",
    600: "#B41414",
    700: "#870F0F",
    800: "#5A0A0A",
    900: "#2D0505",
  },
  cream: "#FAF9F6",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
};