import { z } from "zod";
import { auth } from "@/auth";
import { getCurriculum } from "@/lib/content";
import { prisma } from "@/lib/db";
import { isLessonUnlocked } from "@/lib/gating";
import { PASS_MARK, isPassing, pointsPerCorrect } from "@/lib/scoring";

const Body = z.object({
  chapterSlug: z.string(),
  lessonSlug: z.string(),
  kind: z.enum(["lesson", "test"]),
  correct: z.number().int().min(0).max(50),
  total: z.number().int().min(1).max(50),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Login required" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
  const { chapterSlug, lessonSlug, kind, correct, total } = parsed.data;

  const curriculum = await getCurriculum();
  const ci = curriculum.findIndex((c) => c.slug === chapterSlug);
  if (ci < 0) return Response.json({ error: "Unknown chapter" }, { status: 404 });

  // Server-side gating: recompute unlock from DB (never trust client).
  const rows = await prisma.lessonProgress.findMany({ where: { userId: session.user.id } });
  const progress: Record<string, { correct: number; passed: boolean; score: number }> = {};
  for (const r of rows) progress[`${r.chapterSlug}/${r.lessonSlug}`] = { correct: r.correct, passed: r.passed, score: r.score };

  if (kind === "lesson") {
    const li = curriculum[ci].lessons.indexOf(lessonSlug);
    if (li < 0) return Response.json({ error: "Unknown lesson" }, { status: 404 });
    if (!isLessonUnlocked(curriculum, ci, li, progress)) {
      return Response.json({ error: "Lesson locked — finish previous first" }, { status: 403 });
    }
  } else {
    const ok = curriculum[ci].lessons.every((l) => progress[`${chapterSlug}/${l}`]?.passed);
    if (!ok) return Response.json({ error: "Finish all lessons before the test" }, { status: 403 });
  }

  // Scoring kept from prototype: +c per correct, −2c per wrong. Pass = 60%.
  const c = pointsPerCorrect(ci);
  const score = correct * c - (total - correct) * 2 * c;
  const passed = isPassing(correct, total);

  await prisma.lessonProgress.upsert({
    where: { userId_chapterSlug_lessonSlug: { userId: session.user.id, chapterSlug, lessonSlug } },
    create: { userId: session.user.id, chapterSlug, lessonSlug, score, correct, total, passed },
    update: { score, correct, total, passed },
  });
  await prisma.attempt.create({
    data: { userId: session.user.id, chapterSlug, lessonSlug, kind, score, correct, total, passed },
  });

  return Response.json({ score, correct, total, passed });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Login required" }, { status: 401 });
  const rows = await prisma.lessonProgress.findMany({ where: { userId: session.user.id } });
  return Response.json({ progress: rows });
}
