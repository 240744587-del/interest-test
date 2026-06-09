import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const questionBankPath = path.join(root, 'question-bank-v2.md');
const expectedCounts = { L1: 32, L2: 46, L3: 53, L4: 59 };
const archiveFiles = [
  'docs/archive/MVP-v1.md',
  'docs/archive/assessment-framework-v2-source.md',
  'docs/archive/question-bank-v1.md',
  'docs/archive/question-bank-supplement-v2.md',
];

function fail(message) {
  console.error(`question bank verification: FAIL\n${message}`);
  process.exit(1);
}

if (!fs.existsSync(questionBankPath)) {
  fail('question-bank-v2.md does not exist');
}

for (const archiveFile of archiveFiles) {
  if (!fs.existsSync(path.join(root, archiveFile))) {
    fail(`missing archive source ${archiveFile}`);
  }
}

const markdown = fs.readFileSync(questionBankPath, 'utf8');
const productSpec = fs.readFileSync(path.join(root, 'product-spec-v2.md'), 'utf8');

if (markdown.includes('开放题')) {
  fail('final question bank contains an open-text question');
}
if (!productSpec.includes('题目内容和计分标注以 `question-bank-v2.md` 为准')) {
  fail('product-spec-v2.md does not identify the final question bank as authoritative');
}

const levelMatches = [...markdown.matchAll(/^# (L[1-4])\b.*$/gm)];
if (levelMatches.length !== 4) {
  fail(`expected 4 level headings, found ${levelMatches.length}`);
}

const allIds = [];
let total = 0;

for (let index = 0; index < levelMatches.length; index += 1) {
  const match = levelMatches[index];
  const level = match[1];
  const start = match.index;
  const end = levelMatches[index + 1]?.index ?? markdown.length;
  const section = markdown.slice(start, end);
  const questions = [...section.matchAll(/^\*\*第 (\d+) 题\*\* `([^`]+)`$/gm)];

  if (questions.length !== expectedCounts[level]) {
    fail(`${level}: expected ${expectedCounts[level]} questions, found ${questions.length}`);
  }

  questions.forEach((question, questionIndex) => {
    const displayNumber = Number(question[1]);
    const expectedNumber = questionIndex + 1;
    const id = question[2];

    if (displayNumber !== expectedNumber) {
      fail(`${level}: expected question number ${expectedNumber}, found ${displayNumber}`);
    }
    if (!new RegExp(`^${level}-(ENERGY|ABILITY|RIASEC|DRIVE|JUNG|READY)-\\d{3}$`).test(id)) {
      fail(`${level}: invalid stable ID ${id}`);
    }

    allIds.push(id);
  });

  total += questions.length;
}

const uniqueIds = new Set(allIds);
if (uniqueIds.size !== allIds.length) {
  fail(`expected ${allIds.length} unique IDs, found ${uniqueIds.size}`);
}

console.log('question bank verification: PASS');
console.log(`L1=32 L2=46 L3=53 L4=59 total=${total}`);
