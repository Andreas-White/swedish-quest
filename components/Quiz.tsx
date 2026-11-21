"use client";

import { useState } from "react";
import Link from "next/link";
import type { Exercise } from "@/lib/content";
import { formatScore, isPassing, passMarkFor, pointsPerCorrect } from "@/lib/scoring";
import SpeakButton from "./SpeakButton";
import { I } from "./icons";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildWords(ex: Exercise): string[] {
  if (ex.kind !== "build") return [];
  return ex.sentence.split(" ").concat([ex.distractor]);
}

export default function Quiz({
  exercises,
  chapterIndex,
  chapterSlug,
  lessonSlug,
  kind,
  nextHref,
  nextLabel,
}: {
  exercises: Exercise[];
  chapterIndex: number;
  chapterSlug: string;
  lessonSlug: string;
  kind: "lesson" | "test";
  nextHref?: string;
  nextLabel?: string;
}) {
  const c = pointsPerCorrect(chapterIndex);
  const need = passMarkFor(exercises.length);
  const [qi, setQi] = useState(0);
  const [pts, setPts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [miss, setMiss] = useState<string[]>([]);
  const [done, setDone] = useState<null | { passed: boolean }> (null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Shuffle once per quiz run; stored in state so retake generates a fresh order.
  const [runId, setRunId] = useState(0);
  const [order, setOrder] = useState<number[]>(() => shuffle(exercises.map((_, i) => i)));
  void runId;
  const [choiceOrder, setChoiceOrder] = useState<number[]>(() =>
    exercises[order[0]]?.kind === "choice" ? shuffle([0, 1, 2]) : [0, 1, 2],
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [tiles, setTiles] = useState<number[]>([]);
  const [pool, setPool] = useState<number[]>(() => {
    const ex = exercises[order[0]];
    if (ex?.kind === "build") return shuffle(buildWords(ex).map((_, i) => i));
    return [];
  });
  const [words, setWords] = useState<string[]>(() => buildWords(exercises[order[0]]));

  const x = exercises[order[qi]];
  const last = qi === exercises.length - 1;

  function loadQuestion(nqi: number) {
    setPicked(null);
    setTiles([]);
    const nx = exercises[order[nqi]];
    if (nx.kind === "choice") {
      setChoiceOrder(shuffle([0, 1, 2]));
    } else {
      const w = buildWords(nx);
      setWords(w);
      setPool(shuffle(w.map((_, i) => i)));
    }
  }

  function answerChoice(k: number) {
    if (picked !== null || x.kind !== "choice") return;
    setPicked(k);
    const ok = choiceOrder[k] === 0; // correct-first in resource files
    setPts(pts + (ok ? c : -2 * c));
    if (ok) setCorrect(correct + 1);
    else setMiss([...miss, x.prompt]);
  }

  function answerBuild() {
    if (x.kind !== "build" || tiles.length === 0 || picked !== null) return;
    const mine = tiles.map((i) => words[i]).join(" ");
    const ok = mine === x.sentence;
    setPts(pts + (ok ? c : -2 * c));
    if (ok) setCorrect(correct + 1);
    else setMiss([...miss, `${x.prompt} — you built: ${mine}`]);
    setPicked(-1); // lock
  }

  async function next() {
    if (last) {
      setSaving(true);
      setSaveError("");
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chapterSlug, lessonSlug, kind, correct, total: exercises.length }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSaveError(j.error ?? "Could not save. Try again.");
          return;
        }
        setDone({ passed: j.passed ?? isPassing(correct, exercises.length) });
      } catch {
        setSaveError("Network error. Try again.");
      } finally {
        setSaving(false);
      }
    } else {
      const nqi = qi + 1;
      setQi(nqi);
      loadQuestion(nqi);
    }
  }

  function retake() {
    const fresh = shuffle(exercises.map((_, i) => i));
    setOrder(fresh);
    setRunId((r) => r + 1);
    setQi(0);
    setPts(0);
    setCorrect(0);
    setMiss([]);
    setDone(null);
    setPicked(null);
    setTiles([]);
    // Init first question from the fresh order.
    const first = exercises[fresh[0]];
    if (first.kind === "choice") setChoiceOrder(shuffle([0, 1, 2]));
    else {
      const w = buildWords(first);
      setWords(w);
      setPool(shuffle(w.map((_, i) => i)));
    }
  }

  if (done) {
    const perfect = correct === exercises.length;
    return (
      <div className={`card${perfect ? " confetti" : ""}`}>
        {perfect ? <><i /><i /><i /><i /><i /><i /></> : null}
        <h2>{done.passed ? (perfect ? "Perfect! 🏆" : "Passed ✓") : "Not passed yet"}</h2>
        <p>Score {formatScore(pts)} · {correct}/{exercises.length} correct (need {need}). {done.passed ? "Next lesson unlocked." : `You need ${need} correct. Review and retake.`}</p>
        {saveError ? <p className="lock">{saveError}</p> : null}
        {miss.length > 0 && (
          <>
            <b>Review:</b>
            <ul>{miss.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </>
        )}
        <div className="row" style={{ justifyContent: "flex-start" }}>
          {done.passed && nextHref ? (
            <Link href={nextHref} className="nbtn primary"><span>{nextLabel ?? "Continue →"}</span></Link>
          ) : null}
          {!done.passed ? (
            <button className="p" style={{ marginLeft: 0 }} onClick={retake}>Retake quiz</button>
          ) : null}
          {done.passed && !nextHref ? (
            <Link href="/" className="nbtn"><span>Back to chapters</span></Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="meta">Question {qi + 1} of {exercises.length} · Points: <b>{formatScore(pts)}</b> (+{c} / −{2 * c}) · need {need} correct</p>
      <p>
        <b>{x.prompt}</b>{" "}
        <SpeakButton text={x.prompt} swedish={false} size="sm" />
      </p>
      {x.kind === "choice" ? (
        <>
          {choiceOrder.map((oi, k) => (
            <div
              key={k}
              role="button"
              tabIndex={0}
              className={"opt" + (picked !== null ? (oi === 0 ? " ok" : k === picked ? " no" : "") : "")}
              onClick={() => answerChoice(k)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); answerChoice(k); } }}
              aria-disabled={picked !== null}
            >
              <span className="tx">{x.options[oi]}</span>
              <SpeakButton text={x.options[oi]} size="sm" />
            </div>
          ))}
          {picked !== null && (
            <div className={"fb " + (choiceOrder[picked] === 0 ? "ok" : "no")}>
              <b>{choiceOrder[picked] === 0 ? `Correct. +${c}` : `Not quite. −${2 * c}`}</b>
              <br />{x.explanations[choiceOrder[picked]]}
              <br /><b>Correct: {x.options[0]}</b> — {x.explanations[0]}{" "}
              <SpeakButton text={x.options[0]} size="sm" />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="ans">
            {tiles.map((ti, j) => (
              <button key={j} className="tile" disabled={picked !== null} onClick={() => {
                if (picked !== null) return;
                setTiles(tiles.filter((_, k) => k !== j));
                setPool([...pool, ti]);
              }}>{words[ti]}</button>
            ))}
          </div>
          <div className="pool">
            {pool.map((pi) => (
              <button key={pi} className="tile" disabled={picked !== null} onClick={() => {
                if (picked !== null) return;
                setTiles([...tiles, pi]);
                setPool(pool.filter((p) => p !== pi));
              }}>{words[pi]}</button>
            ))}
          </div>
          {picked === null ? (
            <div className="row"><button className="p" onClick={answerBuild}>Check</button></div>
          ) : (
            <div className="fb">
              <b>Correct: {x.sentence}</b> <SpeakButton text={x.sentence} swedish size="sm" /><br />{x.why}
              <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                {mine(x, tiles, words) === x.sentence ? I.check(18) : I.x(18)}
                <span>You built: <b>{mine(x, tiles, words)}</b></span>
              </div>
            </div>
          )}
        </>
      )}
      {picked !== null && (
        <div className="row">
          <button className="p" onClick={next} disabled={saving}>{saving ? "Saving…" : last ? "See results" : "Next question"}</button>
        </div>
      )}
      {saveError ? <p className="lock">{saveError}</p> : null}
    </div>
  );
}

function mine(x: Exercise, tiles: number[], words: string[]): string {
  if (x.kind !== "build") return "";
  return tiles.map((i) => words[i]).join(" ");
}
