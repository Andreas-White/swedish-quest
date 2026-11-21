"use client";

import { THEMES } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";
import { I } from "./icons";

/** Theme image cards + Light/Dark/Auto segmented control. */
export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, mode, setTheme, setMode } = useTheme();
  return (
    <div className={compact ? "tswitch compact" : "tswitch"}>
      <div className="tgrid" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={theme === t.id}
            className={`tcard${theme === t.id ? " sel" : ""}`}
            onClick={() => setTheme(t.id)}
            title={`${t.name} — ${t.tagline}`}
          >
            <img src={t.image} alt="" loading="lazy" />
            <span>{t.name}</span>
            {theme === t.id ? <i className="dot">{I.check(12)}</i> : null}
          </button>
        ))}
      </div>
      <div className="seg" role="radiogroup" aria-label="Mode">
        {(["auto", "light", "dark"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {m === "auto" ? I.auto(14) : m === "light" ? I.sun(14) : I.moon(14)}
            {m[0].toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
