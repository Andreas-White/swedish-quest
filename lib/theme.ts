export type ThemeId = "abyss" | "ember" | "lagoon" | "dawn";
export type Mode = "auto" | "light" | "dark";

export const THEMES: { id: ThemeId; name: string; tagline: string; image: string }[] = [
  { id: "abyss", name: "Abyss", tagline: "Deep navy calm", image: "/themes/abyss.webp" },
  { id: "ember", name: "Ember", tagline: "Burgundy warmth", image: "/themes/ember.webp" },
  { id: "lagoon", name: "Lagoon", tagline: "Cyan focus", image: "/themes/lagoon.webp" },
  { id: "dawn", name: "Dawn", tagline: "Blush light", image: "/themes/dawn.webp" },
];

export const THEME_KEY = "sq-theme";
export const MODE_KEY = "sq-mode";

export function resolveMode(mode: Mode): "light" | "dark" {
  if (mode !== "auto") return mode;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
