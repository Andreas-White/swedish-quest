import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurriculum } from "@/lib/content";
import { THEMES } from "@/lib/theme";
import LessonNav from "@/components/LessonNav";

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curriculum = await getCurriculum();
  const ci = curriculum.findIndex((c) => c.slug === slug);
  if (ci < 0) notFound();
  const ch = curriculum[ci];
  return (
    <div className="anim">
      <div className="hero">
        <img src={THEMES[ci % THEMES.length].image} alt="" />
        <div className="ov">
          <h1>{ch.title}</h1>
          <p>{ch.cefr} · {ch.summary}</p>
        </div>
      </div>
      <div className="card">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {ch.lessons.map((l, i) => (
            <li key={l}><Link className="lrow" href={`/lesson/${ch.slug}/${l}`}>Lesson {i + 1}: {l}</Link></li>
          ))}
          <li><Link className="lrow" href={`/test/${ch.slug}`}>Chapter test →</Link></li>
        </ul>
      </div>
      <LessonNav back="/" next={curriculum[ci + 1] ? { href: `/chapter/${curriculum[ci + 1].slug}`, label: `Next: ${curriculum[ci + 1].title}` } : undefined} />
    </div>
  );
}
