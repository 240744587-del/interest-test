const zeroScoreLabels = new Set(["平衡", "平衡型", "其他方向"]);

const intelligenceAliases = new Map([
  ["语言智能", "intelligence.linguistic"],
  ["人际智能", "intelligence.interpersonal"],
  ["逻辑数学智能", "intelligence.logical"],
  ["逻辑", "intelligence.logical"],
  ["分析", "intelligence.logical"],
  ["内省智能", "intelligence.intrapersonal"],
  ["内省", "intelligence.intrapersonal"],
  ["空间智能", "intelligence.spatial"],
  ["空间", "intelligence.spatial"],
  ["身体运动智能", "intelligence.bodily"],
  ["身体运动", "intelligence.bodily"],
  ["音乐智能", "intelligence.musical"],
  ["自然观察智能", "intelligence.naturalistic"],
  ["创造", "intelligence.creativity"],
  ["发散", "intelligence.divergence"],
  ["实际", "intelligence.practical"],
]);

const driveAliases = new Map([
  ["创造驱动", "drive.creation"],
  ["探索驱动", "drive.exploration"],
  ["连接驱动", "drive.connection"],
  ["连接", "drive.connection"],
  ["影响驱动", "drive.influence"],
  ["影响", "drive.influence"],
  ["自由驱动", "drive.freedom"],
  ["自由", "drive.freedom"],
  ["安全驱动", "drive.security"],
  ["安全倾向", "drive.security"],
  ["安全", "drive.security"],
  ["平衡驱动", "drive.balance"],
  ["内在驱动", "drive.intrinsic"],
  ["内在动机", "drive.intrinsic"],
  ["外在驱动", "drive.extrinsic"],
  ["外在动机", "drive.extrinsic"],
  ["外在认可驱动", "drive.recognition"],
  ["外在参考", "drive.external_reference"],
  ["务实", "drive.pragmatism"],
  ["成长", "drive.growth"],
  ["探索倾向", "drive.exploration"],
  ["独立倾向", "drive.independence"],
]);

const energyAliases = new Map([
  ["沉浸+分析", "immersion_analysis"],
  ["沉浸思考", "immersive_thinking"],
  ["创造表达", "creative_expression"],
  ["创造动手", "creative_making"],
  ["创造完成", "creative_completion"],
  ["独处", "solitude"],
  ["独处充电", "solitude"],
  ["方向匹配度指标", "direction_fit"],
  ["构思策划", "ideation"],
  ["混沌耐受", "ambiguity_tolerance"],
  ["结构偏好", "structure_preference"],
  ["精通感", "mastery"],
  ["竞争刺激", "competition"],
  ["开放性", "openness"],
  ["模糊性耐受", "ambiguity_tolerance"],
  ["情感连接", "emotional_connection"],
  ["求知", "learning"],
  ["求知创作", "learning_creation"],
  ["求知探索", "learning_exploration"],
  ["确定性", "certainty"],
  ["确定性偏好", "certainty"],
  ["认知冲击", "cognitive_stimulation"],
  ["认知刷新", "cognitive_stimulation"],
  ["社交", "social"],
  ["社交充电", "social"],
  ["社交连接", "social_connection"],
  ["社交运动", "social_activity"],
  ["身体巅峰", "physical_peak"],
  ["身体活动", "physical_activity"],
  ["身体释放", "physical_release"],
  ["身体体验", "physical_experience"],
  ["深度连接", "deep_connection"],
  ["深度思考", "deep_thinking"],
  ["实际创造", "practical_creation"],
  ["外部压力激活", "pressure_activation"],
  ["舞台展示", "performance"],
  ["心流体验", "flow"],
  ["新鲜感", "novelty"],
  ["语言表达", "verbal_expression"],
  ["运动", "physical_activity"],
  ["智力突破", "intellectual_breakthrough"],
  ["自主节奏", "autonomous_pace"],
  ["组织管理", "organization"],
]);

