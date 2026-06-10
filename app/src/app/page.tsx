'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { levelMeta, isLevelReady, getQuestionBank } from '@/lib/questions';
import type { Level } from '@/lib/questions/types';

const levelOrder: Level[] = ['L1', 'L2', 'L3', 'L4'];

const features = [
  {
    icon: '🔬',
    title: '六大理论支撑',
    desc: '融合霍兰德、荣格、加德纳、舒伯、施恩、Csikszentmihalyi 六大经典理论体系',
  },
  {
    icon: '🎯',
    title: '六维度深度测评',
    desc: '心理能量 · 多元智能 · 兴趣类型 · 核心驱动力 · 认知风格 · 生涯准备度',
  },
  {
    icon: '🤖',
    title: 'AI 个性化解读',
    desc: '可选 AI 深度分析，基于匿名汇总分数生成，不发送任何个人信息',
  },
  {
    icon: '🔒',
    title: '隐私优先',
    desc: '无需注册、不收集身份信息、答案仅用于当次计算，完成即销毁',
  },
];

export default function Home() {
  const router = useRouter();

  const handleSelect = (level: Level) => {
    if (!isLevelReady(level)) return;
    router.push(`/test?level=${level}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-5 pt-14 sm:pt-20 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-6 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            免费 · 匿名 · 无需注册
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            🌾 向野
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-3 leading-relaxed font-medium">
            成长方向探索
          </p>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            发现你的兴趣种子和能力倾向——了解自己，才能找到属于自己的路。
          </p>
        </motion.div>
      </div>

      {/* 特色亮点 */}
      <div className="max-w-2xl mx-auto px-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="bg-white/70 backdrop-blur rounded-xl p-4 border border-gray-100/80"
            >
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 年龄选择 */}
      <div className="max-w-2xl mx-auto px-5 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-1">选择教育阶段</h2>
          <p className="text-xs text-gray-400">不同阶段，不同题目风格，更贴合你的实际体验</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levelOrder.map((level, i) => {
            const meta = levelMeta[level];
            const ready = isLevelReady(level);
            const bank = getQuestionBank(level);
            const questionCount = bank.questions.length;
            const minutes = bank.estimatedMinutes;

            return (
              <motion.button
                key={level}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => handleSelect(level)}
                disabled={!ready}
                className={`
                  relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                  ${ready
                    ? 'bg-white border border-gray-200/80 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40 cursor-pointer group hover:-translate-y-0.5'
                    : 'bg-gray-50 border border-dashed border-gray-200 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {/* 装饰渐变 */}
                {ready && (
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${meta.color} opacity-[0.07] rounded-bl-full transition-opacity group-hover:opacity-[0.12]`} />
                )}

                <div className="relative">
                  <span className="text-3xl mb-3 block">{meta.emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {meta.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{meta.desc}</p>

                  {ready ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-500 font-medium group-hover:text-blue-600 transition-colors">
                        开始测评 →
                      </span>
                      <span className="text-xs text-gray-400">
                        {questionCount} 题 · 约 {minutes} 分钟
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">即将开放</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-2xl mx-auto px-5 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 text-sm text-amber-800 space-y-2.5"
        >
          <p className="font-medium flex items-center gap-1.5">
            <span className="text-base">📋</span> 使用前请了解：
          </p>
          <ul className="space-y-1.5 text-xs text-amber-700/80 leading-relaxed pl-1">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1.5 shrink-0">•</span>
              <span>这是兴趣探索工具，不是专业诊断或升学决策依据</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1.5 shrink-0">•</span>
              <span>不要求填写姓名、学校等身份信息</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1.5 shrink-0">•</span>
              <span>答案只用于当次评分，不建立个人档案或样本库</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1.5 shrink-0">•</span>
              <span>小学生和初中生请在家长知情下使用</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* 理论基础 */}
      <div className="max-w-2xl mx-auto px-5 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-3"
        >
          <p className="text-xs text-gray-300 font-medium tracking-wider uppercase">理论基础</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
            <span>Holland RIASEC</span>
            <span className="text-gray-200">·</span>
            <span>Jung 心理类型</span>
            <span className="text-gray-200">·</span>
            <span>Gardner 多元智能</span>
            <span className="text-gray-200">·</span>
            <span>Super 生涯发展</span>
            <span className="text-gray-200">·</span>
            <span>Schein 职业锚</span>
            <span className="text-gray-200">·</span>
            <span>Flow 心流理论</span>
          </div>
        </motion.div>
      </div>

      <footer className="text-center text-xs text-gray-300 pb-8">
        向野 · 成长方向探索工具 · 结果反映当前回答倾向，建议通过真实活动验证
      </footer>
    </main>
  );
}
