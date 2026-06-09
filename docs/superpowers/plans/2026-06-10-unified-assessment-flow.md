# Unified Assessment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing assessment UI to the generated v2 question bank and tested scoring core for L1-L4, while keeping answers and results out of browser storage.

**Architecture:** Keep `question-bank-v2.md` and `app/src/data/questions/generated.ts` as the only runtime question source. A pure adapter converts generated questions into the existing UI model, while a pure report builder converts normalized assessment scores into the current result-page model. A React context holds only the computed report between the test and result routes.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Zod

---

## Working Tree Constraint

The current workspace contains uncommitted UI improvements and hand-written L2-L4 question files. Do not reset, replace, or discard them.

Implementation must:

- preserve the existing edits in `app/src/app/globals.css`, page components, and test components;
- stop importing the hand-written L1-L4 banks at runtime;
- leave the hand-written bank files present but unused;
- stage only files intentionally changed for each commit;
- inspect `git diff` before every commit.

Because these uncommitted changes are part of the UI being integrated, execute this plan in the current workspace instead of creating a clean worktree that would omit them.

## File Map

**Create**

- `app/src/lib/questions/adapter.ts`: pure generated-question to UI-question conversion.
- `app/src/lib/questions/adapter.test.ts`: adapter and four-level bank tests.
- `app/src/domain/assessment/report.ts`: pure normalized-score to result-view conversion.
- `app/src/domain/assessment/report.test.ts`: report conversion tests for all levels.
- `app/src/components/assessment/ResultStore.tsx`: in-memory result context.
- `app/src/components/assessment/result-state.test.ts`: pure result-state tests.
- `scripts/verify-no-browser-storage.mjs`: source scan preventing persistent browser storage.

**Modify**

- `app/src/lib/questions/index.ts`: expose adapted generated banks.
- `app/src/lib/questions/types.ts`: keep UI types and reuse the domain answer/level types.
- `app/src/components/test/QuestionEngine.tsx`: score locally and put the report in context.
- `app/src/app/result/page.tsx`: read the report from context.
- `app/src/app/layout.tsx`: mount the result provider.
- `app/package.json`: include storage verification in tests.

## Task 1: Adapt the Generated Question Bank for the Existing UI

**Files:**

- Create: `app/src/lib/questions/adapter.ts`
- Create: `app/src/lib/questions/adapter.test.ts`
- Modify: `app/src/lib/questions/index.ts`
- Modify: `app/src/lib/questions/types.ts`

- [ ] **Step 1: Write failing adapter tests**

Create tests that import `questionBanks` from `app/src/data/questions/generated.ts` and the not-yet-created adapter:

```typescript
import { describe, expect, it } from "vitest";
import { questionBanks } from "@/data/questions/generated";
import { adaptQuestion, buildUiQuestionBank } from "./adapter";

describe("question adapter", () => {
  it("maps all four generated banks without changing IDs or counts", () => {
    const expected = { L1: 32, L2: 46, L3: 53, L4: 59 } as const;

    for (const level of Object.keys(expected) as Array<keyof typeof expected>) {
      const bank = buildUiQuestionBank(level, questionBanks[level]);
      expect(bank.questions).toHaveLength(expected[level]);
      expect(bank.questions.map((question) => question.id)).toEqual(
        questionBanks[level].map((question) => question.id),
      );
    }
  });

  it.each([
    ["single", "binary"],
    ["likert", "likert"],
    ["ranking", "ranking"],
    ["forcedChoice", "forcedChoice"],
  ] as const)("maps %s to a supported UI type", (sourceType, expectedType) => {
    const source = Object.values(questionBanks)
      .flat()
      .find((question) => question.type === sourceType);

    expect(source).toBeDefined();
    expect(adaptQuestion(source!).type).toBe(expectedType);
  });

  it("uses scenario for a single question with more than two options", () => {
    const source = Object.values(questionBanks)
      .flat()
      .find(
        (question) =>
          question.type === "single" && question.options.length > 2,
      );

    expect(adaptQuestion(source!).type).toBe("scenario");
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npx vitest run src/lib/questions/adapter.test.ts
```

