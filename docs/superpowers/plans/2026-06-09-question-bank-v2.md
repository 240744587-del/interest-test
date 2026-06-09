# Final Question Bank v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one final, traceable question bank with 32/46/53/59 questions and archive all superseded source documents.

**Architecture:** A small Node.js script reads the two source Markdown files, extracts approved question ranges, replaces superseded sections, assigns stable IDs, and writes `question-bank-v2.md`. A separate verification script treats the generated Markdown as the public contract and fails on count, ID, numbering, open-question, or archive-reference errors.

**Tech Stack:** Node.js standard library, Markdown, Git

---

### Task 1: Add Contract Verification

**Files:**
- Create: `scripts/verify-question-bank.mjs`
- Test: `question-bank-v2.md`

- [ ] **Step 1: Write a verifier that expects the final contract**

The verifier must:

```javascript
const expectedCounts = { L1: 32, L2: 46, L3: 53, L4: 59 };
```

It must fail when `question-bank-v2.md` is missing, when IDs are duplicated, when numbering is not continuous, or when the text contains `开放题`.

- [ ] **Step 2: Run it and verify the RED state**

Run:

```bash
node scripts/verify-question-bank.mjs
```

Expected: non-zero exit because `question-bank-v2.md` does not exist.

### Task 2: Generate the Final Question Bank

**Files:**
- Create: `scripts/build-question-bank.mjs`
- Create: `question-bank-v2.md`
- Read: `question-bank.md`
- Read: `question-bank-supplement.md`

- [ ] **Step 1: Implement approved extraction rules**

Use the exact inclusion rules in `docs/superpowers/specs/2026-06-09-question-bank-v2-design.md`. Preserve question text and scoring annotations from the source documents.

- [ ] **Step 2: Assign stable IDs and final numbers**

Each rendered question heading must use:

```markdown
**第 1 题** `L1-ENERGY-001`
```

IDs must use the approved category and a three-digit sequence within each category and level.

- [ ] **Step 3: Build the document**

Run:

```bash
node scripts/build-question-bank.mjs
```

Expected: creates `question-bank-v2.md`.

- [ ] **Step 4: Run the verifier**

Run:

```bash
node scripts/verify-question-bank.mjs
```

Expected:

```text
question bank verification: PASS
L1=32 L2=46 L3=53 L4=59 total=190
```

### Task 3: Archive Superseded Documents

**Files:**
- Move: `MVP.md` to `docs/archive/MVP-v1.md`
- Move: `assessment-framework.md` to `docs/archive/assessment-framework-v2-source.md`
- Move: `question-bank.md` to `docs/archive/question-bank-v1.md`
- Move: `question-bank-supplement.md` to `docs/archive/question-bank-supplement-v2.md`
- Modify: `product-spec-v2.md`

- [ ] **Step 1: Move source documents without editing their contents**

Use `git mv` so history remains traceable.

- [ ] **Step 2: Update authoritative references**

`product-spec-v2.md` must identify `question-bank-v2.md` as the only development question bank and use archive paths only for provenance.

- [ ] **Step 3: Verify archive references**

Run:

```bash
node scripts/verify-question-bank.mjs
```

Expected: PASS and all four archive files exist.

### Task 4: Final Verification and Publish

**Files:**
- Verify all changed files

- [ ] **Step 1: Inspect status and generated diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: one final question bank, two scripts, updated spec, four renames, and plan/spec documents.

- [ ] **Step 2: Run final verification**

Run:

```bash
node scripts/build-question-bank.mjs
node scripts/verify-question-bank.mjs
git diff --exit-code question-bank-v2.md
```

Expected: PASS and no generator drift.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add product-spec-v2.md question-bank-v2.md scripts docs/archive docs/superpowers
git commit -m "docs: consolidate final v2 question bank"
git push
```
