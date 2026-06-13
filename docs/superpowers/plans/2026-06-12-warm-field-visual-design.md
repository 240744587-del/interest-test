# Warm Field Visual Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved warm field visual direction, modern serif wordmark, and minimal two-screen homepage across the assessment flow.

**Architecture:** Add shared semantic visual classes in `globals.css`, then apply them to the existing page shells and primary controls. Keep all scoring, question, result, and privacy behavior unchanged.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Vitest, CSS gradients and pseudo-elements.

---

### Task 1: Lock the wordmark requirement

**Files:**
- Create: `app/src/app/brand-visual.test.ts`
- Modify: `app/src/app/page.tsx`

- [ ] Add a source-level regression test asserting the homepage does not contain the wheat wordmark and uses the semantic brand class.
- [ ] Run the focused test and verify it fails against the current homepage.
- [ ] Replace the old emoji title with the approved serif wordmark.
- [ ] Run the focused test and verify it passes.

### Task 2: Add the warm field visual system

**Files:**
- Modify: `app/src/app/globals.css`

- [ ] Add warm neutral, olive, and field accent tokens.
- [ ] Add reusable full and soft page backgrounds using gradients and pseudo-elements.
- [ ] Add reusable surface, primary action, selection, and wordmark classes.
- [ ] Preserve print output as white and suppress decorative layers in print.

### Task 3: Apply the system across the flow

**Files:**
- Modify: `app/src/app/page.tsx`
- Modify: `app/src/components/test/ConsentGate.tsx`
- Modify: `app/src/components/test/QuestionEngine.tsx`
- Modify: `app/src/components/test/BinaryChoice.tsx`
- Modify: `app/src/components/test/ScenarioChoice.tsx`
- Modify: `app/src/components/test/LikertScale.tsx`
- Modify: `app/src/app/result/page.tsx`
- Modify: `app/src/app/result/demo/page.tsx`
- Modify: `app/src/app/test/page.tsx`

- [ ] Apply the full warm field background to the homepage.
- [ ] Apply the quieter background to consent, questions, empty states, and reports.
- [ ] Change primary controls and selected answer states from blue to olive.
- [ ] Keep semantic dimension colors and warning colors unchanged.

### Task 4: Verify

**Files:**
- No production files added.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit` after the build is stable.
- [ ] Run `npm run build`.
- [ ] Inspect homepage, consent, question, and demo result pages at desktop and mobile widths in the in-app browser.

### Task 5: Build the minimal homepage

**Files:**
- Modify: `app/src/app/brand-visual.test.ts`
- Modify: `app/src/app/page.tsx`

- [ ] Add failing assertions for the approved Slogan, the `#assessment-start` target, and removal of the top privacy badge.
- [ ] Make the first viewport contain only the wordmark, Slogan, and one “开始测评” anchor.
- [ ] Move the four feature cards into the next section before education-stage selection.
- [ ] Add `id="assessment-start"` and `scroll-mt` spacing so the anchor lands cleanly.
- [ ] Run focused tests and browser-check desktop and mobile scrolling.

### Task 6: Separate the marketing homepage and assessment entry

**Files:**
- Modify: `app/src/app/brand-visual.test.ts`
- Modify: `app/src/app/page.tsx`
- Create: `app/src/app/start/page.tsx`
- Modify: `app/src/app/globals.css`
- Modify: `app/src/app/test/page.tsx`

- [ ] Replace homepage anchor assertions with `/start` navigation and product-positioning assertions.
- [ ] Add a failing source test proving stage selection is absent from the homepage and present on `/start`.
- [ ] Rebuild `/` as a hero plus four full-height feature sections and a final call to action.
- [ ] Move the existing L1-L4 stage cards to `/start`, preserving routes, counts, and estimated times.
- [ ] Update invalid test-entry guidance to link to `/start`.
- [ ] Browser-check homepage story rhythm, `/start`, and the transition into consent at desktop and mobile sizes.
