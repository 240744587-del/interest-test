import type {
  Answer,
  Level,
  ScoreResult,
  DimensionResult,
  NormalizedSubScore,
  JungSpectrum,
  RIASECResult,
  ReadinessResult,
  Question,
  DimensionKey,
} from '@/lib/questions/types';
import { getQuestionBank } from '@/lib/questions';

// ============================================================
// 维度标签映射
// ============================================================

const dimensionLabels: Record<DimensionKey, string> = {
  energy: '心理能量模式',
  intelligence: '天然能力图谱',
  riasec: 'RIASEC 兴趣图谱',
  drive: '核心驱动力',
  cognitive: '认知与决策风格',
  readiness: '职业发展准备度',
};

const subDimensionLabels: Record<string, string> = {
  'energy.extraversion': '外倾充电',
  'energy.introversion': '内倾充电',
  'energy.flow': '心流体验',
  'energy.physical': '身体活动',
  'energy.creative': '创造表达',
  'energy.social': '社交充电',
  'energy.intellectual': '智力探索',
  'energy.certainty': '确定性偏好',
  'energy.ambiguity': '模糊性耐受',
  'energy.novelty': '新鲜感',
  'energy.mastery': '精通感',
  'energy.order': '秩序感',
  'energy.competition': '竞争刺激',
  'energy.autonomy': '自主节奏',
  'intel.linguistic': '语言智能',
  'intel.logicMath': '逻辑数学智能',
  'intel.spatial': '空间智能',
  'intel.bodily': '身体运动智能',
  'intel.musical': '音乐智能',
  'intel.interpersonal': '人际智能',
  'intel.intrapersonal': '内省智能',
  'intel.naturalist': '自然观察智能',
  'riasec.R': '实际型 (R)',
  'riasec.I': '探究型 (I)',
  'riasec.A': '艺术型 (A)',
  'riasec.S': '社会型 (S)',
  'riasec.E': '企业型 (E)',
  'riasec.C': '常规型 (C)',
  'drive.creation': '创造驱动',
  'drive.explore': '探索驱动',
  'drive.connect': '连接驱动',
  'drive.influence': '影响驱动',
  'drive.freedom': '自由驱动',
  'drive.security': '安全驱动',
  'drive.balance': '平衡驱动',
  'drive.internal': '内在动机',
  'drive.external': '外在动机',
  'jung.E': '外倾',
  'jung.I': '内倾',
  'jung.S': '感觉',
  'jung.N': '直觉',
  'jung.T': '思维',
  'jung.F': '情感',
  'jung.J': '判断',
  'jung.P': '知觉',
  'cognitive.independent': '独立',
  'cognitive.collaborative': '协作',
  'cognitive.starter': '启动型',
  'cognitive.optimizer': '优化型',
  'ready.selfAwareness': '自我认知',
  'ready.careerInfo': '职业信息',
  'ready.decisionAbility': '决策能力',
  'ready.realityOriented': '现实取向',
  'ready.adaptability': '职业适应力',
};

// ============================================================
// 排序题计分规则: 1st=+5, 2nd=+3, 3rd=+1, rest=0
// ============================================================
const RANKING_SCORES = [5, 3, 1, 0, 0, 0];

// ============================================================
// 核心评分函数
// ============================================================

