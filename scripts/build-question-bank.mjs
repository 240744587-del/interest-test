import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'docs/archive/question-bank-v1.md');
const supplementPath = path.join(root, 'docs/archive/question-bank-supplement-v2.md');
const outputPath = path.join(root, 'question-bank-v2.md');

function parseQuestions(markdown) {
  const lines = markdown.split('\n');
  const questions = [];
  let current = null;

  function finishCurrent() {
    if (!current) return;
    while (current.lines.at(-1)?.trim() === '' || current.lines.at(-1)?.trim() === '---') {
      current.lines.pop();
    }
    questions.push({
      label: current.label,
      body: current.lines.join('\n').trim(),
    });
    current = null;
  }

  for (const line of lines) {
    const questionMatch = line.match(/^\*\*(Q[^*]+)\*\*(.*)$/);
    if (questionMatch) {
      finishCurrent();
      current = {
        label: questionMatch[1],
        lines: [questionMatch[2].trim()],
      };
      continue;
    }

    if (/^#{1,2} /.test(line)) {
      finishCurrent();
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  finishCurrent();
  return new Map(questions.map((question) => [question.label, question.body]));
}

const supplementQuestions = parseQuestions(fs.readFileSync(supplementPath, 'utf8'));

function sourceLevelQuestions(markdown, level) {
  const startPattern = new RegExp(`^# ${level}\\b.*$`, 'm');
  const startMatch = markdown.match(startPattern);
  if (!startMatch) throw new Error(`Missing source level ${level}`);
  const start = startMatch.index;
  const remaining = markdown.slice(start + startMatch[0].length);
  const nextLevel = remaining.search(/^# L[1-4]\b.*$/m);
  return parseQuestions(nextLevel === -1 ? remaining : remaining.slice(0, nextLevel));
}

const sourceMarkdown = fs.readFileSync(sourcePath, 'utf8');
const levelSources = Object.fromEntries(
  ['L1', 'L2', 'L3', 'L4'].map((level) => [level, sourceLevelQuestions(sourceMarkdown, level)]),
);

function originals(level, numbers, category) {
  return numbers.map((number) => ({
    sourceLabel: `Q${number}`,
    body: levelSources[level].get(`Q${number}`),
    category,
  }));
}

function supplements(labels, category) {
  return labels.map((label) => ({
    sourceLabel: label,
    body: supplementQuestions.get(label),
    category,
  }));
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function labels(prefix, count) {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

const riasecForcedChoice = labels('Q-RIASEC-FC-', 4);

const levels = {
  L1: {
    title: '小学版',
    questions: [
      ...originals('L1', range(1, 6), 'ENERGY'),
      ...originals('L1', range(7, 14), 'ABILITY'),
      ...originals('L1', range(15, 22), 'RIASEC'),
      ...originals('L1', range(23, 26), 'DRIVE'),
      ...supplements(labels('Q-Jung-L1-', 6), 'JUNG'),
    ],
  },
  L2: {
    title: '初中版',
    questions: [
      ...originals('L2', range(1, 8), 'ENERGY'),
      ...originals('L2', range(9, 18), 'ABILITY'),
      ...originals('L2', range(19, 28), 'RIASEC'),
      ...originals('L2', range(29, 34), 'DRIVE'),
      ...supplements(labels('Q-Jung-L2-', 8), 'JUNG'),
      ...supplements(labels('Q-Ready-L2-', 4), 'READY'),
    ],
  },
  L3: {
    title: '高中版',
    questions: [
      ...originals('L3', range(1, 9), 'ENERGY'),
      ...originals('L3', range(10, 19), 'ABILITY'),
      ...originals('L3', range(22, 27), 'RIASEC'),
      ...supplements(riasecForcedChoice, 'RIASEC'),
      ...originals('L3', range(30, 37), 'DRIVE'),
      ...supplements(labels('Q-Jung-L3-', 8), 'JUNG'),
      ...supplements(labels('Q-Ready-L3-', 8), 'READY'),
    ],
  },
  L4: {
    title: '大学及成人版',
    questions: [
      ...originals('L4', range(1, 10), 'ENERGY'),
      ...originals('L4', range(11, 20), 'ABILITY'),
      ...originals('L4', [21, ...range(23, 28)], 'RIASEC'),
      ...supplements(riasecForcedChoice, 'RIASEC'),
      ...originals('L4', range(31, 40), 'DRIVE'),
      ...supplements(labels('Q-Jung-L4-', 8), 'JUNG'),
      ...supplements(labels('Q-Ready-L4-', 10), 'READY'),
    ],
  },
};

const categoryTitles = {
  ENERGY: '心理能量模式',
  ABILITY: '天然能力图谱',
  RIASEC: 'RIASEC 兴趣图谱',
  DRIVE: '核心驱动力',
  JUNG: '认知与决策风格',
  READY: '职业发展准备度',
};

function assertSourcesExist() {
  for (const [level, config] of Object.entries(levels)) {
    for (const question of config.questions) {
      if (!question.body) {
        throw new Error(`${level}: source question ${question.sourceLabel} was not found`);
      }
    }
  }
}

function renderLevel(level, config) {
  const categoryCounters = {};
  let currentCategory = null;
  const output = [`# ${level} ${config.title}（共 ${config.questions.length} 题）`, ''];

  config.questions.forEach((question, index) => {
    if (question.category !== currentCategory) {
      currentCategory = question.category;
      output.push(`## ${categoryTitles[currentCategory]}`, '');
    }

    categoryCounters[currentCategory] = (categoryCounters[currentCategory] ?? 0) + 1;
    const id = `${level}-${currentCategory}-${String(categoryCounters[currentCategory]).padStart(3, '0')}`;

    output.push(`**第 ${index + 1} 题** \`${id}\``, question.body, '');
  });

  return output.join('\n').trim();
}

assertSourcesExist();

const header = `# 「探路者」最终题库 v2.0

> 状态：MVP 开发唯一题库
> 生成日期：2026-06-09
> 权威规格：\`product-spec-v2.md\`
> 来源：\`docs/archive/question-bank-v1.md\` 与 \`docs/archive/question-bank-supplement-v2.md\`

## 使用说明

- 层级按教育阶段选择：L1 小学、L2 初中、L3 高中、L4 大学及以上和已工作成人。
- 本题库不包含开放文本题。
- 稳定 ID 用于代码、答案和评分映射；“第 N 题”仅用于界面显示。
- 题目文字和计分标注保留自来源文档，替换范围记录在合并设计文档中。
`;

const output = [
  header.trim(),
  ...Object.entries(levels).map(([level, config]) => renderLevel(level, config)),
  '',
].join('\n\n---\n\n');

fs.writeFileSync(outputPath, output);
console.log(`generated ${path.basename(outputPath)}`);
