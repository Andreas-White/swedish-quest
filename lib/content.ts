import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

const LessonMeta = z.object({
  slug: z.string(),
  title: z.string(),
  objective: z.string().default(""),
  minutes: z.number().default(8),
  points: z.number().optional(), // per-correct; defaults to chapter scale
});
export type LessonMeta = z.infer<typeof LessonMeta>;

const ChapterIndexEntry = z.object({
  slug: z.string(),
  title: z.string(),
  cefr: z.string().default(""),
  summary: z.string().default(""),
  lessons: z.array(z.string()), // lesson slugs in order
  hasTest: z.boolean().default(true),
});
export type ChapterIndexEntry = z.infer<typeof ChapterIndexEntry>;

export async function getCurriculum(): Promise<ChapterIndexEntry[]> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, "curriculum.json"), "utf8");
  const parsed = z.array(ChapterIndexEntry).parse(JSON.parse(raw));
  return parsed;
}

export type LessonDoc = {
  meta: LessonMeta;
  markdown: string;
};

export async function getLesson(chapterSlug: string, lessonSlug: string): Promise<LessonDoc> {
  const file = path.join(CONTENT_DIR, chapterSlug, `${lessonSlug}.md`);
  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  const meta = LessonMeta.parse({ slug: lessonSlug, ...data });
  return { meta, markdown: content };
}

// ---- Exercises & tests: pure resource files, never hardcoded ----
const ChoiceExercise = z.object({
  kind: z.literal("choice"),
  prompt: z.string(),
  options: z.tuple([z.string(), z.string(), z.string()]),
  explanations: z.tuple([z.string(), z.string(), z.string()]),
});
const BuildExercise = z.object({
  kind: z.literal("build"),
  prompt: z.string(),
  sentence: z.string(),
  distractor: z.string(),
  distractorWhy: z.string(),
  why: z.string(),
});
export const Exercise = z.union([ChoiceExercise, BuildExercise]);
export type Exercise = z.infer<typeof Exercise>;

export async function getExercises(chapterSlug: string, lessonSlug: string): Promise<Exercise[]> {
  const file = path.join(CONTENT_DIR, chapterSlug, `${lessonSlug}.exercises.json`);
  const raw = await fs.readFile(file, "utf8");
  return z.array(Exercise).parse(JSON.parse(raw));
}

export async function getChapterTest(chapterSlug: string): Promise<Exercise[]> {
  const file = path.join(CONTENT_DIR, chapterSlug, "test.json");
  const raw = await fs.readFile(file, "utf8");
  return z.array(Exercise).parse(JSON.parse(raw));
}
