# Swedish Quest (Next.js + SQLite)

Production-ready rebuild of the single-file `Learn_Swedish.html` prototype.

* 20 chapters 0→100 (CEFR A0–B2), strict sequential gating
* Each lesson: Markdown reading (`content/<chapter>/<lesson>.md`) + exercises (`*.exercises.json`, 10 Q) + chapter `test.json`
* Scoring kept from prototype: correct `+c`, wrong `−2c`, pass `≥6/10`. `c = min(10+5*chapterIdx, 30)`.
* Auth: Auth.js Email + Google (stub until `.env` set). SQLite via Prisma, single Docker container.
* Voice: Web Speech API default (`lib/tts.ts`, `{Swedish}` markers → `sv-SE`), `/api/tts` Google Cloud upgrade path.

## Run

```bash
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

Docker VPS: `docker compose up --build` (SQLite persisted in `app-data` volume).

## Content authoring

No hardcoded lesson text. Add `content/<chapter>/<lesson>.md` (frontmatter `title, objective, minutes`) + `<lesson>.exercises.json`:

* choice: `{kind:"choice", prompt, options:[correct,wrong,wrong], explanations:[...]}` — correct always first, shuffled client-side.
* build: `{kind:"build", prompt, sentence, distractor, distractorWhy, why}`.

Chapter test: `content/<chapter>/test.json` (10 items). Full content: ch01–ch06. ch07–ch20 are structured stubs.