Expected: FAIL because `adapter.ts` does not exist.

- [ ] **Step 3: Implement the minimal adapter**

Implement:

```typescript
export function adaptQuestion(question: DomainQuestion): UiQuestion
export function buildUiQuestionBank(
  level: Level,
  questions: DomainQuestion[],
): QuestionBank
```

Required mappings:

```typescript
const type =
  question.type === "single"
    ? question.options.length === 2
      ? "binary"
      : "scenario"
    : question.type;

const dimension =
  question.id.includes("-ENERGY-")
    ? "energy"
    : question.id.includes("-ABILITY-")
      ? "intelligence"
      : question.id.includes("-RIASEC-")
        ? "riasec"
        : question.id.includes("-DRIVE-")
          ? "drive"
          : question.id.includes("-JUNG-")
            ? "cognitive"
            : "readiness";
```

Copy only display data:

```typescript
{
  id: question.id,
  level: question.level,
  type,
  dimension,
  text: question.prompt,
  options: question.options.map((option) => ({
    id: option.id,
    text: option.text,
    scores: [],
  })),
  likertStatement: undefined,
  reversed: question.reverse,
}
```

Do not copy or translate score rules into the UI adapter. The domain scorer continues using the generated source questions.
Generated Likert questions contain only one prompt, so the adapter leaves
`likertStatement` empty to avoid rendering the same text twice.

Use these estimated times:

```typescript
const estimatedMinutes = { L1: 10, L2: 15, L3: 20, L4: 25 }[level];
```

- [ ] **Step 4: Switch the runtime bank index**

Replace hand-written bank imports in `app/src/lib/questions/index.ts` with:

```typescript
import { questionBanks } from "@/data/questions/generated";
import { buildUiQuestionBank } from "./adapter";

const banks = {
  L1: buildUiQuestionBank("L1", questionBanks.L1),
  L2: buildUiQuestionBank("L2", questionBanks.L2),
  L3: buildUiQuestionBank("L3", questionBanks.L3),
  L4: buildUiQuestionBank("L4", questionBanks.L4),
};
```

Keep the existing `levelMeta`, `getQuestionBank`, and `isLevelReady` APIs.

- [ ] **Step 5: Run focused and existing data tests**

Run:

```bash
cd app
npx vitest run src/lib/questions/adapter.test.ts src/data/questions/generated.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit only the adapter boundary**

Inspect:

```bash
git diff -- app/src/lib/questions/adapter.ts \
  app/src/lib/questions/adapter.test.ts \
  app/src/lib/questions/index.ts \
  app/src/lib/questions/types.ts
```

Commit:

```bash
git add app/src/lib/questions/adapter.ts \
  app/src/lib/questions/adapter.test.ts \
  app/src/lib/questions/index.ts \
  app/src/lib/questions/types.ts
