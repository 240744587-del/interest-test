// ============================================================
// 本地模板降级报告 — AI 失败时使用
// 对齐 product-spec-v2.md §7.4
// ============================================================

import type { ScoreResult, Level } from '@/lib/questions/types';
import type { AIReport } from './types';
import { levelDisplayNames } from './types';

const riasecNames: Record<string, string> = {
  R: '实际型',
  I: '探究型',
  A: '艺术型',
  S: '社会型',
  E: '企业型',
  C: '常规型',
};

const riasecDescriptions: Record<string, string> = {
  R: '喜欢动手，爱拆爱装，问题摆在眼前就想亲手解决掉',
  I: '好奇心重，碰到不明白的事，不搞清楚原因就难受',
  A: '脑子里点子多，喜欢创作和表达，在意东西有没有自己的风格',
  S: '愿意把时间花在人身上，能帮到别人会真的开心',
  E: '喜欢张罗事情，习惯往前站一步，带着大家把事做成',
  C: '做事踏实细致，喜欢把东西理得清清楚楚，看不得乱',
};

const riasecExplorations: Record<string, { minor: string; adult: string }> = {
  R: { minor: '科学实验、手工制作、编程机器人、户外探索活动', adult: '工程技术、制造研发、技术运维、环境科学等领域' },
  I: { minor: '科学竞赛、数学探究、编程学习、自然观察', adult: '科学研究、数据分析、医学、技术研发等领域' },
  A: { minor: '绘画音乐、创意写作、摄影视频、设计课程', adult: '设计创意、影视传媒、文化艺术、品牌策划等领域' },
  S: { minor: '志愿服务、同伴辅导、社团组织、团队合作项目', adult: '教育培训、咨询服务、医疗护理、人力资源等领域' },
  E: { minor: '学生会、辩论社、模拟商赛、项目策划活动', adult: '企业管理、市场营销、创业投资、商务拓展等领域' },
  C: { minor: '数据整理、计划制定、笔记方法研究、信息归类', adult: '财务审计、行政管理、项目管理、质量管控等领域' },
};

function describeJung(value: number, leftLabel: string, leftDesc: string, rightLabel: string, rightDesc: string): string {
  if (value >= 40 && value <= 60) return `在${leftLabel}和${rightLabel}之间比较平衡，既能${leftDesc}，也能${rightDesc}，看情况切换`;
  if (value < 30) return `明显偏${leftLabel}，你${leftDesc}，待在这个状态里最舒服`;
  if (value < 40) return `稍微偏${leftLabel}一些，平时更${leftDesc}，需要时也能${rightDesc}`;
  if (value > 70) return `明显偏${rightLabel}，你${rightDesc}，待在这个状态里最舒服`;
  return `稍微偏${rightLabel}一些，平时更${rightDesc}，需要时也能${leftDesc}`;
}

