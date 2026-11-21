"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MODE_KEY, THEME_KEY, resolveMode, type Mode, type ThemeId } from "@/lib/theme";

const Ctx = createContext<{ theme: ThemeId; mode: Mode; setTheme: (t: ThemeId) => void; setMode: (m: Mode) => void }>(
  { theme: "abyss", mode: "auto", setTheme: () => {}, setMode: () => {} },
);

export function useTheme() {
  return useContext(Ctx);
}

function apply(theme: ThemeId, mode: Mode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.mode = resolveMode(mode);
  try {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(MODE_KEY, mode);
  } catch {}
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("abyss");
  const [mode, setModeState] = useState<Mode>("auto");

  useEffect(() => {
    let t: ThemeId = "abyss";
    let m: Mode = "auto";
    try {
      const st = localStorage.getItem(THEME_KEY);
      const sm = localStorage.getItem(MODE_KEY);
      if (st === "abyss" || st === "ember" || st === "lagoon" || st === "dawn") t = st;
      if (sm === "light" || sm === "dark" || sm === "auto") m = sm;
    } catch {}
    setThemeState(t);
    setModeState(m);
    apply(t, m);
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      try {
        const cur = (localStorage.getItem(MODE_KEY) ?? "auto") as Mode;
        if (cur === "auto") apply((localStorage.getItem(THEME_KEY) ?? "abyss") as ThemeId, "auto");
      } catch {}
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Ctx.Provider
      value={{
        theme,
        mode,
        setTheme: (t) => { setThemeState(t); apply(t, mode); },
        setMode: (m) => { setModeState(m); apply(theme, m); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