git commit -m "feat: adapt generated question banks for the UI"
```

## Task 2: Build the Result View Model from the Tested Score Core

**Files:**

- Create: `app/src/domain/assessment/report.ts`
- Create: `app/src/domain/assessment/report.test.ts`
- Modify: `app/src/lib/questions/types.ts`

- [ ] **Step 1: Write failing report tests**

Create a deterministic answer helper:

```typescript
function answerFor(question: Question): Answer {
  if (question.type === "single") {
    return {
      questionId: question.id,
      value: { kind: "single", optionId: question.options[0].id },
    };
  }
  if (question.type === "likert") {
    return {
      questionId: question.id,
      value: { kind: "likert", value: 3 },
    };
  }
  if (question.type === "ranking") {
    return {
      questionId: question.id,
      value: {
        kind: "ranking",
        optionIds: question.options.map((option) => option.id),
      },
    };
  }
  return {
    questionId: question.id,
    value: {
      kind: "forcedChoice",
      mostOptionId: question.options[0].id,
      leastOptionId: question.options[1].id,
    },
  };
}
```

Test all levels:

```typescript
describe("buildScoreResult", () => {
  it.each(["L1", "L2", "L3", "L4"] as const)(
    "builds a bounded report for %s",
    (level) => {
      const questions = questionBanks[level];
      const score = scoreAssessment(
        level,
        questions.map(answerFor),
        questions,
      );
      const report = buildScoreResult(score);

      expect(report.level).toBe(level);
      expect(report.riasec.code).toHaveLength(3);
      expect(
        Object.values(report.riasec.scores).every(
          (value) => value >= 0 && value <= 100,
        ),
      ).toBe(true);
      expect(
        Object.values(report.jung).every(
          (value) => value >= 0 && value <= 100,
        ),
      ).toBe(true);
      expect(report.readiness === undefined).toBe(level === "L1");
    },
  );
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npx vitest run src/domain/assessment/report.test.ts
```

Expected: FAIL because `report.ts` does not exist.

- [ ] **Step 3: Implement the report builder**

Export:

```typescript
export function buildScoreResult(score: AssessmentScore): ScoreResult
```

Implementation rules:

1. Group normalized keys by namespace:

```typescript
energy -> energy
intelligence -> intelligence
riasec -> riasec
drive -> drive
jung -> cognitive
readiness -> readiness
```

2. Use the full key as a stable fallback label. Add only the labels already used by the result page for RIASEC and Jung; do not create a large speculative translation table.

3. Build RIASEC scores from:

```typescript
riasec.R
riasec.I
riasec.A
riasec.S
riasec.E
riasec.C
```

Missing values default to `0`. Sort descending with alphabetical tie-breaking and join the first three letters for the code.

4. Preserve the current consistency, differentiation, and clarity threshold calculations as pure helpers operating on normalized RIASEC values.

5. Build Jung spectra with:

```typescript
pair("jung.I", "jung.E")
pair("jung.S", "jung.N")
pair("jung.T", "jung.F")
pair("jung.J", "jung.P")
```

Where:

```typescript
function pair(left: number, right: number) {
  return left + right === 0
    ? 50
    : Math.round((right / (left + right)) * 100);
}
```

6. For L2-L4, average every normalized key beginning with `readiness.` into `readiness.overall`. L1 returns `undefined`.

7. Keep the current RIASEC two-letter candidate-field map, but move it into `report.ts`. Do not add AI interpretation or new recommendation logic.

- [ ] **Step 4: Run report and score tests**

Run:

```bash
cd app
npx vitest run src/domain/assessment/report.test.ts \
  src/domain/assessment/score.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the report boundary**

Inspect and commit:

```bash
git diff -- app/src/domain/assessment/report.ts \
  app/src/domain/assessment/report.test.ts \
  app/src/lib/questions/types.ts
git add app/src/domain/assessment/report.ts \
  app/src/domain/assessment/report.test.ts \
  app/src/lib/questions/types.ts
git commit -m "feat: build reports from normalized assessment scores"
```

## Task 3: Add an In-Memory Result Store

**Files:**

- Create: `app/src/components/assessment/ResultStore.tsx`
- Create: `app/src/components/assessment/result-state.ts`
- Create: `app/src/components/assessment/result-state.test.ts`
- Modify: `app/src/app/layout.tsx`

- [ ] **Step 1: Write a failing pure-state test**

Use a tiny state reducer so behavior can be tested without adding a DOM testing library:

```typescript
import { describe, expect, it } from "vitest";
import type { ScoreResult } from "@/lib/questions/types";
import { resultReducer } from "./result-state";

describe("resultReducer", () => {
  it("stores and clears only the computed result", () => {
    const result = {
      level: "L1",
      dimensions: [],
      jung: { EI: 50, SN: 50, TF: 50, JP: 50 },
      riasec: {
        scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        code: "AIC",
        consistency: "low",
        differentiation: "low",
        clarity: "low",
      },
      consistencyFlags: [],
      candidateFields: [],
    } satisfies ScoreResult;

    expect(resultReducer(null, { type: "set", result })).toBe(result);
    expect(resultReducer(result, { type: "clear" })).toBeNull();
  });
});
```

The fixture must contain a minimal valid `ScoreResult` and no `answers` property.

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npx vitest run src/components/assessment/result-state.test.ts
```

Expected: FAIL because the state module does not exist.

- [ ] **Step 3: Implement state and context**

In `result-state.ts`:

```typescript
export type ResultAction =
  | { type: "set"; result: ScoreResult }
  | { type: "clear" };

export function resultReducer(
  state: ScoreResult | null,
  action: ResultAction,
) {
  return action.type === "set" ? action.result : null;
}
```

In `ResultStore.tsx`, export:

```typescript
export function ResultProvider({ children }: { children: ReactNode })
export function useResultStore(): {
  result: ScoreResult | null;
  setResult: (result: ScoreResult) => void;
  clearResult: () => void;
}
```

Use `useReducer(resultReducer, null)`. Do not read or write any browser storage.

- [ ] **Step 4: Mount the provider**

Wrap the existing layout body content:

```tsx
<body className={...}>
  <ResultProvider>{children}</ResultProvider>
</body>
```

Keep all existing fonts, metadata, and body classes unchanged.

- [ ] **Step 5: Run the focused test and lint**

Run:

```bash
cd app
npx vitest run src/components/assessment/result-state.test.ts
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit the store**

```bash
git diff -- app/src/components/assessment \
  app/src/app/layout.tsx
git add app/src/components/assessment/result-state.ts \
  app/src/components/assessment/result-state.test.ts \
  app/src/components/assessment/ResultStore.tsx \
  app/src/app/layout.tsx
git commit -m "feat: keep assessment results in memory"
```

## Task 4: Connect Submission and the Result Page

**Files:**

- Modify: `app/src/components/test/QuestionEngine.tsx`
- Modify: `app/src/app/result/page.tsx`
- Create: `scripts/verify-no-browser-storage.mjs`
- Modify: `app/package.json`

- [ ] **Step 1: Add the failing storage guard**

Create a Node test script that scans application source files:

```javascript
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const forbidden = [
  "session" + "Storage",
  "local" + "Storage",
  "indexed" + "DB",
];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return nested.flat();
}

const sourceRoot = fileURLToPath(new URL("../app/src", import.meta.url));
const files = (await filesUnder(sourceRoot))
  .filter((path) => [".ts", ".tsx", ".js", ".jsx"].includes(extname(path)));

for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const token of forbidden) {
    assert.equal(source.includes(token), false, `${file} contains ${token}`);
  }
}
```

Add:

```json
"privacy:check": "node ../scripts/verify-no-browser-storage.mjs"
```

Append `npm run privacy:check` to the `test` script.

- [ ] **Step 2: Verify RED**

Run:

```bash
cd app
npm run privacy:check
```

Expected: FAIL on the current test and result pages because they use browser storage.

- [ ] **Step 3: Replace submission storage with local scoring**

In `QuestionEngine.tsx`:

- import `questionBanks`;
- import `scoreAssessment`;
- import `buildScoreResult`;
- import `useResultStore`;
- remove `sessionStorage`;
- retain all current uncommitted UI improvements.

Submission becomes:

```typescript
const { setResult } = useResultStore();
const [submitError, setSubmitError] = useState<string | null>(null);

const handleSubmit = useCallback(() => {
  setSubmitting(true);
  setSubmitError(null);

  try {
    const score = scoreAssessment(
      level,
      Array.from(answers.values()),
      questionBanks[level],
    );
    setResult(buildScoreResult(score));
    router.push("/result");
  } catch {
    setSubmitting(false);
    setSubmitError("结果生成失败，请检查是否完成所有题目后重试");
  }
}, [answers, level, router, setResult]);
```

Render `submitError` immediately above the bottom navigation buttons with `role="alert"`.

- [ ] **Step 4: Read the result from context**

In `app/src/app/result/page.tsx`:

- remove `useEffect`, `useState`, answer parsing, and old scorer imports;
- call `const { result, clearResult } = useResultStore()`;
- when `result` is null, immediately render the existing empty-state card with:

```text
没有找到本次测评结果，请重新开始
```

- clear the in-memory result before starting another assessment;
- preserve all current result-page visual changes.

Do not clear the result during normal result rendering.

- [ ] **Step 5: Remove the obsolete runtime scorer import path**

Ensure no application file imports:

```text
@/lib/scoring/engine
```

The old file may remain temporarily, but it must not participate in the runtime flow.

- [ ] **Step 6: Run focused verification**

Run:

```bash
cd app
npm run privacy:check
npx vitest run src/domain/assessment/report.test.ts \
  src/lib/questions/adapter.test.ts \
  src/components/assessment/result-state.test.ts
npm run lint
```

Expected: all commands PASS.

- [ ] **Step 7: Commit the connected flow**

Inspect:

```bash
git diff -- app/src/components/test/QuestionEngine.tsx \
  app/src/app/result/page.tsx \
  app/package.json \
  scripts/verify-no-browser-storage.mjs
```

Commit only the intended flow files:

```bash
git add app/src/components/test/QuestionEngine.tsx \
  app/src/app/result/page.tsx \
  app/package.json \
  scripts/verify-no-browser-storage.mjs
git commit -m "feat: connect private in-memory assessment flow"
```

## Task 5: Verify the Full Four-Level Experience

**Files:**

- No new production files expected.

- [ ] **Step 1: Run all automated checks**

Run:

```bash
cd app
npm run questions:check
npm test
npm run lint
npm run build
npm run score:simulate
```

Expected:

- generated question data is current;
- parser tests pass;
- all Vitest suites pass;
- privacy scan passes;
- lint is clean;
- production build succeeds;
- simulation reports L1/L2/L3/L4 counts of 32/46/53/59 and scores bounded to 0-100.

- [ ] **Step 2: Verify no runtime reference to hand-written banks**

Run:

```bash
rg -n "L[1-4]QuestionBank|L[1-4]-(children|teen|youth|adult)" app/src \
  --glob '!lib/questions/L1-children.ts' \
  --glob '!lib/questions/L2-teen.ts' \
  --glob '!lib/questions/L3-youth.ts' \
  --glob '!lib/questions/L4-adult.ts'
```

Expected: no output.

- [ ] **Step 3: Start the development server**

Run:

```bash
cd app
npm run dev
```

Expected: Next.js reports a local URL and remains running for browser verification.

- [ ] **Step 4: Browser-check all levels**

Open each route:

```text
/test?level=L1
/test?level=L2
/test?level=L3
/test?level=L4
```

Verify:

- first question renders;
- displayed totals are 32, 46, 53, and 59;
- each page has no browser console error;
- home cards show all levels as available.

- [ ] **Step 5: Verify a complete report path**

Use browser automation to answer one full level deterministically:

- single: first option;
- likert: value 3;
- ranking: accept initial order;
- forced choice: first as most, second as least.

Verify:

- submit reaches `/result`;
- report contains RIASEC and Jung sections;
- refreshing `/result` shows the no-result message;
- browser storage remains empty.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Confirm every changed line belongs to the unified-flow work or the pre-existing UI edits being preserved.

- [ ] **Step 7: Commit preserved UI integration changes**

After reviewing them carefully, include the existing UI improvements that are now part of the working integrated flow:

```bash
git add app/src/app/globals.css \
  app/src/app/page.tsx \
  app/src/components/test/ForcedChoice.tsx \
  app/src/components/test/LikertScale.tsx \
  app/src/components/test/RankingQuestion.tsx
git commit -m "feat: polish the four-level assessment experience"
```

Do not add the hand-written L2-L4 bank files unless the user separately asks to preserve them in Git. They are unused duplicate data.

- [ ] **Step 8: Push the completed main branch**

Run:

```bash
git push origin main
```

Expected: GitHub `main` points to the final verified commit.
