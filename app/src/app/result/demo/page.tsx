'use client';

import { useState } from 'react';
import type { ScoreResult } from '@/lib/questions/types';
import { generateTemplateReport } from '@/lib/report/template';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { levelMeta } from '@/lib/questions';

/** 模拟 ScoreResult — 一个偏向 IAS 的高中生画像 */
const mockResult: ScoreResult = {
  level: 'L3',
  dimensions: [
    {
      key: 'energy',
      label: '心理能量',
      subScores: [
        { key: 'energy.introversion', label: '内倾充电', score: 72 },
        { key: 'energy.extraversion', label: '外倾充电', score: 45 },
        { key: 'energy.flow', label: '心流体验', score: 81 },
        { key: 'energy.creative', label: '创造表达', score: 76 },
        { key: 'energy.intellectual', label: '智力突破', score: 69 },
        { key: 'energy.novelty', label: '新鲜感', score: 63 },
        { key: 'energy.mastery', label: '精通感', score: 74 },
        { key: 'energy.autonomy', label: '自主节奏', score: 82 },
      ],
    },
    {
      key: 'intelligence',
      label: '多元智能',
      subScores: [
        { key: 'intel.linguistic', label: '语言智能', score: 65 },
        { key: 'intel.logicMath', label: '逻辑数学智能', score: 78 },
        { key: 'intel.spatial', label: '空间智能', score: 72 },
        { key: 'intel.bodily', label: '身体运动智能', score: 42 },
        { key: 'intel.musical', label: '音乐智能', score: 58 },
        { key: 'intel.interpersonal', label: '人际智能', score: 51 },
        { key: 'intel.intrapersonal', label: '内省智能', score: 83 },
        { key: 'intel.naturalist', label: '自然观察智能', score: 67 },
      ],
    },
    {
      key: 'drive',
      label: '核心驱动力',
      subScores: [
        { key: 'drive.explore', label: '探索', score: 88 },
        { key: 'drive.creation', label: '创造', score: 79 },
        { key: 'drive.freedom', label: '自由', score: 85 },
        { key: 'drive.internal', label: '内在动机', score: 76 },
        { key: 'drive.connect', label: '连接', score: 52 },
        { key: 'drive.influence', label: '影响', score: 41 },
        { key: 'drive.security', label: '安全', score: 35 },
        { key: 'drive.balance', label: '平衡', score: 48 },
        { key: 'drive.external', label: '外在动机', score: 32 },
      ],
    },
  ],
  jung: {
    EI: 32, // 偏内倾
    SN: 71, // 偏直觉
    TF: 44, // 略偏思维
    JP: 62, // 略偏知觉
  },
  riasec: {
    scores: { R: 38, I: 82, A: 74, S: 45, E: 31, C: 28 },
    code: 'IAS',
    consistency: 'high',
    differentiation: 'high',
    clarity: 'high',
  },
  readiness: {
    overall: 64,
    subScores: {
      selfAwareness: 72,
      careerInfo: 55,
      decisionAbility: 61,
      realityOriented: 68,
      adaptability: 65,
    },
  },
  consistencyFlags: [],
  candidateFields: [
    '科学研究与实验',
    '软件开发与编程',
    '数据科学与分析',
    '创意写作与内容创作',
    '建筑与空间设计',
    '心理学与认知科学',
  ],
};

export default function DemoResultPage() {
  const [showCharts, setShowCharts] = useState(false);
  const report = generateTemplateReport('L3', mockResult);
  const meta = levelMeta['L3'];

  const sectionConfig = [
    { key: 'overview' as const, title: '综合画像', icon: '🌟' },
    { key: 'interestInterpretation' as const, title: '兴趣类型解读', icon: '🎯' },
    { key: 'abilityInterpretation' as const, title: '能力倾向解读', icon: '🧠' },
    { key: 'cognitiveInterpretation' as const, title: '认知风格解读', icon: '💡' },
    { key: 'driveInterpretation' as const, title: '驱动力解读', icon: '🔥' },
    { key: 'explorationSuggestions' as const, title: '值得探索的方向', icon: '🗺️' },
    { key: 'actionSteps' as const, title: '下一步行动', icon: '🚀' },
    { key: 'guardianNote' as const, title: '给家长/教师的话', icon: '💬' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 pb-16">
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium mb-4 border border-green-100">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            测评完成
          </div>
          <p className="text-sm text-gray-400 mb-2">{meta.emoji} {meta.label}版测评报告</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">你的探索画像</h1>
          <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
            <span className="text-sm text-gray-500">兴趣代码</span>
            <span className="font-mono text-xl font-bold text-blue-600 tracking-wider">{mockResult.riasec.code}</span>
          </div>
          <p className="mt-2 text-xs text-orange-400">（Demo 模拟数据）</p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-5 space-y-6">
        {/* 报告文字 */}
        {sectionConfig.map(({ key, title, icon }, i) => {
          const content = report[key];
          if (!content) return null;
          return (
            <motion.section
              key={key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>{icon}</span>{title}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</div>
            </motion.section>
          );
        })}

        {/* AI 入口 */}
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-5 border border-violet-100 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">想要更个性化的深度解读？</p>
              <p className="text-xs text-gray-400">AI 将基于匿名汇总分数生成，不发送个人信息</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-violet-200/50 shrink-0 opacity-60 cursor-not-allowed">
              AI 解读
            </button>
          </div>
        </div>

        {/* 图表折叠 */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowCharts((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">📊 查看详细数据图表</span>
            <motion.svg animate={{ rotate: showCharts ? 180 : 0 }} className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {showCharts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-6 border-t border-gray-100 pt-4">
                  {/* RIASEC */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">RIASEC 兴趣六角</h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { subject: '实际 R', score: 38, fullMark: 100 },
                          { subject: '探究 I', score: 82, fullMark: 100 },
                          { subject: '艺术 A', score: 74, fullMark: 100 },
                          { subject: '社会 S', score: 45, fullMark: 100 },
                          { subject: '企业 E', score: 31, fullMark: 100 },
                          { subject: '常规 C', score: 28, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Jung */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">荣格认知光谱</h3>
                    <div className="space-y-4">
                      {[
                        { left: '内倾 I', right: '外倾 E', value: 32 },
                        { left: '感觉 S', right: '直觉 N', value: 71 },
                        { left: '思维 T', right: '情感 F', value: 44 },
                        { left: '判断 J', right: '知觉 P', value: 62 },
                      ].map(({ left, right, value }) => (
                        <div key={left} className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className={value < 40 ? 'font-semibold text-gray-900' : ''}>{left}</span>
                            <span className={value > 60 ? 'font-semibold text-gray-900' : ''}>{right}</span>
                          </div>
                          <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full" style={{ width: `${value}%` }} />
                            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full shadow-sm" style={{ left: `calc(${value}% - 7px)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 免责声明 */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed space-y-1">
          <p>⚠️ 本报告基于你本次作答的倾向生成，反映的是当前状态而非固定特质。</p>
          <p>结果不构成心理诊断、升学决策或职业规划建议。建议结合真实体验和专业人士指导使用。</p>
        </div>

        {/* 按钮 */}
        <div className="flex flex-wrap gap-3 justify-center pt-4 no-print">
          <Link href="/" className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
            返回首页
          </Link>
          <button
            onClick={() => { window.print(); }}
            className="px-5 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            导出 PDF
          </button>
        </div>
      </div>
    </main>
  );
}
