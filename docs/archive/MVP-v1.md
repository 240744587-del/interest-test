# 「探路者」— 兴趣探索与职业启蒙测评系统 MVP 文档

> 版本：MVP v1.0
> 最后更新：2026-06-09

---

## 一、产品定义

### 1.1 一句话描述
一个面向 7-成人全年龄段的兴趣探索与职业方向测评工具，通过科学量表测评 + AI 个性化报告，帮助用户（尤其是中小学生）发现自己的天赋方向，而不是被家长的功利目标绑架。

### 1.2 核心用户画像

| 用户 | 痛点 | 期望 |
|------|------|------|
| 中小学生（7-15岁） | 不知道自己喜欢什么、擅长什么；被家长安排课外班 | 发现"原来我是这样的人"，找到愿意主动投入的方向 |
| 高中生（16-18岁） | 面对选科/报志愿焦虑，不知道未来方向 | 得到科学的专业方向建议和选科参考 |
| 大学生/成人（18+） | 迷茫/倦怠，怀疑当前方向是否适合自己 | 重新认识自己，找到更匹配的方向或确认当前方向 |
| 家长（间接用户） | 不了解孩子的天然优势，按自己的期望强加方向 | 看到专业的报告，理解孩子的天赋和适合的方向 |

### 1.3 MVP 边界

**MVP 做的**：
- 4个年龄层级的完整答题流程
- 自动评分和维度计算
- AI 生成个性化报告（调用 Claude API）
- 报告导出为 PDF
- 移动端适配（手机答题体验优先）

**MVP 不做**：
- 用户账号系统（匿名测评，不登录）
- 付费/会员体系
- 社交分享/排行榜
- 多语言
- 历史记录（每次独立测评）
- 后台管理系统

---

## 二、技术架构

### 2.1 技术选型

```
┌──────────────────────────────────────────────┐
│                   前端 (Next.js 15)           │
│  ┌────────────┐  ┌──────────┐  ┌───────────┐ │
│  │ 首页/选年龄 │  │ 答题引擎  │  │ 报告展示  │ │
│  └────────────┘  └──────────┘  └───────────┘ │
│         React 19 + TypeScript + Tailwind CSS  │
│         Framer Motion (动画) + Recharts (图表) │
└────────────────────┬─────────────────────────┘
                     │ API Routes
┌────────────────────┴─────────────────────────┐
│                后端 (Next.js API Routes)       │
│  ┌────────────┐  ┌──────────┐  ┌───────────┐ │
│  │ 评分引擎    │  │ Claude AI │  │ PDF生成   │ │
│  │ (纯算法)   │  │ 报告生成  │  │           │ │
│  └────────────┘  └──────────┘  └───────────┘ │
└──────────────────────────────────────────────┘
```

| 层 | 技术 | 理由 |
|----|------|------|
| 框架 | Next.js 15 (App Router) | 全栈、SSR/SSG、API Routes、部署方便 |
| 语言 | TypeScript | 类型安全，题库结构复杂需要类型约束 |
| 样式 | Tailwind CSS 4 | 快速开发，响应式简单 |
| UI组件 | shadcn/ui | 高质量、可定制、无运行时 |
| 动画 | Framer Motion | 答题切换动画、进度条、结果揭晓动效 |
| 图表 | Recharts | 雷达图（多元智能/RIASEC/维度总览） |
| AI | Claude API (Sonnet) | 生成个性化报告 |
| PDF | @react-pdf/renderer | 前端直接生成PDF报告 |
| 部署 | Vercel | Next.js 原生支持、免费额度够MVP |
| 数据存储 | 无（MVP阶段纯前端状态） | 不需要数据库，答题数据在内存中处理 |

### 2.2 为什么不用数据库

MVP 阶段的数据流是单向的：
```
用户答题 → 前端收集答案 → 发送到API Route → 评分算法计算 → 调Claude生成报告 → 返回前端展示
```
全程没有"存储"需求。答案和报告只在当次会话中存在。
未来如果要加账号/历史记录，再引入 Supabase 或 Planetscale。