export function calculateScores(level: Level, answers: Answer[]): ScoreResult {
  const bank = getQuestionBank(level);
  const questionMap = new Map(bank.questions.map((q) => [q.id, q]));

  // 原始分累加器
  const rawScores: Record<string, number> = {};
  // 收集一致性检测数据
  const consistencyFlags: string[] = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    if (answer.value.kind === 'single') {
      // 二选一 / 场景选择
      const opt = question.options.find((o) => o.id === (answer.value as { kind: 'single'; optionId: string }).optionId);
      if (opt) {
        for (const score of opt.scores) {
          const key = score.subDimension;
          rawScores[key] = (rawScores[key] || 0) + score.value;
        }
      }
    } else if (answer.value.kind === 'likert') {
      // 量表题
      const val = answer.value.value;
      const actualVal = question.reversed ? (6 - val) : val;
      if (question.options[0]?.scores[0]) {
        const entry = question.options[0].scores[0];
        const key = entry.subDimension;
        rawScores[key] = (rawScores[key] || 0) + actualVal;
      }
    } else if (answer.value.kind === 'ranking') {
      // 排序题
      const ids = answer.value.optionIds;
      for (let rank = 0; rank < ids.length; rank++) {
        const opt = question.options.find((o) => o.id === ids[rank]);
        if (opt && opt.scores[0]) {
          const key = opt.scores[0].subDimension;
          rawScores[key] = (rawScores[key] || 0) + RANKING_SCORES[rank];
        }
      }
    } else if (answer.value.kind === 'forcedChoice') {
      // 迫选题
      const { mostOptionId, leastOptionId } = answer.value;
      const mostOpt = question.options.find((o) => o.id === mostOptionId);
      const leastOpt = leastOptionId ? question.options.find((o) => o.id === leastOptionId) : null;
      if (mostOpt?.scores[0]) {
        const key = mostOpt.scores[0].subDimension;
        rawScores[key] = (rawScores[key] || 0) + 4;
      }
      if (leastOpt?.scores[0]) {
        const key = leastOpt.scores[0].subDimension;
        rawScores[key] = (rawScores[key] || 0) - 2;
      }
    }
  }

  // 构建理论范围（简化版：基于题库所有题目扫描）
  const theoreticalRange = computeTheoreticalRange(bank.questions);

  // 标准化得分
  const normalizedScores: Record<string, number> = {};
  for (const [key, raw] of Object.entries(rawScores)) {
    const range = theoreticalRange[key];
    if (range && range.max > range.min) {
      normalizedScores[key] = Math.round(
        Math.max(0, Math.min(100, ((raw - range.min) / (range.max - range.min)) * 100))
      );
    } else {
      normalizedScores[key] = Math.round(Math.max(0, Math.min(100, raw * 10)));
    }
  }

  // 组装维度结果
  const dimensionGroups: Record<DimensionKey, NormalizedSubScore[]> = {
    energy: [],
    intelligence: [],
    riasec: [],
    drive: [],
    cognitive: [],
    readiness: [],
  };

  for (const [key, score] of Object.entries(normalizedScores)) {
    const dim = key.split('.')[0] as string;
    const dimKey = dimPrefixToKey(dim);
    if (dimKey && dimensionGroups[dimKey]) {
      dimensionGroups[dimKey].push({
        key,
        label: subDimensionLabels[key] || key,
        score,
      });
    }
  }

  const dimensions: DimensionResult[] = Object.entries(dimensionGroups)
    .filter(([, subs]) => subs.length > 0)
    .map(([key, subScores]) => ({
      key: key as DimensionKey,
      label: dimensionLabels[key as DimensionKey] || key,
      subScores: subScores.sort((a, b) => b.score - a.score),
    }));

  // 荣格光谱
  const jung = computeJungSpectrum(normalizedScores);

  // RIASEC
  const riasec = computeRIASEC(normalizedScores);

  // 准备度（L2+）
  const readiness = level !== 'L1' ? computeReadiness(normalizedScores) : undefined;

  // 候选领域
  const candidateFields = suggestFields(riasec, normalizedScores);

  return {
    level,
    dimensions,
    jung,
    riasec,
    readiness,
    consistencyFlags,
    candidateFields,
  };
}

// ============================================================
// 辅助函数
// ============================================================

function dimPrefixToKey(prefix: string): DimensionKey | null {
  const map: Record<string, DimensionKey> = {
    energy: 'energy',
    intel: 'intelligence',
    riasec: 'riasec',
    drive: 'drive',
    jung: 'cognitive',
    cognitive: 'cognitive',
    ready: 'readiness',
  };
  return map[prefix] || null;
}

function computeTheoreticalRange(questions: Question[]): Record<string, { min: number; max: number }> {
  const range: Record<string, { min: number; max: number }> = {};

  for (const q of questions) {
    if (q.type === 'binary' || q.type === 'scenario') {
      // 每题只选一个选项，该选项的得分就是贡献
      for (const opt of q.options) {
        for (const s of opt.scores) {
          if (!range[s.subDimension]) range[s.subDimension] = { min: 0, max: 0 };
          // 最大可能 = 选到该选项
          range[s.subDimension].max += s.value;
        }
      }
      // 但实际每题只选一个，所以max应该是各题中该维度最大值的累加
      // 简化处理：保持当前逻辑，后续可以精确化
    } else if (q.type === 'likert') {
      if (q.options[0]?.scores[0]) {
        const key = q.options[0].scores[0].subDimension;
        if (!range[key]) range[key] = { min: 0, max: 0 };
        range[key].min += 1;
        range[key].max += 5;
      }
    } else if (q.type === 'ranking') {
      for (const opt of q.options) {
        if (opt.scores[0]) {
          const key = opt.scores[0].subDimension;
          if (!range[key]) range[key] = { min: 0, max: 0 };
          range[key].max += 5; // 排第1名
        }
      }
    }
  }

  return range;
}

function computeJungSpectrum(scores: Record<string, number>): JungSpectrum {
  const spectrum = (leftKey: string, rightKey: string): number => {
    const left = scores[leftKey] || 0;
    const right = scores[rightKey] || 0;
    if (left + right === 0) return 50;
    return Math.round((right / (left + right)) * 100);
  };

  return {
    EI: spectrum('jung.I', 'jung.E'), // 0=I, 100=E
    SN: spectrum('jung.S', 'jung.N'),
    TF: spectrum('jung.T', 'jung.F'),
    JP: spectrum('jung.J', 'jung.P'),
  };
}

