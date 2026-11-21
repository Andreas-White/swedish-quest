"use client";

import { useRef, useState } from "react";
import { speakSegments, splitSegments } from "@/lib/tts";
import { I } from "./icons";

export default function TtsButton({ text, rate = 0.9 }: { text: string; rate?: number }) {
  const [msg, setMsg] = useState("");
  const stopRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (playing) {
      stopRef.current?.();
      setPlaying(false);
      setMsg("Paused.");
      return;
    }
    const segs = splitSegments(text);
    stopRef.current = speakSegments(segs, { rate }, (m) => setMsg(m));
    setPlaying(true);
    setTimeout(() => setPlaying(false), segs.length * 4000);
  }

  if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
    return <p className="lock">Your browser does not support reading aloud.</p>;
  }

  return (
    <div className="card">
      <b style={{ display: "flex", alignItems: "center", gap: 8 }}>{I.ear(18)} Listen to this lesson</b>
      <p className="lock">A calm voice reads the lesson. Swedish in {"{braces}"} uses a Swedish voice when your device has one.</p>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <button className="p" style={{ marginLeft: 0 }} onClick={toggle}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {playing ? I.pause(15) : I.play(15)} {playing ? "Pause" : "Play"}
          </span>
        </button>
        <button onClick={() => { stopRef.current?.(); setPlaying(false); setMsg(""); }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{I.stop(15)} Stop</span>
        </button>
      </div>
      <p aria-live="polite" className="lock">{msg}</p>
    </div>
  );
}
