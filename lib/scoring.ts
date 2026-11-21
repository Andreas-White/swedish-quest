// Scoring ported 1:1 from Learn_Swedish.html prototype (L/Q/B/pick/check/fin).
// Rules: correct => +c, wrong => -(2*c). Pass => >= 6/10 correct.
// Prototype: l.c = [10,15,20,25,30][i] for its 5 lessons.
// Scale for 20 chapters: ramp 10..30 over chapters 1-5, then flat 30.
// Keeps early motivation and avoids -210 swings on chapter 20.

export const PASS_MARK = 6;
export const QUESTIONS_PER_QUIZ = 10;

/** Pass = at least 60% correct. For classic 10-question quizzes this is exactly 6/10. */
export function passMarkFor(total: number): number {
  return Math.ceil(total * 0.6);
}

export function isPassing(correct: number, total: number): boolean {
  return correct >= passMarkFor(total);
}

export function pointsPerCorrect(chapterIndex0: number): number {
  return Math.min(10 + 5 * chapterIndex0, 30);
}

export function formatScore(n: number): string {
  if (n < 0) return `\u2212${Math.abs(n)}`;
  if (n > 0) return `+${n}`;
  return "0";
}

export type AnswerResult = {
  correctCount: number;
  points: number;
  passed: boolean;
};

/** Score one quiz/test given list of booleans. Pass = 60% correct. */
export function scoreQuiz(results: boolean[], chapterIndex0: number): AnswerResult {
  const c = pointsPerCorrect(chapterIndex0);
  let correctCount = 0;
  let points = 0;
  for (const ok of results) {
    if (ok) {
      correctCount += 1;
      points += c;
    } else {
      points -= 2 * c;
    }
  }
  return { correctCount, points, passed: isPassing(correctCount, results.length) };
}

export function totalPoints(scores: (number | null | undefined)[]): number {
  return scores.reduce<number>((a, s) => a + (s ?? 0), 0);
}
