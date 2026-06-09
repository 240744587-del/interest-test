// ============================================================
// 题库核心类型定义 — 对齐 product-spec-v2.md §9
// ============================================================

/** 教育阶段层级 */
export type Level = 'L1' | 'L2' | 'L3' | 'L4';

/** 题目类型 */
export type QuestionType =
  | 'binary'        // 二选一
  | 'scenario'      // 场景选择（通常4选1）
  | 'likert'        // 1-5分量表
  | 'ranking'       // 排序
  | 'forcedChoice'; // 迫选（选最喜欢+最不喜欢）

/** 六大测评维度 */
export type DimensionKey =
  | 'energy'          // D1: 心理能量模式
  | 'intelligence'    // D2: 天然能力图谱（多元智能）
  | 'riasec'          // D3: RIASEC 兴趣图谱
  | 'drive'           // D4: 核心驱动力
  | 'cognitive'       // D5: 认知与决策风格（荣格）
  | 'readiness';      // D6: 职业发展准备度

// ---------- D1: 心理能量子维度 ----------
export type EnergySubKey =
  | 'energy.extraversion'    // 外倾充电
  | 'energy.introversion'    // 内倾充电
  | 'energy.flow'            // 心流体验
  | 'energy.physical'        // 身体活动充电
  | 'energy.creative'        // 创造表达充电
  | 'energy.social'          // 社交充电
  | 'energy.intellectual'    // 智力突破充电
  | 'energy.certainty'       // 确定性偏好
  | 'energy.ambiguity'       // 模糊性耐受
  | 'energy.competition'     // 竞争刺激
  | 'energy.autonomy'        // 自主节奏
  | 'energy.novelty'         // 新鲜感
  | 'energy.mastery'         // 精通感
  | 'energy.order';          // 秩序感

// ---------- D2: 多元智能子维度 ----------
export type IntelligenceSubKey =
  | 'intel.linguistic'       // 语言智能
  | 'intel.logicMath'        // 逻辑数学智能
  | 'intel.spatial'          // 空间智能
  | 'intel.bodily'           // 身体运动智能
  | 'intel.musical'          // 音乐智能
  | 'intel.interpersonal'    // 人际智能
  | 'intel.intrapersonal'    // 内省智能
  | 'intel.naturalist';      // 自然观察智能

// ---------- D3: RIASEC 子维度 ----------
export type RIASECSubKey =
  | 'riasec.R'   // 实际型
  | 'riasec.I'   // 探究型
  | 'riasec.A'   // 艺术型
  | 'riasec.S'   // 社会型
  | 'riasec.E'   // 企业型
  | 'riasec.C';  // 常规型

// ---------- D4: 核心驱动力子维度 ----------
export type DriveSubKey =
  | 'drive.creation'   // 创造驱动
  | 'drive.explore'    // 探索驱动
  | 'drive.connect'    // 连接驱动
  | 'drive.influence'  // 影响驱动
  | 'drive.freedom'    // 自由驱动
  | 'drive.security'   // 安全驱动
  | 'drive.balance'    // 平衡驱动
  | 'drive.internal'   // 内在动机
  | 'drive.external';  // 外在动机

// ---------- D5: 认知与决策风格（荣格）子维度 ----------
export type CognitiveSubKey =
  | 'jung.E'     // 外倾（与 energy.extraversion 交叉验证）
  | 'jung.I'     // 内倾
  | 'jung.S'     // 感觉
  | 'jung.N'     // 直觉
  | 'jung.T'     // 思维
  | 'jung.F'     // 情感
  | 'jung.J'     // 判断
  | 'jung.P'     // 知觉
  | 'cognitive.independent'   // 独立
  | 'cognitive.collaborative' // 协作
  | 'cognitive.starter'       // 启动型
  | 'cognitive.optimizer';    // 优化型

// ---------- D6: 职业发展准备度子维度 ----------
export type ReadinessSubKey =
  | 'ready.selfAwareness'   // 自我认知度
  | 'ready.careerInfo'      // 职业信息度
  | 'ready.decisionAbility' // 决策能力
  | 'ready.realityOriented' // 现实取向
  | 'ready.adaptability';   // 职业适应力

/** 所有子维度 key 联合类型 */
export type SubDimensionKey =
  | EnergySubKey
  | IntelligenceSubKey
  | RIASECSubKey
  | DriveSubKey
  | CognitiveSubKey
  | ReadinessSubKey;

// ============================================================
// 选项与题目结构
// ============================================================

/** 单个得分项 */
export interface ScoreEntry {
  dimension: DimensionKey;
  subDimension: SubDimensionKey;
  value: number;
}

/** 选项 */
export interface Option {
  id: string;
  text: string;
  scores: ScoreEntry[];
}

/** 题目 */
export interface Question {
  id: string;
  type: QuestionType;
  level: Level;
  dimension: DimensionKey;
  text: string;
  description?: string;
  options: Option[];
  /** likert 题的陈述文本 */
  likertStatement?: string;
  /** 是否反向计分（仅 likert） */
  reversed?: boolean;
  /** 理论来源标注 */
  theorySource?: string;
  /** 配对验证题 ID（用于一致性检测） */
  validationPairId?: string;
}

/** 单个层级的完整题库 */
export interface QuestionBank {
  level: Level;
  questions: Question[];
  estimatedMinutes: number;
}

// ============================================================
// 答案结构 — 对齐 product-spec-v2.md §9.1
// ============================================================

export type AnswerValue =
  | { kind: 'single'; optionId: string }
  | { kind: 'likert'; value: 1 | 2 | 3 | 4 | 5 }
  | { kind: 'ranking'; optionIds: string[] }
  | { kind: 'forcedChoice'; mostOptionId: string; leastOptionId?: string };

export interface Answer {
  questionId: string;
  value: AnswerValue;
}

export interface ScoreRequest {
  level: Level;
  answers: Answer[];
}

// ============================================================
// 评分结果 — 对齐 product-spec-v2.md §9.2
// ============================================================

export interface NormalizedSubScore {
  key: string;
  label: string;
  score: number; // 0-100
}

export interface DimensionResult {
  key: DimensionKey;
  label: string;
  subScores: NormalizedSubScore[];
}

export interface JungSpectrum {
  EI: number; // 0=极端内倾, 50=平衡, 100=极端外倾
  SN: number; // 0=极端感觉, 100=极端直觉
  TF: number; // 0=极端思维, 100=极端情感
  JP: number; // 0=极端判断, 100=极端知觉
}

export interface RIASECResult {
  scores: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', number>;
  code: string; // e.g. "IAS"
  consistency: 'high' | 'medium' | 'low';
  differentiation: 'high' | 'medium' | 'low';
  clarity: 'high' | 'medium' | 'low';
}

export interface ReadinessResult {
  overall: number;
  subScores: Record<string, number>;
}

export interface ScoreResult {
  level: Level;
  dimensions: DimensionResult[];
  jung: JungSpectrum;
  riasec: RIASECResult;
  readiness?: ReadinessResult;
  consistencyFlags: string[];
  candidateFields: string[];
}

// ============================================================
// 报告请求 — 对齐 product-spec-v2.md §9.3
// ============================================================

export interface ReportRequest {
  level: Level;
  summary: ScoreResult;
}