---

## 三、项目结构

```
interest-test/
├── public/
│   ├── images/
│   │   ├── hero-illustration.svg      # 首页插画
│   │   └── report-bg.svg              # 报告背景
│   └── fonts/                          # 中文字体子集
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # 全局布局
│   │   ├── page.tsx                    # 首页：产品介绍 + 选择年龄
│   │   ├── test/
│   │   │   ├── page.tsx                # 答题页面（核心）
│   │   │   └── loading.tsx             # 加载状态
│   │   ├── result/
│   │   │   ├── page.tsx                # 报告展示页面
│   │   │   └── loading.tsx
│   │   └── api/
│   │       ├── score/
│   │       │   └── route.ts            # 评分API
│   │       └── report/
│   │           └── route.ts            # AI报告生成API
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui 组件
│   │   ├── landing/
│   │   │   ├── Hero.tsx                # 首页主视觉
│   │   │   ├── AgeSelector.tsx         # 年龄层级选择卡片
│   │   │   └── TheoryBanner.tsx        # 理论背书展示
│   │   ├── test/
│   │   │   ├── QuestionEngine.tsx      # 答题引擎（核心组件）
│   │   │   ├── ProgressBar.tsx         # 进度条
│   │   │   ├── BinaryChoice.tsx        # 二选一题型
│   │   │   ├── ScenarioChoice.tsx      # 场景选择题型（4选1）
│   │   │   ├── LikertScale.tsx         # 量表题型（1-5分）
│   │   │   ├── RankingQuestion.tsx     # 排序题型
│   │   │   ├── ForcedChoice.tsx        # 迫选题型（最喜欢+最不喜欢）
│   │   │   ├── OpenQuestion.tsx        # 开放题型（文本输入）
│   │   │   └── TransitionAnimation.tsx # 题目切换动画
│   │   └── report/
│   │       ├── ReportLayout.tsx        # 报告整体布局
│   │       ├── ProfileCard.tsx         # 画像卡片
│   │       ├── RadarChart.tsx          # 雷达图（复用：多元智能/RIASEC/总览）
│   │       ├── SpectrumBar.tsx         # 光谱条（荣格4维度）
│   │       ├── DimensionDetail.tsx     # 单维度详细解读
│   │       ├── CareerMap.tsx           # 职业方向推荐
│   │       ├── ActionPlan.tsx          # 行动建议
│   │       ├── ParentLetter.tsx        # 给家长的信（仅未成年）
│   │       └── PdfExport.tsx           # PDF导出按钮+生成逻辑
│   │
│   ├── lib/
│   │   ├── questions/
│   │   │   ├── types.ts                # 题目类型定义
│   │   │   ├── L1-children.ts          # L1题库（7-12岁）
│   │   │   ├── L2-teen.ts              # L2题库（13-15岁）
│   │   │   ├── L3-youth.ts             # L3题库（16-18岁）
│   │   │   └── L4-adult.ts             # L4题库（18+）
│   │   ├── scoring/
│   │   │   ├── engine.ts               # 评分引擎主逻辑
│   │   │   ├── dimensions.ts           # 维度定义和计算
│   │   │   ├── riasec.ts               # RIASEC专项计算（一致性/区分度）
│   │   │   ├── jung.ts                 # 荣格光谱计算
│   │   │   └── readiness.ts            # 职业准备度计算
│   │   ├── report/
│   │   │   ├── prompt-builder.ts       # 构建Claude prompt
│   │   │   ├── career-mapping.ts       # 维度组合→职业方向映射
│   │   │   └── age-adapter.ts          # 按年龄调整报告语气和内容
│   │   └── constants.ts                # 常量（维度名称、颜色等）
│   │
│   ├── hooks/
│   │   ├── useTestProgress.ts          # 答题进度管理
│   │   ├── useAnswerStore.ts           # 答案状态管理
│   │   └── useReportGeneration.ts      # 报告生成状态
│   │
│   └── styles/
│       └── globals.css                 # Tailwind + 自定义样式
│
├── assessment-framework.md             # 理论框架文档
├── question-bank.md                    # 完整题库
├── question-bank-supplement.md         # v2.0补充题库
├── MVP.md                              # 本文件
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local                          # ANTHROPIC_API_KEY
```

