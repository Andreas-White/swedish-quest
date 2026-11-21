"use client";

import Link from "next/link";
import { I } from "./icons";

export default function LessonNav({
  prev,
  next,
  back,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
  back: string;
}) {
  return (
    <nav className="lnav" aria-label="Lesson navigation">
      {prev ? (
        <Link href={prev.href} className="nbtn">{I.left(15)}<span>{prev.label}</span></Link>
      ) : (
        <Link href={back} className="nbtn ghost">{I.left(15)}<span>Chapters</span></Link>
      )}
      {next ? (
        <Link href={next.href} className="nbtn primary"><span>{next.label}</span>{I.right(15)}</Link>
      ) : null}
    </nav>
  );
}
