"use client";

import { useRef, useState } from "react";
import { I } from "./icons";

function pickVoice(langPrefix: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(langPrefix)) ?? null;
}

/** Small sound icon: click to hear `text` in Swedish (sv-SE) or English. */
export default function SpeakButton({
  text,
  swedish,
  label,
  size = "md",
}: {
  text: string;
  swedish?: boolean;
  label?: string;
  size?: "sm" | "md";
}) {
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

const SV_HINT = /\b(jag|du|han|hon|vi|ni|de|inte|och|att|en|ett|ett|är|har|vill|kan|måste|ska|hej|tack|fika|var|vad|vem|när|här|med|till|från|som|den|det|dig|mig|heter|heta|bor|äter|äta|läser|läsa|vara|vara|ha|bo|smörgås|flicka|tidning|hus|äpple|barn|bil|bok|hund|då)\b/i;

  // Auto-detect Swedish when not specified: åäö, {braces}, or common words.
  const sv = swedish ?? (/[åäöÅÄÖ]/.test(text) || text.startsWith("{") || SV_HINT.test(text));

  function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      if (timer.current) clearTimeout(timer.current);
      return;
    }
    synth.cancel();
    const clean = text.replace(/^\{|\}$/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 0.9;
    u.pitch = 0.95;
    if (sv) {
      const v = pickVoice("sv");
      u.lang = "sv-SE";
      if (v) u.voice = v;
    } else {
      u.lang = "en-US";
    }
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSpeaking(false), 8000);
  }

  return (
    <button
      type="button"
      className={`speak${speaking ? " on" : ""} ${size}`}
      onClick={onClick}
      aria-label={speaking ? "Stop" : `Hear: ${clean(text)}`}
      title={speaking ? "Stop" : "Hear it"}
    >
      {I.speaker(size === "sm" ? 14 : 16)}
      {label ? <span>{label}</span> : null}
    </button>
  );
}

function clean(t: string) {
  return t.replace(/^\{|\}$/g, "").slice(0, 60);
}