---

## 四、核心数据模型

### 4.1 题目类型定义

```typescript
// src/lib/questions/types.ts

type AgeLevel = 'L1' | 'L2' | 'L3' | 'L4';

type QuestionType =
  | 'binary'        // 二选一
  | 'scenario'      // 场景选择（4选1）
  | 'likert'        // 量表（1-5分）
  | 'ranking'       // 排序
  | 'forced-choice' // 迫选（选最喜欢+最不喜欢）
  | 'open';         // 开放题

type DimensionKey =
  | 'energy'          // 维度1：心理能量
  | 'intelligence'    // 维度2：多元智能
  | 'riasec'          // 维度3：兴趣类型
  | 'drive'           // 维度4：核心驱动力
  | 'cognitive'       // 维度5：认知决策风格
  | 'readiness';      // 维度6：职业准备度

type SubDimensionKey = string; // 如 'energy.extraversion', 'intelligence.linguistic' 等

interface Option {
  id: string;
  text: string;
  scores: {
    dimension: DimensionKey;
    subDimension: SubDimensionKey;
    value: number;
  }[];
}

interface Question {
  id: string;
  type: QuestionType;
  level: AgeLevel;
  dimension: DimensionKey;
  text: string;
  description?: string;           // 题目补充说明
  options: Option[];              // binary/scenario/forced-choice
  likertStatement?: string;       // likert 题的陈述
  rankingItems?: Option[];        // ranking 题的排序项
  openPlaceholder?: string;       // open 题的占位提示
  metadata?: {
    theorySource: string;         // 理论出处（如 'Jung S-N'）
    validationPair?: string;      // 配对验证题ID
  };
}

interface QuestionBank {
  level: AgeLevel;
  questions: Question[];
  estimatedMinutes: number;
}
```

### 4.2 答案与评分

```typescript
// 用户答案
interface Answer {
  questionId: string;
  type: QuestionType;
  value: string | number | string[]; // 选项ID / 量表分 / 排序数组
  openText?: string;                  // 开放题文本
}

interface AnswerSheet {
  level: AgeLevel;
  age: number;
  startedAt: string;
  completedAt: string;
  answers: Answer[];
}

// 评分结果
interface DimensionScore {
  dimension: DimensionKey;
  subScores: {
    key: SubDimensionKey;
    label: string;
    rawScore: number;
    percentile: number; // 0-100
  }[];
  summary: string; // 维度一句话总结
}

interface RIASECAdvanced {
  scores: { R: number; I: number; A: number; S: number; E: number; C: number };
  code: string;            // 如 "IAS"
  consistency: 'high' | 'medium' | 'low';
  differentiation: 'high' | 'medium' | 'low';
  clarity: 'high' | 'medium' | 'low';
}

interface JungSpectrum {
  EI: number;  // 0=极端内倾, 50=平衡, 100=极端外倾
  SN: number;  // 0=极端感觉, 50=平衡, 100=极端直觉
  TF: number;  // 0=极端思维, 50=平衡, 100=极端情感
  JP: number;  // 0=极端判断, 50=平衡, 100=极端知觉
}

interface ScoreResult {
  level: AgeLevel;
  dimensions: DimensionScore[];
  riasec: RIASECAdvanced;
  jung: JungSpectrum;
  readiness?: {
    overall: number;
    subScores: Record<string, number>;
    stage: 'undifferentiated' | 'exploring' | 'tentative' | 'established';
  };
  openAnswers: { questionId: string; text: string }[];
  consistencyCheck: {
    passed: boolean;
    flags: string[];
  };
}
```