const readinessAliases = new Map([
  ["低成熟度-需要探索", "exploration_needed"],
  ["方向不匹配信号", "direction_mismatch"],
  ["方向匹配度", "direction_fit"],
  ["高成熟度", "high_maturity"],
  ["极低成熟度/回避", "avoidance"],
  ["决策成熟度", "decision_maturity"],
  ["决策独立性", "decision_independence"],
  ["决策能力", "decision_ability"],
  ["探索行动力", "exploration_action"],
  ["探索中-需要决策", "exploring"],
  ["现实取向", "realism"],
  ["现实取向-灵活性", "flexibility"],
  ["已确立", "established"],
  ["暂定中", "tentative"],
  ["职业适应力-转型意愿", "transition_readiness"],
  [
    "职业适应力——对应Savickas的Career Adaptability",
    "career_adaptability",
  ],
  ["职业探索行动力", "exploration_action"],
  ["职业信息度", "career_information"],
  ["职业信息度-路径认知", "path_information"],
  ["中成熟度-需要决策支持", "decision_support_needed"],
  ["准备度-尚未启动", "not_started"],
  ["准备度-有萌芽", "emerging"],
  ["未分化-需要深度探索", "undifferentiated"],
  ["自我认知", "self_awareness"],
  ["自我认知-能力认知", "ability_awareness"],
  ["自我认知-未来意识", "future_awareness"],
  ["自我认知-兴趣能力明确度", "interest_ability_clarity"],
  ["自我认知-兴趣清晰度", "interest_clarity"],
  ["自我认知-真我辨识", "authenticity"],
]);

const fullLabelAliases = new Map([
  ["能量-秩序感+精通驱动", ["energy.order", "energy.mastery"]],
  ["创造+发散", ["intelligence.creativity", "intelligence.divergence"]],
  ["发散+探索", ["intelligence.divergence", "drive.exploration"]],
  ["分析+常规", ["intelligence.logical", "riasec.C"]],
  ["空间+艺术+发散", ["intelligence.spatial", "riasec.A", "intelligence.divergence"]],
  ["逻辑+常规", ["intelligence.logical", "riasec.C"]],
  ["逻辑+内省+企业", ["intelligence.logical", "intelligence.intrapersonal", "riasec.E"]],
  ["人际+企业", ["intelligence.interpersonal", "riasec.E"]],
  ["人际+社会", ["intelligence.interpersonal", "riasec.S"]],
  ["实际+逻辑", ["intelligence.practical", "intelligence.logical"]],
  ["实际+身体运动", ["intelligence.practical", "intelligence.bodily"]],
  ["探索+创造", ["drive.exploration", "drive.creation"]],
  ["影响+外在", ["drive.influence", "drive.extrinsic"]],
  ["J-P 平衡", ["jung.J", "jung.P"]],
  ["T+F 混合", ["jung.T", "jung.F"]],
  ["P 知觉-整合型", ["jung.P"]],
  ["P 知觉+自主", ["jung.P", "drive.freedom"]],
]);

function uniqueTargets(keys, value) {
  return [...new Set(keys)].map((key) => ({ key, value }));
}

function parseRiasec(label) {
  const hasRiasecLanguage =
    /^[RIASEC](?:\b|$|\s|\/|\+)/.test(label) ||
    /(实际型|探究型|艺术型|社会型|企业型|常规型)/.test(label);
  if (!hasRiasecLanguage) return [];

  return [...new Set(label.match(/[RIASEC]/g) ?? [])].map(
    (letter) => `riasec.${letter}`,
  );
}

function parseJung(label) {
  const keys = [];
  if (/^[SNTFJP](?:\+[SNTFJP])+$/.test(label)) {
    return [...new Set(label.match(/[SNTFJP]/g) ?? [])].map(
      (letter) => `jung.${letter}`,
    );
  }
  const definitions = [
    ["S", /S 感觉/],
    ["N", /N 直觉/],
    ["T", /T 思维/],
    ["F", /F 情感/],
    ["J", /J 判断/],
    ["P", /P (知觉|极端知觉)/],
  ];

  for (const [letter, pattern] of definitions) {
    if (pattern.test(label)) keys.push(`jung.${letter}`);
  }
  return keys;
}

function parseCompositeAtoms(label) {
  const keys = [];
  const normalized = label.replaceAll(" ", "");

  for (const [atom, key] of intelligenceAliases) {
    if (normalized.includes(atom)) keys.push(key);
  }
  for (const [atom, key] of driveAliases) {
    if (normalized.includes(atom)) keys.push(key);
  }

  return keys;
}

export function parseScoreLabel(label, value) {
  const normalized = label.trim();
  if (value === 0) return [];
  if (zeroScoreLabels.has(normalized)) return [];

  const fullAlias = fullLabelAliases.get(normalized);
  if (fullAlias) return uniqueTargets(fullAlias, value);

  if (normalized.startsWith("能量-")) {
    const energyLabel = normalized.slice("能量-".length);
    const key = energyAliases.get(energyLabel);
    if (!key) throw new Error(`Unknown score label: ${label}`);
    return [{ key: `energy.${key}`, value }];
  }

  const readinessKey = readinessAliases.get(normalized);
  if (readinessKey) return [{ key: `readiness.${readinessKey}`, value }];

  const directIntelligence = intelligenceAliases.get(normalized);
  if (directIntelligence) return [{ key: directIntelligence, value }];

  const directDrive = driveAliases.get(normalized);
  if (directDrive) return [{ key: directDrive, value }];

  const compactJungKeys = parseJung(normalized);
  if (compactJungKeys.length > 0) {
    return uniqueTargets(compactJungKeys, value);
  }

  const riasecKeys = parseRiasec(normalized);
  if (riasecKeys.length > 0) return uniqueTargets(riasecKeys, value);

  const keys = parseCompositeAtoms(normalized);

  if (keys.length === 0) {
    throw new Error(`Unknown score label: ${label}`);
  }

  return uniqueTargets(keys, value);
}

