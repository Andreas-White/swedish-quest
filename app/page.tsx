import Link from "next/link";
import { auth } from "@/auth";
import { getCurriculum } from "@/lib/content";
import { prisma } from "@/lib/db";
import { lessonKey } from "@/lib/gating";
import { formatScore, totalPoints } from "@/lib/scoring";
import { THEMES } from "@/lib/theme";
import { I } from "@/components/icons";

function dayStreak(dates: string[]): number {
  const set = new Set(dates);
  const d = new Date();
  // streak counts back from today, or yesterday if nothing done yet today
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default async function Home() {
  const session = await auth();
  const curriculum = await getCurriculum();

  let progress: Record<string, { correct: number; passed: boolean; score: number }> = {};
  let streak = 0;
  if (session?.user?.id) {
    const rows = await prisma.lessonProgress.findMany({ where: { userId: session.user.id } });
    for (const r of rows) progress[lessonKey(r.chapterSlug, r.lessonSlug)] = { correct: r.correct, passed: r.passed, score: r.score };
    const att = await prisma.attempt.findMany({
      where: { userId: session.user.id, passed: true },
      orderBy: { createdAt: "desc" },
      take: 120,
      select: { createdAt: true },
    });
    streak = dayStreak(att.map((a) => a.createdAt.toISOString().slice(0, 10)));
  }

  // Strict sequential: first unpassed lesson/test is the frontier.
  let frontierFound = false;
  const states = curriculum.map((ch) => {
    const lessons = ch.lessons.map((l) => {
      const p = progress[lessonKey(ch.slug, l)];
      if (!p?.passed && !frontierFound) {
        frontierFound = true;
        return { slug: l, unlocked: true, passed: false, score: 0 };
      }
      if (p?.passed) return { slug: l, unlocked: true, passed: true, score: p.score };
      return { slug: l, unlocked: false, passed: false, score: 0 };
    });
    const tp = progress[lessonKey(ch.slug, "__test__")];
    const testUnlocked = !frontierFound && lessons.every((l) => l.passed);
    if (!tp?.passed && testUnlocked) frontierFound = true;
    return { ch, lessons, testPassed: !!tp?.passed, testUnlocked };
  });

  const total = totalPoints(Object.values(progress).map((p) => p.score));
  const passedCount = curriculum.filter((_, i) => states[i].testPassed).length;

  return (
    <div className="anim">
      <div className="hero">
        <img src={THEMES[0].image} alt="" />
        <div className="ov">
          <h1>Swedish Quest</h1>
          <p>From 0 to 100 in Swedish — 20 chapters. {session?.user ? `Welcome, ${session.user.name ?? session.user.email}.` : "Log in to save progress."}</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span>{I.trophy(15)} Total points</span><b>{formatScore(total)}</b></div>
        <div className="stat"><span>{I.check(15)} Chapters passed</span><b>{passedCount} / {curriculum.length}</b></div>
        <div className="stat"><span className="streak">{I.flame(15)} Day streak</span><b>{streak}</b></div>
      </div>

      {!session?.user ? (
        <div className="card">
          <b>Start your quest.</b>
          <p className="lock">Create a free account — email + password, magic link, or Google. Chapter 1 unlocks immediately.</p>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <Link href="/signup" className="nbtn primary">Sign up free</Link>
            <Link href="/login" className="nbtn">Log in</Link>
          </div>
        </div>
      ) : null}

      {states.map(({ ch, lessons, testPassed, testUnlocked }, ci) => (
        <div className="card chap" key={ch.slug}>
          <div className="thumb"><img src={THEMES[ci % THEMES.length].image} alt="" loading="lazy" /></div>
          <h2>{ch.title}</h2>
          <p className="lock">{ch.cefr} · {ch.summary}</p>
          <div className="bar"><i style={{ width: `${(100 * (lessons.filter((l) => l.passed).length + (testPassed ? 1 : 0))) / (lessons.length + 1)}%` }} /></div>
          {lessons.map((l, li) => (
            <div key={l.slug}>
              {l.unlocked ? (
                <Link className={`lrow${l.passed ? " done" : ""}`} href={`/lesson/${ch.slug}/${l.slug}`}>
                  {l.passed ? I.check(15) : I.play(15)}
                  <span>Lesson {li + 1}: {l.slug}{l.passed ? ` · ${formatScore(l.score)}` : ""}</span>
                </Link>
              ) : (
                <span className="lrow lock">{I.lock(15)}<span>Lesson {li + 1}: {l.slug} — finish previous first</span></span>
              )}
            </div>
          ))}
          <div>
            {testPassed ? (
              <span className="lrow done">{I.check(15)}<span>Chapter test passed ✓</span></span>
            ) : testUnlocked ? (
              <Link className="lrow" href={`/test/${ch.slug}`}>{I.trophy(15)}<span>Take the chapter test →</span></Link>
            ) : (
              <span className="lrow lock">{I.lock(15)}<span>Chapter test — finish all lessons first</span></span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