### 4.3 报告

```typescript
interface Report {
  level: AgeLevel;
  oneLiner: string;               // 一句话画像
  dimensions: {
    key: DimensionKey;
    title: string;
    score: DimensionScore;
    narrative: string;            // AI 生成的文字解读（200-500字）
  }[];
  talentMap: {
    topAbilities: string[];       // Top 3 天然能力
    energySources: string[];      // 充电站
    energyDrains: string[];       // 耗电站
    coreDrives: string[];         // 核心驱动力
  };
  careerExploration: {
    recommendedFields: string[];  // 推荐探索领域
    specificCareers: string[];    // 具体职业（10-20个）
    subjectAdvice?: string;       // L3: 选科建议
    actionItems: string[];        // "你现在就可以做的3件事"
  };
  parentLetter?: string;          // 给家长的信（L1-L3，AI生成）
  fullNarrative: string;          // AI 生成的完整个性化报告（3000-5000字）
}
```

---

## 五、核心流程

### 5.1 用户流程

```
首页 → 选择年龄层级 → 开始答题 → 答题完成 → 等待报告生成 → 查看报告 → 导出PDF
  │                      │                         │
  │                      │                         │
  │    ┌─────────────────┘                         │
  │    │ 答题过程：                                  │
  │    │ 1. 进度条显示当前位置                        │
  │    │ 2. 每答一题自动跳转下一题（带动画）            │
  │    │ 3. 可以回退修改                              │
  │    │ 4. 中途可退出（数据丢失提醒）                 │
  │    └─────────────────┐                         │
  │                      │                         │
  │                ┌─────┘                         │
  │                │ 报告生成过程：                    │
  │                │ 1. 前端发送答案到 /api/score       │
  │                │ 2. 后端评分算法计算各维度           │
  │                │ 3. 评分结果 + 开放题答案 → prompt  │
  │                │ 4. 调Claude API生成报告           │
  │                │ 5. Streaming返回前端              │
  │                └─────────────────────────────────┘
```

### 5.2 答题引擎逻辑

```
QuestionEngine 状态机：
┌──────────┐  答题  ┌──────────┐  答题  ┌──────────┐
│ Question │ ────→ │ Question │ ────→ │ Question │ ···
│    #1    │ ←──── │    #2    │ ←──── │    #3    │
└──────────┘  回退  └──────────┘  回退  └──────────┘
                                           │ 最后一题答完
                                           ▼
                                    ┌──────────┐
                                    │ 提交确认  │
                                    └────┬─────┘
                                         │ 确认提交
                                         ▼
                                    ┌──────────┐
                                    │ 生成报告  │
                                    │（loading）│
                                    └──────────┘
```

### 5.3 评分 → 报告 API 流程

```
POST /api/score
  Body: { level, answers[] }
  返回: ScoreResult

POST /api/report (streaming)
  Body: { level, scoreResult, openAnswers[] }
  返回: ReadableStream → 逐步渲染报告
```

---

## 六、AI 报告生成策略

### 6.1 Prompt 结构

```
System:
  你是一位结合了荣格心理学、霍兰德职业兴趣理论、舒伯生涯发展理论和
  施恩职业锚理论的资深生涯咨询师。你正在为一位{age}岁的{level_desc}
  生成个性化的兴趣探索与天赋发现报告。

  规则：
  - 根据舒伯理论，该用户处于{super_stage}阶段
  - 报告语气：{tone_by_level}
  - {level_specific_rules}

User:
  ## 评分数据
  {score_result_json}

  ## 用户的开放题回答
  {open_answers}

  ## 请生成以下内容
  1. 一句话画像
  2. 6大维度逐一解读（每个200-400字）
  3. 天赋地图（Top 3能力、能量分析、核心驱动力）
  4. 探索建议（推荐领域、具体职业、可执行的行动）
  5. {if 未成年: 给家长的一封信}
  6. 完整的个性化报告叙事（3000-5000字，自由发挥，深度洞察）
```

