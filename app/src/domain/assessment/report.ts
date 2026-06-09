import type {
  DimensionKey,
  DimensionResult,
  JungSpectrum,
  RIASECResult,
  ScoreResult,
} from "../../lib/questions/types";
import type { AssessmentScore } from "./score";

const dimensions: Array<{
  prefix: string;
  key: DimensionKey;
  label: string;
}> = [
  { prefix: "energy", key: "energy", label: "心理能量模式" },
  { prefix: "intelligence", key: "intelligence", label: "天然能力图谱" },
  { prefix: "riasec", key: "riasec", label: "RIASEC 兴趣图谱" },
  { prefix: "drive", key: "drive", label: "核心驱动力" },
  { prefix: "jung", key: "cognitive", label: "认知与决策风格" },
  { prefix: "readiness", key: "readiness", label: "职业发展准备度" },
];

const subScoreLabels: Record<string, string> = {
  "riasec.R": "实际型 (R)",
  "riasec.I": "探究型 (I)",
  "riasec.A": "艺术型 (A)",
  "riasec.S": "社会型 (S)",
  "riasec.E": "企业型 (E)",
  "riasec.C": "常规型 (C)",
  "jung.E": "外倾",
  "jung.I": "内倾",
  "jung.S": "感觉",
  "jung.N": "直觉",
  "jung.T": "思维",
  "jung.F": "情感",
  "jung.J": "判断",
  "jung.P": "知觉",
};

const riasecKeys = ["R", "I", "A", "S", "E", "C"] as const;

const fieldMapping: Record<string, string[]> = {
  RI: ["工程技术", "软件开发", "建筑设计"],
  IR: ["科学研究", "数据分析", "机械工程"],
  IA: ["科学写作", "建筑设计", "科技创业"],
  AI: ["设计", "科幻创作", "产品设计"],
  AS: ["教育创新", "艺术治疗", "文化传播"],
  SA: ["心理咨询", "教育", "社会工作"],
  SE: ["人力资源", "培训教练", "医疗管理"],
  ES: ["管理", "市场营销", "公关"],
  EI: ["技术创业", "投资分析", "产品经理"],
  IE: ["研究管理", "咨询", "技术领导"],
  EC: ["企业管理", "金融", "行政管理"],
  CE: ["财务管理", "运营管理", "供应链"],
  RC: ["制造业", "质量管理", "技术维护"],
  CR: ["数据管理", "档案管理", "实验室技术"],
  IS: ["医学研究", "心理学", "教育研究"],
  SI: ["医疗健康", "学校咨询", "社区发展"],
  RA: ["手工艺", "工业设计", "园林设计"],
  AR: ["摄影", "雕塑", "产品制作"],
  SC: ["医疗行政", "教育管理", "社区服务"],
  CS: ["医疗记录", "学校行政", "图书管理"],
  AE: ["创业", "品牌策划", "影视制作"],
  EA: ["娱乐管理", "广告", "公关传播"],
  IC: ["信息科学", "药学", "精算"],
  CI: ["数据科学", "审计", "系统分析"],
  RE: ["项目管理", "施工管理", "物流"],
  ER: ["体育管理", "户外领导", "销售管理"],
  AC: ["平面设计", "编辑出版", "博物馆管理"],
  CA: ["排版设计", "音乐制作", "展览策划"],
};

function buildDimensions(
  normalizedScores: Record<string, number>,
): DimensionResult[] {
  return dimensions.flatMap(({ prefix, key, label }) => {
    const subScores = Object.entries(normalizedScores)
      .filter(([scoreKey]) => scoreKey.startsWith(`${prefix}.`))
      .map(([scoreKey, score]) => ({
        key: scoreKey,
        label: subScoreLabels[scoreKey] ?? scoreKey,
        score,
      }))
      .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));

    return subScores.length > 0 ? [{ key, label, subScores }] : [];
  });
}

function buildRIASEC(
  normalizedScores: Record<string, number>,
): RIASECResult {
  const scores = Object.fromEntries(
    riasecKeys.map((key) => [key, normalizedScores[`riasec.${key}`] ?? 0]),
  ) as RIASECResult["scores"];
  const sorted = [...riasecKeys].sort(
    (a, b) => scores[b] - scores[a] || a.localeCompare(b),
  );
  const values = Object.values(scores);
  const difference = Math.max(...values) - Math.min(...values);
  const differentiation =
    difference >= 40 ? "high" : difference >= 20 ? "medium" : "low";

  const hexOrder = ["R", "I", "A", "S", "E", "C"];
  const firstIndex = hexOrder.indexOf(sorted[0]);
  const secondIndex = hexOrder.indexOf(sorted[1]);
  const distance = Math.min(
    Math.abs(firstIndex - secondIndex),
    6 - Math.abs(firstIndex - secondIndex),
  );
  const consistency =
    distance <= 1 ? "high" : distance === 2 ? "medium" : "low";

  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) /
    values.length;
  const standardDeviation = Math.sqrt(variance);
  const clarity =
    standardDeviation >= 25
      ? "high"
      : standardDeviation >= 12
        ? "medium"
        : "low";

  return {
    scores,
    code: sorted.slice(0, 3).join(""),
    consistency,
    differentiation,
    clarity,
  };
}

function buildJung(
  normalizedScores: Record<string, number>,
): JungSpectrum {
  const pair = (leftKey: string, rightKey: string) => {
    const left = normalizedScores[leftKey] ?? 0;
    const right = normalizedScores[rightKey] ?? 0;
    return left + right === 0
      ? 50
      : Math.round((right / (left + right)) * 100);
  };

  return {
    EI: pair("jung.I", "jung.E"),
    SN: pair("jung.S", "jung.N"),
    TF: pair("jung.T", "jung.F"),
    JP: pair("jung.J", "jung.P"),
  };
}

function buildReadiness(score: AssessmentScore) {
  if (score.level === "L1") return undefined;

  const entries = Object.entries(score.normalizedScores).filter(([key]) =>
    key.startsWith("readiness."),
  );
  const subScores = Object.fromEntries(entries);
  const overall =
    entries.length === 0
      ? 0
      : Math.round(
          entries.reduce((total, [, value]) => total + value, 0) /
            entries.length,
        );

  return { overall, subScores };
}

export function buildScoreResult(score: AssessmentScore): ScoreResult {
  const riasec = buildRIASEC(score.normalizedScores);

  return {
    level: score.level,
    dimensions: buildDimensions(score.normalizedScores),
    jung: buildJung(score.normalizedScores),
    riasec,
    readiness: buildReadiness(score),
    consistencyFlags: [],
    candidateFields: fieldMapping[riasec.code.slice(0, 2)] ?? [],
  };
}