/** 生成本地模板报告 */
export function generateTemplateReport(level: Level, summary: ScoreResult): AIReport {
  const label = levelDisplayNames[level];
  const isMinor = level !== 'L4';
  const code = summary.riasec.code;
  const topTypes = code.split('').slice(0, 3);
  const lowEvidence = summary.consistencyFlags.includes('low-evidence');

  // ---- 低证据保护：不生成虚假精准结论 ----
  if (lowEvidence) {
    return {
      overview: `这次${label}测评里，你有不少题选了"不知道 / 没经历过"。先说一句：这是诚实的回答，比硬选一个强多了。\n\n它说明你现在处在「开放探索期」，很多方向你还没真正接触过，自然没法判断喜不喜欢。这不代表你没兴趣、没能力，只是还缺亲身经历。\n\n这个阶段，比起想出一个答案，更要紧的是多攒几次不一样的体验。`,
      interestInterpretation: `这次作答里的有效信号比较少，所以我们不给出精确的兴趣类型结论。证据不够还硬下结论，反而会带偏你。\n\n已经答的部分里，那些相对突出的方向可以当成"值得先试试"的线索，但别当成"我就是这个类型"的定论。`,
      abilityInterpretation: `能力是在真实的活动里才看得出来的。现在的数据还画不出你的能力图谱，这很正常，很多能力都是试过之后才被自己发现的。`,
      cognitiveInterpretation: `认知风格的判断也需要更多作答数据。等有了更多生活和学习体验之后再来测一次，结果会更有参考价值。`,
      driveInterpretation: `驱动力是在真正投入做事的过程中慢慢清晰的。留意接下来几周，什么事是你愿意主动花时间的，那就是最真实的信号。`,
      explorationSuggestions: `现在更适合你的不是"选方向"，是"攒体验"：\n\n1. 科学实验、艺术创作、组织活动、帮助别人、动手制作，每类挑一样，各试一次\n2. 不用做得多好，只要记下来：做的时候你是投入，还是煎熬？\n3. 体验不用很正式，看一场展、帮家里修个东西、张罗一次小聚会，都算`,
      actionSteps: `建议的节奏：\n\n1. 接下来 2-4 周，完成 2-3 次不同类型的新体验\n2. 每次体验完，用一句话记下感受\n3. 攒够这些经历后再测一次，那时的结果就有真实依据了`,
      guardianNote: isMinor
        ? `给家长和老师：\n\n孩子这次选了不少"不知道 / 没经历过"。请别把这理解成"没想法"或"不配合"，这恰恰说明孩子答得诚实。\n\n它反映的是孩子目前接触过的东西还不够多。这个阶段最有用的帮助，是多带孩子接触不同类型的活动和场合，然后观察孩子在哪些事情上会自然投入，而不是追问"你到底喜欢什么"。\n\n本报告不构成心理诊断或专业评估意见。`
        : undefined,
    };
  }

  // ---- 总述 ----
  const intelligenceDim = summary.dimensions.find((d) => d.key === 'intelligence');
  const topIntel = intelligenceDim
    ? [...intelligenceDim.subScores].sort((a, b) => b.score - a.score).slice(0, 2)
    : [];
  const driveDim = summary.dimensions.find((d) => d.key === 'drive');
  const topDrives = driveDim
    ? [...driveDim.subScores].sort((a, b) => b.score - a.score).slice(0, 2)
    : [];

  const overview = `从这次的回答来看，你的兴趣主要落在「${topTypes.map((t) => riasecNames[t]).join(' + ')}」这一边：你${topTypes.slice(0, 2).map((t) => riasecDescriptions[t]?.split('，')[0]).join('，也')}。${topIntel.length > 0 ? `能力上，${topIntel.map((s) => s.label).join('和')}是你比较突出的部分。` : ''}${topDrives.length > 0 ? `真正推着你往前走的，更多是${topDrives.map((s) => s.label).join('和')}。` : ''}\n\n当然，这只是你现在的样子。人是会变的，过段时间再测，结果可能就不一样了。这不是测评不准，是你在长大、在积累新的体验。`;

  // ---- RIASEC 兴趣解读 ----
  const interestInterpretation = topTypes
    .map((t, i) => {
      const name = riasecNames[t];
      const desc = riasecDescriptions[t];
      const score = summary.riasec.scores[t as keyof typeof summary.riasec.scores];
      const rank = i === 0 ? '排在最前面的' : i === 1 ? '其次是' : '然后是';
      return `${rank}「${name}」（${score}分）：${desc}。`;
    })
    .join('\n\n') +
    `\n\n这三个放在一起，就是你的兴趣代码「${code}」。` +
    (summary.riasec.differentiation === 'high'
      ? '你的兴趣指向挺明确的，知道往哪个方向使劲，这是好事。'
      : summary.riasec.differentiation === 'low'
        ? '你对好几个领域都有兴趣，分不出明显高低。这不是坏事，说明可以试的东西很多，多试几样，自然会知道哪个最让你上头。'
        : '你有一个比较明显的主方向，但对别的领域也没关上门。');

  // ---- 多元智能 ----
  const allIntel = intelligenceDim
    ? [...intelligenceDim.subScores].sort((a, b) => b.score - a.score)
    : [];
  const abilityInterpretation = allIntel.length > 0
    ? `能力这块，你得分靠前的是：\n\n` +
      allIntel.slice(0, 3).map((s, i) => {
        const prefix = i === 0 ? '最高的是' : i === 1 ? '其次是' : '然后是';
        return `${prefix}「${s.label}」（${s.score}分）`;
      }).join('；') + '。' +
      `\n\n这几种能力其实每个人都有，只是配比不一样。你得分高的那几项，就是你做起来最不费劲、最容易进入状态的方向。不用纠结低分项，那只说明你还没怎么用到它，不代表不行。`
    : '这部分的作答还不够多，暂时画不出你的能力图谱。多试试不同类型的活动，能力是试出来的。';

  // ---- 荣格认知风格 ----
  const cognitiveInterpretation = [
    describeJung(summary.jung.EI, '内倾', '独处思考时获得能量', '外倾', '与人互动时获得能量'),
    describeJung(summary.jung.SN, '感觉', '关注具体事实和当下细节', '直觉', '关注未来可能性和整体图景'),
    describeJung(summary.jung.TF, '思维', '倾向用逻辑和分析来做决策', '情感', '倾向用价值观和感受来做决策'),
    describeJung(summary.jung.JP, '判断', '喜欢计划明确、有条理地推进', '知觉', '喜欢保持灵活、随机应变'),
  ].map((desc, i) => `${['能量来源', '信息获取', '决策方式', '生活态度'][i]}：${desc}`).join('。\n\n') +
    '。\n\n这四个维度都不是非黑即白，大多数人会在两头之间来回摆，看场合。所以别把它当成给自己贴的标签，当成认识自己的一个角度就好。';

  // ---- 驱动力 ----
  const allDrives = driveDim
    ? [...driveDim.subScores].sort((a, b) => b.score - a.score)
    : [];
  const driveInterpretation = allDrives.length > 0
    ? `从回答看，最能给你劲儿的是：\n\n${allDrives.slice(0, 3).map((s) => `「${s.label}」（${s.score}分）`).join('、')}。\n\n做能喂饱这些需求的事，你会越做越有劲；长期做和它们拧着的事，人容易蔫。以后做选择的时候，可以把这个放进考虑里：这件事，能不能满足我真正在乎的东西？`
    : '这部分的作答还不够多，暂时看不出你的驱动力分布。';

  // ---- 探索方向 ----
  const fieldsByType = topTypes
    .map((t) => {
      const exp = riasecExplorations[t];
      return exp ? (isMinor ? exp.minor : exp.adult) : '';
    })
    .filter(Boolean);

  const explorationSuggestions = summary.candidateFields.length > 0
    ? `把兴趣、能力和驱动力放一起看，这几个方向跟你比较搭：\n\n${summary.candidateFields.join('、')}。\n\n${isMinor ? '平时可以试试这些活动：' + fieldsByType.join('；') + '。' : '别把它们当成答案，当成可以先去试试的起点就好。'}\n\n说到底，合不合适只有试过才知道，纸上的分析代替不了亲身感受。`
    : `按你的兴趣代码「${code}」来看，可以先去试试：${fieldsByType.join('；')}。\n\n哪个最合适，试着试着就知道了。`;

  // ---- 行动建议 ----
  const actionSteps = isMinor
    ? `接下来可以这么做：\n\n1. 从上面挑一个你最好奇的方向，找个相关的课外活动试一次\n2. 留意那些让你一做就忘了时间的事，那是很重要的线索\n3. 把你的发现讲给信得过的家人或老师听，问问他们眼里的你是什么样\n4. 别急着定方向，这个阶段多试几样，比早早锁定一个更划算\n5. 过几个月再来测一次，看看有什么变化`
    : `接下来可以这么做：\n\n1. 挑一两个感兴趣的方向，去查查这行实际是干什么的、路径长什么样\n2. 找实习、项目或志愿活动的机会，下场试试\n3. 约个在这行干活的人聊聊，听听里面的人怎么说\n4. 行业活动、工作坊、线上社群，都是低成本入门的口子\n5. 隔段时间问问自己：最近做什么事最带劲？跟着这个感觉走，方向会越来越清楚`;

  // ---- 家长/教师建议 ----
  const guardianNote = isMinor
    ? `给家长和老师：\n\n这份报告是孩子此刻的一张快照，不是定论。几点建议：\n\n1. 跟孩子聊聊报告，最好的开场是"你觉得准吗？哪里准哪里不准？"\n2. 孩子想试什么就支持去试，不用催，也不用逼\n3. 多留意孩子玩得忘了时间的时刻，那比任何测评都真实\n4. 别拿这个结果做升学或分班的依据，它干不了这个活\n\n本报告不构成心理诊断或专业评估意见，有相关需要请咨询专业人士。`
    : undefined;

  return {
    overview,
    interestInterpretation,
    abilityInterpretation,
    cognitiveInterpretation,
    driveInterpretation,
    explorationSuggestions,
    actionSteps,
    guardianNote,
  };
}
