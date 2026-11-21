import { z } from "zod";

// POST /api/tts — Google Cloud TTS upgrade path with filesystem cache.
// v1 behavior: if GOOGLE_TTS_CREDENTIALS is unset, return 501 with setup
// instructions. Client falls back to Web Speech API (lib/tts.ts).

const Body = z.object({ text: z.string().min(1).max(2000), lang: z.string().default("sv-SE") });

export async function POST(req: Request): Promise<Response> {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  if (!process.env.GOOGLE_TTS_CREDENTIALS) {
    return Response.json(
      {
        error: "Server TTS not configured",
        hint: "Set GOOGLE_TTS_CREDENTIALS + GOOGLE_TTS_VOICE, or use Web Speech API fallback.",
      },
      { status: 501 },
    );
  }
  // TODO: call google cloud text-to-speech, cache mp3 under /public/audio/<hash>.mp3
  return Response.json({ error: "Not implemented yet" }, { status: 501 });
}
