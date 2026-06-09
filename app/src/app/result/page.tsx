'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Answer, Level, ScoreResult } from '@/lib/questions/types';
import { calculateScores } from '@/lib/scoring/engine';
import { levelMeta } from '@/lib/questions';

export default function ResultPage() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem('test-result');
        if (!raw) {
          setError('没有找到测评数据，请从首页重新开始');
          return;
        }
        const { level, answers } = JSON.parse(raw) as {
          level: Level;
          answers: Answer[];
        };
        const scoreResult = calculateScores(level, answers);
        setResult(scoreResult);
      } catch {
        setError('数据解析失败，请重新测评');
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{error}</p>
          <Link href="/" className="text-blue-500 text-sm hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 text-sm">正在计算你的测评结果...</p>
        </div>
      </div>
    );
  }

  const meta = levelMeta[result.level];

  // 准备雷达图数据
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-gray-400 mb-2">{meta.emoji} {meta.label}版测评报告</p>
          <h1 className="text-2xl font-bold text-gray-900">你的探索画像</h1>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {/* RIASEC 兴趣六角 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">🎯 兴趣类型</h2>
          <p className="text-sm text-gray-500 mb-4">
            兴趣代码：<span className="font-mono font-bold text-blue-600">{result.riasec.code}</span>
            <span className="mx-2">·</span>
            区分度{result.riasec.differentiation === 'high' ? '高' : result.riasec.differentiation === 'medium' ? '中' : '低'}
            <span className="mx-2">·</span>
            一致性{result.riasec.consistency === 'high' ? '高' : result.riasec.consistency === 'medium' ? '中' : '低'}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riasecData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="兴趣"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* 多元智能雷达 */}
        {intelligenceData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">🧠 能力倾向</h2>
            <p className="text-sm text-gray-500 mb-4">基于加德纳多元智能理论</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={intelligenceData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="能力"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* 荣格光谱 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">💡 认知风格</h2>
          <p className="text-sm text-gray-500 mb-5">基于荣格心理类型理论</p>
          <div className="space-y-5">
            {jungLabels.map(({ key, left, right }) => {
              const value = result.jung[key];
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={value < 40 ? 'font-semibold text-gray-900' : ''}>{left}</span>
                    <span className={value > 60 ? 'font-semibold text-gray-900' : ''}>{right}</span>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '50%' }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full"
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-sm"
                      style={{ left: `calc(${value}% - 8px)` }}
                    />
                  </div>
                  <div className="text-center text-xs text-gray-400">
                    {value >= 40 && value <= 60
                      ? '两侧较为平衡'
                      : value < 40
                        ? `偏向${left}`
                        : `偏向${right}`}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 核心驱动力 */}
        {result.dimensions.find((d) => d.key === 'drive') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">🔥 核心驱动力</h2>
            <p className="text-sm text-gray-500 mb-4">你内心深处最在意的价值</p>
            <div className="space-y-3">
              {result.dimensions
                .find((d) => d.key === 'drive')!
                .subScores.slice(0, 5)
                .map((s, i) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">{s.label}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                        className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{s.score}</span>
                  </div>
                ))}
            </div>
          </motion.section>
        )}

        {/* 推荐探索方向 */}
        {result.candidateFields.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">🗺️ 值得探索的方向</h2>
            <p className="text-sm text-gray-500 mb-4">
              这些方向与你当前的兴趣和能力倾向匹配度较高，建议通过真实体验进一步验证
            </p>
            <div className="flex flex-wrap gap-2">
              {result.candidateFields.map((field) => (
                <span
                  key={field}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
                >
                  {field}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* 免责声明 */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed space-y-1">
          <p>⚠️ 本报告基于你本次作答的倾向生成，反映的是当前状态而非固定特质。</p>
          <p>结果不构成心理诊断、升学决策或职业规划建议。建议结合真实体验和专业人士指导使用。</p>
          <p>如需更深入的探索，建议参加职业体验活动、与生涯规划师交流。</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-center pt-4">
          <Link
            href="/"
            className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
          >
            返回首页
          </Link>
          <button
            onClick={() => {
              router: window.location.href = `/test?level=${result.level}`;
            }}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all"
          >
            重新测评
          </button>
        </div>
      </div>
    </main>
  );
}