function parseQuestionType(typeLine, sourceMarkdown) {
  if (typeLine.includes("量表题")) return "likert";
  if (typeLine.includes("排序题")) return "ranking";
  if (typeLine.includes("迫选")) {
    return sourceMarkdown.includes("最不") ? "forcedChoice" : "single";
  }
  if (typeLine.includes("二选一") || typeLine.includes("场景选择")) {
    return "single";
  }
  throw new Error(`Unknown question type: ${typeLine}`);
}

function extractScoreAnnotation(line, fallbackValue = 1) {
  const labelMatch = line.match(/\[([^\]]+)\]/);
  if (!labelMatch) return [];
  const valueMatch = line.match(/\]\s*([+-]\d+)/);
  const value = valueMatch ? Number(valueMatch[1]) : fallbackValue;
  return parseScoreLabel(labelMatch[1], value);
}

function parseQuestionBlock(level, number, id, block) {
  const lines = block.split("\n").map((line) => line.trim());
  const nonEmpty = lines.filter(Boolean);
  const typeLine = nonEmpty[0];
  const sourceMarkdown = block.trim();
  const type = parseQuestionType(typeLine, sourceMarkdown);
  const optionLines = nonEmpty.filter((line) => /^- [A-F]\./.test(line));
  const directScoreLine = nonEmpty.find((line) => line.startsWith("→"));
  const selectionValue =
    type === "single"
      ? Number(directScoreLine?.match(/选中\s*\+(\d+)/)?.[1] ?? 1)
      : 1;
  const firstScoringLineIndex = nonEmpty.findIndex(
    (line) => /^- [A-F]\./.test(line) || line.startsWith("→"),
  );
  const promptLines = nonEmpty
    .slice(1, firstScoringLineIndex === -1 ? undefined : firstScoringLineIndex)
    .filter((line) => !/^- \d=/.test(line));
  const prompt = promptLines.join("\n").replace(/^"|"$/g, "");

  const options = optionLines.map((line) => {
    const optionMatch = line.match(/^- ([A-F])\.\s*(.*?)(?:\s*→\s*(.*))?$/);
    if (!optionMatch) throw new Error(`${id}: cannot parse option ${line}`);
    const [, optionId, text, annotation = ""] = optionMatch;
    return {
      id: optionId,
      text: text.trim(),
      scores: extractScoreAnnotation(annotation, selectionValue),
    };
  });

  const likertScores =
    type === "likert" && directScoreLine
      ? extractScoreAnnotation(directScoreLine)
      : undefined;

  return {
    id,
    level,
    number,
    type,
    prompt,
    options,
    ...(likertScores ? { likertScores } : {}),
    ...(directScoreLine?.includes("反向计分") ? { reverse: true } : {}),
    sourceMarkdown,
  };
}

export function parseQuestionBank(markdown) {
  const levelHeadings = [...markdown.matchAll(/^# (L[1-4])\b.*$/gm)];
  const questionBanks = { L1: [], L2: [], L3: [], L4: [] };

  for (let levelIndex = 0; levelIndex < levelHeadings.length; levelIndex += 1) {
    const levelMatch = levelHeadings[levelIndex];
    const level = levelMatch[1];
    const sectionStart = levelMatch.index + levelMatch[0].length;
    const sectionEnd =
      levelHeadings[levelIndex + 1]?.index ?? markdown.length;
    const section = markdown.slice(sectionStart, sectionEnd);
    const questionHeadings = [
      ...section.matchAll(/^\*\*第 (\d+) 题\*\* `([^`]+)`$/gm),
    ];

    for (
      let questionIndex = 0;
      questionIndex < questionHeadings.length;
      questionIndex += 1
    ) {
      const questionMatch = questionHeadings[questionIndex];
      const start = questionMatch.index + questionMatch[0].length;
      const end =
        questionHeadings[questionIndex + 1]?.index ?? section.length;
      questionBanks[level].push(
        parseQuestionBlock(
          level,
          Number(questionMatch[1]),
          questionMatch[2],
          section.slice(start, end),
        ),
      );
    }
  }

  return questionBanks;
}