### 6.2 年龄适配的语气

| 层级 | System Prompt 中的语气指令 |
|------|-------------------------|
| L1 | "用温暖、鼓励的语气，像一个有趣的大哥哥/大姐姐在和小朋友聊天。用简单的比喻，避免专业术语。多用'你很棒'、'你知道吗'。不说'你适合当XX'，而说'你在XX方面有特别的天赋种子'。" |
| L2 | "用平等、真诚的语气，像一个理解你的学长/学姐。可以用一些轻松的网络用语。开始涉及专业概念但要用通俗语言解释。强调'探索'而不是'确定'。" |
| L3 | "用专业但不冰冷的语气，像一个靠谱的生涯导师。可以引用理论名词但要简要解释。对选科/报志愿给出有理有据的建议。承认不确定性，鼓励验证。" |
| L4 | "用直接、深刻的语气，像一个有阅历的职业教练。可以犀利，但要有共情。对'是否需要转型'给出诚实的分析。引用职业锚等理论时给出通俗解释。" |

### 6.3 成本估算

| 模型 | 输入token | 输出token | 单次成本 |
|------|----------|----------|---------|
| Claude Sonnet 4 | ~3000 (prompt+数据) | ~6000 (完整报告) | ~$0.04 |

MVP 阶段 1000 次测评 ≈ $40，可承受。

---

## 七、页面设计规范

### 7.1 设计语言

- **主色调**：柔和的渐变（不要太商务、不要太幼稚）
  - L1: 暖色系渐变（橙→黄）——活泼
  - L2: 蓝绿渐变——成长感
  - L3: 蓝紫渐变——探索感
  - L4: 深蓝→靛色渐变——专业感
- **字体**：系统字体栈（`-apple-system, "PingFang SC", "Microsoft YaHei"...`）
- **圆角**：统一 12px
- **动画**：答题切换用 slide + fade，报告出现用 fade-in + stagger

### 7.2 页面列表

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | `/` | 产品介绍 + 年龄层级选择（4张卡片） |
| 答题页 | `/test?level=L1` | 答题引擎、进度条、题型渲染 |
| 报告页 | `/result` | 报告展示、图表、PDF导出 |

### 7.3 移动端适配

- 答题体验以手机为第一优先级（大部分用户会转发到微信打开）
- 单题一屏，大按钮，滑动切换
- 报告页横向滚动雷达图，纵向滚动文字
- PDF 导出按钮固定在底部

---

## 八、MVP 开发计划

### Phase 0：项目初始化（0.5天）
- [x] 测评框架设计
- [x] 完整题库设计
- [ ] Next.js 项目初始化
- [ ] Tailwind + shadcn/ui 配置
- [ ] TypeScript 类型定义
- [ ] 项目结构搭建

### Phase 1：题库数据化（1天）
- [ ] 将 markdown 题库转为 TypeScript 数据结构
- [ ] 4个层级的题库文件（L1-L4）
- [ ] 题目类型验证（zod schema）
- [ ] 题库完整性检查脚本

### Phase 2：答题引擎（2天）
- [ ] QuestionEngine 核心组件
- [ ] 6种题型组件（binary/scenario/likert/ranking/forced-choice/open）
- [ ] 进度条 + 题目切换动画
- [ ] 答案状态管理（useAnswerStore）
- [ ] 回退/跳转逻辑
- [ ] 移动端适配

### Phase 3：评分引擎（1.5天）
- [ ] 各维度评分算法
- [ ] RIASEC 六角模型计算（含一致性/区分度）
- [ ] 荣格光谱计算
- [ ] 职业准备度计算
- [ ] 一致性检测（反向题配对验证）
- [ ] API Route: POST /api/score

