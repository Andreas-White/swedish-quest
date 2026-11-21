import { PASS_MARK } from "./scoring";

export type ProgressMap = Record<string, { correct: number; passed: boolean; score: number }>;

export function lessonKey(chapterSlug: string, lessonSlug: string): string {
  return `${chapterSlug}/${lessonSlug}`;
}

// Strict sequential gating: chapter i lesson j unlocked iff everything before passed.
export function isLessonUnlocked(
  curriculum: { slug: string; lessons: string[] }[],
  chapterIdx: number,
  lessonIdx: number,
  progress: ProgressMap,
): boolean {
  if (chapterIdx === 0 && lessonIdx === 0) return true;
  // previous lesson in same chapter
  if (lessonIdx > 0) {
    const prev = progress[lessonKey(curriculum[chapterIdx].slug, curriculum[chapterIdx].lessons[lessonIdx - 1])];
    return !!prev?.passed;
  }
  // first lesson of chapter > 0: need last lesson of previous chapter + its test passed
  const prevChapter = curriculum[chapterIdx - 1];
  const lastLesson = prevChapter.lessons[prevChapter.lessons.length - 1];
  const prevLesson = progress[lessonKey(prevChapter.slug, lastLesson)];
  const prevTest = progress[lessonKey(prevChapter.slug, "__test__")];
  const prevHasTest = true; // every chapter has a test in v1
  if (!prevLesson?.passed) return false;
  if (prevHasTest && !prevTest?.passed) return false;
  return true;
}

export function chapterProgress(
  chapter: { slug: string; lessons: string[] },
  progress: ProgressMap,
): { done: number; total: number } {
  let done = 0;
  for (const l of chapter.lessons) {
    if (progress[lessonKey(chapter.slug, l)]?.passed) done += 1;
  }
  if (progress[lessonKey(chapter.slug, "__test__")]?.passed) done += 1;
  return { done, total: chapter.lessons.length + 1 };
}

export { PASS_MARK };
