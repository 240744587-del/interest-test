'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreResult } from '@/lib/questions/types';
import { levelMeta } from '@/lib/questions';
import type { AIReport, ReportAPIResponse, ReportStatus } from '@/lib/report/types';
import { generateTemplateReport } from '@/lib/report/template';
import { useResultStore } from '@/components/assessment/ResultStore';

export default function ResultPage() {
  const { result, clearResult } = useResultStore();
  const [reportStatus, setReportStatus] = useState<ReportStatus>({ kind: 'idle' });
  const [showCharts, setShowCharts] = useState(false);
  const localReport = useMemo(
    () => result ? generateTemplateReport(result.level, result) : null,
    [result],
  );

  const requestAIReport = useCallback(async () => {
    if (!result) return;
    setReportStatus({ kind: 'loading' });

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: result.level, summary: result }),
      });
      const data = (await res.json()) as ReportAPIResponse;
      if (data.ok && data.report) {
        setReportStatus({ kind: 'done', report: data.report });
      } else {
        setReportStatus({ kind: 'error', message: data.error || '生成失败' });
      }
    } catch {
      setReportStatus({ kind: 'error', message: '网络错误，请稍后重试' });
    }
  }, [result]);

  if (!result || !localReport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-500">没有找到本次测评结果，请重新开始</p>
          <Link href="/" className="text-blue-500 text-sm hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 当前展示的报告：AI 版优先，否则本地版
  const activeReport =
    reportStatus.kind === 'done' ? reportStatus.report : localReport;
  const isAI = reportStatus.kind === 'done';
  const meta = levelMeta[result.level];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 pb-16">
      {/* Header */}
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

          {/* 兴趣代码快速摘要 */}
          <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
            <span className="text-sm text-gray-500">兴趣代码</span>
            <span className="font-mono text-xl font-bold text-blue-600 tracking-wider">{result.riasec.code}</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-5 space-y-6">

        {/* ====== 报告文字内容 ====== */}
        <ReportSections report={activeReport} />

        {/* ====== AI 增强入口 ====== */}
        {reportStatus.kind === 'idle' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-5 border border-violet-100 no-print"
          >
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
              <button
                onClick={requestAIReport}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:from-violet-600 hover:to-blue-600 transition-all shadow-lg shadow-violet-200/50 active:scale-95 shrink-0"
              >
                AI 解读
              </button>
            </div>
          </motion.section>
        )}

        {/* AI 加载中 */}
        {reportStatus.kind === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 py-6 no-print">
            <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-sm text-gray-500">AI 正在生成更深度的解读...</span>
          </motion.div>
        )}

        {/* AI 错误 */}
        {reportStatus.kind === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 no-print">
            <span className="text-sm text-orange-700">{reportStatus.message}</span>
            <button onClick={requestAIReport} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 shrink-0">
              重试
            </button>
          </motion.div>
        )}

        {/* AI 标记 */}
        {isAI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 w-fit">
            <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-xs text-violet-600">已切换为 AI 深度解读版本</span>
          </motion.div>
        )}

        {/* ====== 数据图表（折叠） ====== */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden no-print">
          <button
            onClick={() => setShowCharts((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">📊 查看详细数据图表</span>
            <motion.svg
              animate={{ rotate: showCharts ? 180 : 0 }}
              className="w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
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
                  <ChartsSection result={result} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 免责声明 */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed space-y-1">
          <p>⚠️ 本报告基于你本次作答的倾向生成，反映的是当前状态而非固定特质。</p>
          <p>结果不构成心理诊断、升学决策或职业规划建议。建议结合真实体验和专业人士指导使用。</p>
          {isAI && <p>AI 解读由第三方大语言模型基于匿名汇总分数生成，仅供参考。</p>}
          <p className="hidden print:block pt-2 border-t border-gray-200 mt-2">
            生成时间：{new Date().toLocaleDateString('zh-CN')} · 向野 · 成长方向探索
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3 justify-center pt-4 no-print">
          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
          >
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
          <button
            onClick={() => {
              clearResult();
              window.location.href = `/test?level=${result.level}`;
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200/50 active:scale-95"
          >
            重新测评
          </button>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// 报告文字段落组件
// ============================================================

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

function ReportSections({ report }: { report: AIReport }) {
  return (
    <>
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
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </motion.section>
        );
      })}
    </>
  );
}

// ============================================================
// 数据图表组件（折叠内展示）
// ============================================================

function ChartsSection({ result }: { result: ScoreResult }) {
  const intelligenceData =
    result.dimensions
      .find((d) => d.key === 'intelligence')
      ?.subScores.map((s) => ({
        subject: s.label.replace('智能', ''),
        score: s.score,
        fullMark: 100,
      })) || [];

  const riasecData = [
    { subject: '实际 R', score: result.riasec.scores.R, fullMark: 100 },
    { subject: '探究 I', score: result.riasec.scores.I, fullMark: 100 },
    { subject: '艺术 A', score: result.riasec.scores.A, fullMark: 100 },
    { subject: '社会 S', score: result.riasec.scores.S, fullMark: 100 },
    { subject: '企业 E', score: result.riasec.scores.E, fullMark: 100 },
    { subject: '常规 C', score: result.riasec.scores.C, fullMark: 100 },
  ];

  const jungLabels = [
    { key: 'EI' as const, left: '内倾 I', right: '外倾 E' },
    { key: 'SN' as const, left: '感觉 S', right: '直觉 N' },
    { key: 'TF' as const, left: '思维 T', right: '情感 F' },
    { key: 'JP' as const, left: '判断 J', right: '知觉 P' },
  ];

  return (
    <>
      {/* RIASEC 雷达 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">RIASEC 兴趣六角</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={riasecData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 多元智能雷达 */}
      {intelligenceData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">多元智能图谱</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={intelligenceData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 荣格光谱 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">荣格认知光谱</h3>
        <div className="space-y-4">
          {jungLabels.map(({ key, left, right }) => {
            const value = result.jung[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={value < 40 ? 'font-semibold text-gray-900' : ''}>{left}</span>
                  <span className={value > 60 ? 'font-semibold text-gray-900' : ''}>{right}</span>
                </div>
                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all duration-700"
                    style={{ width: `${value}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full shadow-sm"
                    style={{ left: `calc(${value}% - 7px)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 驱动力柱状 */}
      {result.dimensions.find((d) => d.key === 'drive') && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">核心驱动力</h3>
          <div className="space-y-2.5">
            {result.dimensions
              .find((d) => d.key === 'drive')!
              .subScores.slice(0, 5)
              .map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-16 shrink-0">{s.label}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-7 text-right">{s.score}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