### Phase 4：AI 报告生成（1.5天）
- [ ] Prompt 构建器（按年龄层级适配）
- [ ] 职业方向映射表
- [ ] Claude API 调用 + Streaming
- [ ] API Route: POST /api/report
- [ ] 报告数据结构解析

### Phase 5：报告展示页（2天）
- [ ] 报告整体布局
- [ ] 画像卡片组件
- [ ] 雷达图（多元智能 + RIASEC）
- [ ] 荣格光谱条
- [ ] 维度详细解读（Streaming逐步渲染）
- [ ] 职业推荐卡片
- [ ] 行动建议列表
- [ ] 给家长的信（条件渲染）

### Phase 6：首页 + PDF导出 + 收尾（1.5天）
- [ ] 首页设计实现
- [ ] 年龄选择卡片
- [ ] PDF 导出功能
- [ ] 全局加载/错误状态
- [ ] 移动端最终适配
- [ ] 性能优化（题库动态加载）

### Phase 7：部署 + 测试（1天）
- [ ] Vercel 部署配置
- [ ] 环境变量设置（API Key）
- [ ] 4个层级各跑一轮完整测试
- [ ] 修Bug
- [ ] 上线

**总计：约 11 天**

---

## 九、关键技术决策记录

### Q1: 为什么不做小程序？
A: MVP 用 Next.js 做响应式网页，微信内直接打开。理由：
- 开发速度快（一套代码多端适配）
- 不需要审核（小程序审核慢且对"测评类"管控严）
- Claude API 调用在服务端，不受微信限制
- 后续如果需要小程序，可以用 Taro 包一层

### Q2: 为什么不用现成的测评 SaaS？
A: 金数据/问卷星等工具无法实现：
- 6种不同题型的自定义渲染
- 复杂的多维度交叉评分逻辑
- AI 生成个性化报告
- 4个年龄层级的不同体验
自建才能完全掌控体验和算法。

### Q3: 为什么用 Claude 而不是 GPT？
A: MVP 阶段两者都可以。选 Claude Sonnet 的理由：
- 中文长文本输出质量好
- Streaming 响应快
- 单次成本低（~$0.04）
- 未来可以利用 Claude 的 extended thinking 做更深度的分析

### Q4: 数据隐私怎么办？
A: MVP 阶段不存储任何数据——答题数据只在当次会话中存在，发送给 Claude 生成报告后即丢弃。后续如果要加账号系统，需要：
- 添加隐私政策
- 答案和报告加密存储
- 未成年人需要家长同意（COPPA合规）

### Q5: 如何保证测评的科学性？
A: MVP 阶段是"基于科学理论的探索工具"，不是临床诊断工具。在产品中明确标注：
- 本测评参考了XX等理论，供自我探索使用
- 不构成专业的心理咨询或职业规划建议
- 建议结合专业人士的指导使用
后续可以找心理测量学专家做信效度检验，建立中国常模。

---

## 十、后续迭代方向（MVP之后）

| 优先级 | 功能 | 价值 |
|--------|------|------|
| P0 | 用户账号 + 测评历史 | 可以追踪成长变化 |
| P0 | 微信分享卡片 | 传播裂变 |
| P1 | AI 深度对话（参考天赋挖掘机prompt） | 测评后 1v1 深挖 |
| P1 | 常模数据积累 + 评分校准 | 提升科学性 |
| P1 | 家长端：查看孩子报告 + 教育建议 | 核心场景 |
| P2 | 学校/机构端：批量测评 + 班级报告 | B端变现 |
| P2 | 职业信息库：与报告推荐方向联动 | 增强报告实用性 |
| P2 | 英文版 / 多语言 | 扩大用户群 |
| P3 | 信效度研究 + 论文发表 | 学术背书 |
| P3 | 付费：深度报告 / AI对话 / 专家咨询 | 商业化 |
