import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getChapterTest, getCurriculum } from "@/lib/content";
import { prisma } from "@/lib/db";
import { lessonKey } from "@/lib/gating";
import Quiz from "@/components/Quiz";
import LessonNav from "@/components/LessonNav";

export default async function TestPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const curriculum = await getCurriculum();
  const ci = curriculum.findIndex((c) => c.slug === chapter);
  if (ci < 0) notFound();

  const rows = await prisma.lessonProgress.findMany({ where: { userId: session.user.id } });
  const passed = new Set(rows.filter((r) => r.passed).map((r) => lessonKey(r.chapterSlug, r.lessonSlug)));
  const lessonsDone = curriculum[ci].lessons.every((l) => passed.has(lessonKey(chapter, l)));
  if (!lessonsDone) redirect("/");

  const test = await getChapterTest(chapter);
  const nextChapter = curriculum[ci + 1];
  const need = Math.ceil(test.length * 0.6);
  return (
    <div className="anim">
      <h1>Chapter test: {curriculum[ci].title}</h1>
      <p className="lock">{test.length} questions. Need {need} correct to unlock the next chapter. Scoring kept from prototype.</p>
      <Quiz exercises={test} chapterIndex={ci} chapterSlug={chapter} lessonSlug="__test__" kind="test"
        nextHref={nextChapter ? `/lesson/${nextChapter.slug}/${nextChapter.lessons[0]}` : "/"}
        nextLabel={nextChapter ? `Next: ${nextChapter.title}` : "Back to chapters ✓"} />
      <LessonNav next={nextChapter ? { href: `/chapter/${nextChapter.slug}`, label: `Next: ${nextChapter.title}` } : undefined} back="/" />
    </div>
  );
}
