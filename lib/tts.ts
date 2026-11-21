"use client";

// Client voice-over: Web Speech API by default (free, same as prototype).
// Swedish segments use sv-SE voice when the device has one, else English fallback.
// Upgrade path: ttsServerSpeak() calls /api/tts (Google Cloud TTS) with caching.

export type TtsSegment = { text: string; swedish: boolean };

/** Split narration on {Swedish} markers, exactly like the prototype NAR logic. */
export function splitSegments(paragraph: string): TtsSegment[] {
  const out: TtsSegment[] = [];
  for (const part of paragraph.split(/(\{[^}]+\})/)) {
    if (!part.trim()) continue;
    const swedish = part.startsWith("{");
    out.push({ text: swedish ? part.slice(1, -1) : part, swedish });
  }
  return out;
}

function pickVoice(langPrefix: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(langPrefix)) ?? null;
}

export function speakSegments(
  segments: TtsSegment[],
  opts: { rate?: number; englishVoiceName?: string } = {},
  onState?: (msg: string) => void,
): () => void {
  const synth = window.speechSynthesis;
  synth.cancel();
  let cancelled = false;
  const rate = opts.rate ?? 0.9;

  const run = (i: number) => {
    if (cancelled || i >= segments.length) {
      onState?.(i >= segments.length ? "Finished." : "");
      return;
    }
    const s = segments[i];
    const u = new SpeechSynthesisUtterance(s.text);
    u.rate = rate;
    u.pitch = 0.95;
    if (s.swedish) {
      const v = pickVoice("sv");
      u.lang = "sv-SE";
      if (v) u.voice = v;
    } else {
      u.lang = "en-US";
      if (opts.englishVoiceName) {
        const ev = synth.getVoices().find((v) => v.name === opts.englishVoiceName);
        if (ev) {
          u.voice = ev;
          u.lang = ev.lang;
        }
      }
    }
    onState?.(`Part ${i + 1} of ${segments.length}`);
    u.onend = () => run(i + 1);
    u.onerror = () => run(i + 1);
    synth.speak(u);
  };
  // Voices may load async; start after they arrive if needed.
  if (synth.getVoices().length === 0) {
    const h = () => run(0);
    synth.onvoiceschanged = h;
    setTimeout(() => {
      if (synth.getVoices().length > 0 || cancelled) return;
      run(0);
    }, 800);
  } else {
    run(0);
  }
  return () => {
    cancelled = true;
    synth.cancel();
  };
}

/** Server TTS (Google Cloud) upgrade path. Returns audio URL or throws. */
export async function ttsServerSpeak(text: string, lang = "sv-SE"): Promise<string> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });
  if (!res.ok) throw new Error(`Server TTS unavailable (${res.status})`);
  const { audioUrl } = (await res.json()) as { audioUrl: string };
  return audioUrl;
}