function computeRIASEC(scores: Record<string, number>): RIASECResult {
  const keys = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
  const riasecScores: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', number> = {
    R: scores['riasec.R'] || 0,
    I: scores['riasec.I'] || 0,
    A: scores['riasec.A'] || 0,
    S: scores['riasec.S'] || 0,
    E: scores['riasec.E'] || 0,
    C: scores['riasec.C'] || 0,
  };

  // 兴趣代码
  const sorted = [...keys].sort((a, b) => riasecScores[b] - riasecScores[a]);
  const code = sorted.slice(0, 3).join('');

  // 区分度
  const vals = Object.values(riasecScores);
  const maxVal = Math.max(...vals);
  const minVal = Math.min(...vals);
  const diff = maxVal - minVal;
  const differentiation: 'high' | 'medium' | 'low' =
    diff >= 40 ? 'high' : diff >= 20 ? 'medium' : 'low';

  // 一致性（六角形上前两类的距离）
  const hexOrder = ['R', 'I', 'A', 'S', 'E', 'C'];
  const idx1 = hexOrder.indexOf(sorted[0]);
  const idx2 = hexOrder.indexOf(sorted[1]);
  const dist = Math.min(Math.abs(idx1 - idx2), 6 - Math.abs(idx1 - idx2));
  const consistency: 'high' | 'medium' | 'low' =
    dist <= 1 ? 'high' : dist === 2 ? 'medium' : 'low';

  // 明确度（标准差）
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length;
  const stdDev = Math.sqrt(variance);
  const clarity: 'high' | 'medium' | 'low' =
    stdDev >= 25 ? 'high' : stdDev >= 12 ? 'medium' : 'low';

  return { scores: riasecScores, code, consistency, differentiation, clarity };
}

function computeReadiness(scores: Record<string, number>): ReadinessResult {
  const keys = ['ready.selfAwareness', 'ready.careerInfo', 'ready.decisionAbility', 'ready.realityOriented', 'ready.adaptability'];
  const subScores: Record<string, number> = {};
  let total = 0;
  let count = 0;
  for (const key of keys) {
    if (scores[key] !== undefined) {
      subScores[key] = scores[key];
      total += scores[key];
      count++;
    }
  }
  return {
    overall: count > 0 ? Math.round(total / count) : 0,
    subScores,
  };
}

function suggestFields(riasec: RIASECResult, scores: Record<string, number>): string[] {
  const fields: string[] = [];
  const code = riasec.code;

  // 基于RIASEC前两位的简单映射
  const mapping: Record<string, string[]> = {
    'RI': ['工程技术', '软件开发', '建筑设计'],
    'IR': ['科学研究', '数据分析', '机械工程'],
    'IA': ['科学写作', '建筑设计', '科技创业'],
    'AI': ['设计', '科幻创作', '产品设计'],
    'AS': ['教育创新', '艺术治疗', '文化传播'],
    'SA': ['心理咨询', '教育', '社会工作'],
    'SE': ['人力资源', '培训教练', '医疗管理'],
    'ES': ['管理', '市场营销', '公关'],
    'EI': ['技术创业', '投资分析', '产品经理'],
    'IE': ['研究管理', '咨询', '技术领导'],
    'EC': ['企业管理', '金融', '行政管理'],
    'CE': ['财务管理', '运营管理', '供应链'],
    'RC': ['制造业', '质量管理', '技术维护'],
    'CR': ['数据管理', '档案管理', '实验室技术'],
    'IS': ['医学研究', '心理学', '教育研究'],
    'SI': ['医疗健康', '学校咨询', '社区发展'],
    'RA': ['手工艺', '工业设计', '园林设计'],
    'AR': ['摄影', '雕塑', '产品制作'],
    'SC': ['医疗行政', '教育管理', '社区服务'],
    'CS': ['医疗记录', '学校行政', '图书管理'],
    'AE': ['创业', '品牌策划', '影视制作'],
    'EA': ['娱乐管理', '广告', '公关传播'],
    'IC': ['信息科学', '药学', '精算'],
    'CI': ['数据科学', '审计', '系统分析'],
    'RE': ['项目管理', '施工管理', '物流'],
    'ER': ['体育管理', '户外领导', '销售管理'],
    'AC': ['平面设计', '编辑出版', '博物馆管理'],
    'CA': ['排版设计', '音乐制作', '展览策划'],
  };

  const prefix = code.substring(0, 2);
  if (mapping[prefix]) {
    fields.push(...mapping[prefix]);
  }

  // 补充基于多元智能的建议
  const intelScores = Object.entries(scores)
    .filter(([k]) => k.startsWith('intel.'))
    .sort((a, b) => b[1] - a[1]);

  if (intelScores[0]) {
    const topIntel = intelScores[0][0];
    const intelFieldMap: Record<string, string[]> = {
      'intel.linguistic': ['写作', '新闻传播', '法律'],
      'intel.logicMath': ['数学', '编程', '科学研究'],
      'intel.spatial': ['设计', '建筑', '影视'],
      'intel.bodily': ['体育', '舞蹈', '外科医学'],
      'intel.musical': ['音乐表演', '音乐制作', '声音设计'],
      'intel.interpersonal': ['心理咨询', '教育', '管理'],
      'intel.intrapersonal': ['哲学', '写作', '独立研究'],
      'intel.naturalist': ['生物学', '环境科学', '农业'],
    };
    if (intelFieldMap[topIntel]) {
      for (const f of intelFieldMap[topIntel]) {
        if (!fields.includes(f)) fields.push(f);
      }
    }
  }

  return fields.slice(0, 10);
}
