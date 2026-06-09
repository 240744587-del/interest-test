import assert from "node:assert/strict";
import test from "node:test";

import { parseQuestionBank, parseScoreLabel } from "./question-parser.mjs";

test("splits a composite intelligence label without dividing the value", () => {
  assert.deepEqual(parseScoreLabel("语言智能+人际智能", 2), [
    { key: "intelligence.linguistic", value: 2 },
    { key: "intelligence.interpersonal", value: 2 },
  ]);
});

test("splits a composite RIASEC label without dividing the value", () => {
  assert.deepEqual(parseScoreLabel("I 探究型 + R 实际型", 3), [
    { key: "riasec.I", value: 3 },
    { key: "riasec.R", value: 3 },
  ]);
});

test("maps explicit zero-score labels to no targets", () => {
  assert.deepEqual(parseScoreLabel("平衡", 1), []);
  assert.deepEqual(parseScoreLabel("其他方向", 3), []);
  assert.deepEqual(parseScoreLabel("准备度-尚未启动", 0), []);
});

test("rejects an unknown non-zero label", () => {
  assert.throws(
    () => parseScoreLabel("没有定义的标签", 2),
    /Unknown score label/,
  );
});

test("keeps the +3 rule for a single-selection forced-choice question", () => {
  const markdown = `# L3 高中版

**第 1 题** \`L3-RIASEC-001\`
（迫选）
如果只能选一种：
- A. 修机器 → [R]
- B. 做研究 → [I]
→ 选中 +3
`;

  const [question] = parseQuestionBank(markdown).L3;

  assert.equal(question.type, "single");
  assert.deepEqual(question.options[0].scores, [
    { key: "riasec.R", value: 3 },
  ]);
});
