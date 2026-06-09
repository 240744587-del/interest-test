# Project Foundation and Question Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal Next.js application that converts the authoritative Markdown question bank into validated TypeScript data and produces normalized scores for complete simulated answers.

**Architecture:** The Markdown question bank remains the human-maintained source. A Node.js generator parses it into a generated TypeScript module, while domain code defines stable question and answer contracts and a pure scoring engine. Vitest covers parsing, generated data integrity, and scoring behavior independently of the UI.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest, Zod, Node.js

---

### Task 1: Initialize the Next.js Project

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.gitignore`

- [ ] **Step 1: Create the framework files**

Use Next.js App Router, TypeScript strict mode, Tailwind, ESLint, Vitest, Zod, and `tsx`.

Required scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "lint": "eslint .",
  "test": "vitest run"
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and install exits successfully.

- [ ] **Step 3: Verify the empty application**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit successfully.

### Task 2: Define Assessment Contracts

**Files:**
- Create: `src/domain/assessment/types.ts`
- Create: `src/domain/assessment/types.test.ts`

- [ ] **Step 1: Write failing schema tests**

Tests must cover:

```typescript
expect(questionSchema.parse(validSingleQuestion)).toEqual(validSingleQuestion);
expect(() => questionSchema.parse(questionWithDuplicateOptionIds)).toThrow();
expect(() => questionSchema.parse(questionWithUnknownScoreKey)).toThrow();
```

- [ ] **Step 2: Run the focused test**

Run:

```bash
npx vitest run src/domain/assessment/types.test.ts
```

Expected: FAIL because the assessment contracts do not exist.

- [ ] **Step 3: Implement minimal types and Zod schemas**

Define:

```typescript
type Level = 'L1' | 'L2' | 'L3' | 'L4';
type QuestionType = 'single' | 'likert' | 'ranking' | 'forcedChoice';
type ScoreTarget = { key: string; value: number };
type QuestionOption = { id: string; text: string; scores: ScoreTarget[] };
type Question = {
  id: string;
  level: Level;
  number: number;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  likertScores?: ScoreTarget[];
  reverse?: boolean;
  sourceMarkdown: string;
};
```

The schema must accept only keys beginning with `energy.`, `intelligence.`, `riasec.`, `drive.`, `jung.`, or `readiness.` and must reject duplicate option IDs.

- [ ] **Step 4: Run tests**

Run:

```bash
npx vitest run src/domain/assessment/types.test.ts
```

Expected: PASS.

### Task 3: Parse and Generate Question Data

**Files:**
- Create: `scripts/lib/question-parser.mjs`
- Create: `scripts/lib/question-parser.test.mjs`
- Create: `scripts/generate-question-data.mjs`
- Create: `src/data/questions/generated.ts`
- Create: `src/data/questions/generated.test.ts`

- [ ] **Step 1: Write failing parser tests**

Fixtures must prove:

```javascript
parseScoreLabel('语言智能+人际智能', 2)
// => intelligence.linguistic +2 and intelligence.interpersonal +2

parseScoreLabel('I 探究型 + R 实际型', 3)
// => riasec.I +3 and riasec.R +3

parseScoreLabel('平衡', 1)
// => []
```

The parser must also throw for an unknown non-zero label.

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test scripts/lib/question-parser.test.mjs
```

Expected: FAIL because the parser does not exist.

- [ ] **Step 3: Implement the parser**

Parse:

- question ID and display number;
- question type;
- prompt;
- options and option IDs;
- direct Likert score targets;
- reverse-scoring marker;
- ranking and forced-choice rules.

Use an explicit alias map for every accepted Chinese scoring label. Do not accept unknown labels silently.

- [ ] **Step 4: Generate TypeScript**

Add these scripts before generating:

```json
{
  "build": "npm run questions:check && next build",
  "questions:generate": "node scripts/generate-question-data.mjs",
  "questions:check": "npm run questions:generate && git diff --exit-code -- src/data/questions/generated.ts"
}
```

Run:

```bash
npm run questions:generate
```

Expected: writes `src/data/questions/generated.ts`.

- [ ] **Step 5: Add generated-data tests**

Tests must assert:

```typescript
expect(questionBanks.L1).toHaveLength(32);
expect(questionBanks.L2).toHaveLength(46);
expect(questionBanks.L3).toHaveLength(53);
expect(questionBanks.L4).toHaveLength(59);
expect(new Set(allIds).size).toBe(190);
```

They must parse every generated question with `questionSchema`.

- [ ] **Step 6: Run parser and data tests**

Run:

```bash
node --test scripts/lib/question-parser.test.mjs
npx vitest run src/data/questions/generated.test.ts
```

Expected: PASS.

### Task 4: Implement the Basic Scoring Engine

**Files:**
- Create: `src/domain/assessment/score.ts`
- Create: `src/domain/assessment/score.test.ts`

- [ ] **Step 1: Write failing scoring tests**

Cover:

```typescript
// Composite option gives the full value to both targets.
expect(raw['intelligence.linguistic']).toBe(2);
expect(raw['intelligence.interpersonal']).toBe(2);

// Reverse Likert converts 5 to 1 before scoring.
expect(scoreReverseLikert(5)).toBe(1);

// Ranking assigns 5, 3, 1, 0.
expect(rankWeights).toEqual([5, 3, 1, 0]);

// Forced choice adds +4 to most and -2 to least.
expect(raw['riasec.R']).toBe(4);
expect(raw['riasec.C']).toBe(-2);
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run src/domain/assessment/score.test.ts
```

Expected: FAIL because scoring functions do not exist.

- [ ] **Step 3: Implement minimal scoring**

Export:

```typescript
scoreAssessment(level, answers, questions)
```

It must validate complete answers, accumulate raw scores, calculate theoretical min/max per key, and normalize each result to an integer from 0 to 100.

- [ ] **Step 4: Run scoring tests**

Run:

```bash
npx vitest run src/domain/assessment/score.test.ts
```

Expected: PASS.

### Task 5: Add a Full Simulation

**Files:**
- Create: `scripts/simulate-score.ts`
- Modify: `package.json`

- [ ] **Step 1: Add a deterministic answer generator**

For every question:

- choose the first option for single questions;
- answer `3` for Likert questions;
- preserve source order for ranking;
- choose first as most and last as least for forced choice.

- [ ] **Step 2: Add the script**

```json
"score:simulate": "tsx scripts/simulate-score.ts"
```

- [ ] **Step 3: Run all four levels**

Run:

```bash
npm run score:simulate
```

Expected: prints L1/L2/L3/L4 score summaries without identity data or question answers.

### Task 6: Final Verification and Publish

**Files:**
- Verify all project files

- [ ] **Step 1: Verify generated data is current**

Run:

```bash
npm run questions:check
```

Expected: PASS with no generated-file diff.

- [ ] **Step 2: Run the full quality gate**

Run:

```bash
npm test
npm run lint
npm run build
npm run score:simulate
```

Expected: all commands exit successfully.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add .
git commit -m "feat: initialize assessment foundation"
git push
```
