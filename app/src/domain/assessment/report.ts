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
  // 多元智能
  "intelligence.linguistic": "语言智能",
  "intelligence.logical": "逻辑数学智能",
  "intelligence.spatial": "空间智能",
  "intelligence.bodily": "身体运动智能",
  "intelligence.musical": "音乐智能",
  "intelligence.interpersonal": "人际智能",
  "intelligence.intrapersonal": "内省智能",
  "intelligence.naturalistic": "自然观察智能",
  "intelligence.creativity": "创造力",
  "intelligence.divergence": "发散思维",
  "intelligence.practical": "实践能力",
  // 核心驱动力
  "drive.creation": "创造驱动",
  "drive.exploration": "探索驱动",
  "drive.connection": "连接驱动",
  "drive.influence": "影响驱动",
  "drive.freedom": "自由驱动",
  "drive.security": "安全驱动",
  "drive.balance": "平衡驱动",
  "drive.intrinsic": "内在驱动",
  "drive.extrinsic": "外在驱动",
  "drive.recognition": "外在认可",
  "drive.external_reference": "外在参考",
  "drive.pragmatism": "务实驱动",
  "drive.growth": "成长驱动",
  "drive.independence": "独立倾向",
  // 心理能量
  "energy.solitude": "独处充电",
  "energy.social": "社交充电",
  "energy.social_connection": "社交连接",
  "energy.social_activity": "社交运动",
  "energy.physical_activity": "身体活动",
  "energy.physical_release": "身体释放",
  "energy.physical_peak": "身体巅峰",
  "energy.physical_experience": "身体体验",
  "energy.immersive_thinking": "沉浸思考",
  "energy.immersion_analysis": "沉浸分析",
  "energy.deep_thinking": "深度思考",
  "energy.deep_connection": "深度连接",
  "energy.intellectual_breakthrough": "智力突破",
  "energy.cognitive_stimulation": "认知刷新",
  "energy.flow": "心流体验",
  "energy.certainty": "确定性偏好",
  "energy.ambiguity_tolerance": "模糊性耐受",
  "energy.mastery": "精通感",
  "energy.competition": "竞争刺激",
  "energy.novelty": "新鲜感",
  "energy.openness": "开放性",
  "energy.order": "秩序感",
  "energy.organization": "组织管理",
  "energy.structure_preference": "结构偏好",
  "energy.autonomous_pace": "自主节奏",
  "energy.pressure_activation": "压力激活",
  "energy.performance": "舞台展示",
  "energy.verbal_expression": "语言表达",
  "energy.emotional_connection": "情感连接",
  "energy.creative_expression": "创造表达",
  "energy.creative_making": "创造动手",
  "energy.creative_completion": "创造完成",
  "energy.practical_creation": "实际创造",
  "energy.learning": "求知",
  "energy.learning_exploration": "求知探索",
  "energy.learning_creation": "求知创作",
  "energy.ideation": "构思策划",
  "energy.direction_fit": "方向匹配",
  // 发展准备度
  "readiness.self_awareness": "自我认知",
  "readiness.ability_awareness": "能力认知",
  "readiness.career_information": "职业信息度",
  "readiness.path_information": "路径认知",
  "readiness.decision_ability": "决策能力",
  "readiness.decision_maturity": "决策成熟度",
  "readiness.decision_independence": "决策独立性",
  "readiness.decision_support_needed": "需要决策支持",
  "readiness.realism": "现实取向",
  "readiness.flexibility": "灵活性",
  "readiness.career_adaptability": "职业适应力",
  "readiness.transition_readiness": "转型准备",
  "readiness.exploration_action": "探索行动力",
  "readiness.exploration_needed": "探索期",
  "readiness.exploring": "探索中",
  "readiness.emerging": "方向萌芽",
  "readiness.tentative": "方向暂定",
  "readiness.established": "方向确立",
  "readiness.undifferentiated": "广泛探索期",
  "readiness.high_maturity": "高成熟度",
  "readiness.future_awareness": "未来意识",
  "readiness.interest_clarity": "兴趣清晰度",
  "readiness.interest_ability_clarity": "兴趣能力清晰度",
  "readiness.direction_fit": "方向匹配",
  "readiness.direction_mismatch": "方向待校准",
  "readiness.authenticity": "选择自主性",
  "readiness.not_started": "尚未启动",
  "readiness.avoidance": "回避倾向",
};

const riasecKeys = ["R", "I", "A", "S", "E", "C"] as const;

const readinessPositiveKeys = new Set([
  "readiness.self_awareness",
  "readiness.ability_awareness",
  "readiness.career_information",
  "readiness.path_information",
  "readiness.decision_ability",
  "readiness.decision_maturity",
  "readiness.decision_independence",
  "readiness.realism",
  "readiness.flexibility",
  "readiness.career_adaptability",
  "readiness.transition_readiness",
  "readiness.exploration_action",
  "readiness.high_maturity",
  "readiness.future_awareness",
  "readiness.interest_clarity",
  "readiness.interest_ability_clarity",
  "readiness.direction_fit",
  "readiness.authenticity",
]);

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
  const positiveEntries = entries.filter(([key]) =>
    readinessPositiveKeys.has(key),
  );
  const overall =
    positiveEntries.length === 0
      ? 0
      : Math.round(
          positiveEntries.reduce((total, [, value]) => total + value, 0) /
            positiveEntries.length,
        );

  return { overall, subScores };
}

/**
 * 低证据保护：跳过比例过高或可用信号过少时打标记，
 * 报告层据此降级为"开放探索期"表述，不生成虚假精准结论。
 */
function detectLowEvidence(score: AssessmentScore): boolean {
  const total = score.answeredCount + score.skippedCount;
  if (total === 0) return true;
  if (score.skippedCount / total > 1 / 3) return true;
  if (
    Object.values(score.evidenceByDimension).some(
      ({ answered, skipped }) => answered === 0 && skipped > 0,
    )
  ) {
    return true;
  }

  const usableSignals = Object.values(score.normalizedScores).filter(
    (value) => value > 0,
  );
  return usableSignals.length < 3;
}

export function buildScoreResult(score: AssessmentScore): ScoreResult {
  const lowEvidence = detectLowEvidence(score);
  const riasec = buildRIASEC(score.normalizedScores);
  const hasRIASECEvidence =
    (score.evidenceByDimension.riasec?.answered ?? 0) > 0;
  if (!hasRIASECEvidence && score.evidenceByDimension.riasec?.skipped) {
    riasec.code = "";
  }

  return {
    level: score.level,
    dimensions: buildDimensions(score.normalizedScores),
    jung: buildJung(score.normalizedScores),
    riasec,
    readiness: buildReadiness(score),
    consistencyFlags: lowEvidence ? ["low-evidence"] : [],
    candidateFields:
      lowEvidence || riasec.code.length < 2
        ? []
        : fieldMapping[riasec.code.slice(0, 2)] ?? [],
  };
}
