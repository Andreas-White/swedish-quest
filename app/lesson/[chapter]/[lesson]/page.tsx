import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurriculum, getExercises, getLesson } from "@/lib/content";
import { prisma } from "@/lib/db";
import { isLessonUnlocked, lessonKey } from "@/lib/gating";
import Quiz from "@/components/Quiz";
import TtsButton from "@/components/TtsButton";
import Prose from "@/components/Prose";
import LessonNav from "@/components/LessonNav";

export default async function LessonPage({ params }: { params: Promise<{ chapter: string; lesson: string }> }) {
  const { chapter, lesson } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const curriculum = await getCurriculum();
  const ci = curriculum.findIndex((c) => c.slug === chapter);
  if (ci < 0) notFound();
  const li = curriculum[ci].lessons.indexOf(lesson);
  if (li < 0) notFound();

  const rows = await prisma.lessonProgress.findMany({ where: { userId: session.user.id } });
  const progress: Record<string, { correct: number; passed: boolean; score: number }> = {};
  for (const r of rows) progress[lessonKey(r.chapterSlug, r.lessonSlug)] = { correct: r.correct, passed: r.passed, score: r.score };
  if (!isLessonUnlocked(curriculum, ci, li, progress)) redirect("/");

  const doc = await getLesson(chapter, lesson);
  const exercises = await getExercises(chapter, lesson);

  const lessons = curriculum[ci].lessons;
  const prev = li > 0 ? { href: `/lesson/${chapter}/${lessons[li - 1]}`, label: lessons[li - 1] } : undefined;
  const next =
    li < lessons.length - 1
      ? { href: `/lesson/${chapter}/${lessons[li + 1]}`, label: `Next: ${lessons[li + 1]}` }
      : { href: `/test/${chapter}`, label: "Chapter test" };

  return (
    <div className="anim">
      <TtsButton text={doc.markdown.slice(0, 1200)} />
      <div className="card">
        <p className="lock">{curriculum[ci].title} · Lesson {li + 1} of {lessons.length}</p>
        <h1>{doc.meta.title}</h1>
        <p className="lock">{doc.meta.objective}</p>
        <Prose markdown={doc.markdown} />
      </div>
      <h2>Exercises ({exercises.length})</h2>
      <Quiz exercises={exercises} chapterIndex={ci} chapterSlug={chapter} lessonSlug={lesson} kind="lesson" nextHref={next.href} nextLabel={next.label} />
      <LessonNav prev={prev} next={next} back="/" />
    </div>
  );
}
