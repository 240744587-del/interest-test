'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Level } from '@/lib/questions/types';
import { levelMeta } from '@/lib/questions';

interface Props {
  level: Level;
  onConsent: () => void;
}

/**
 * 分龄双重同意页：
 * - L1/L2（小学/初中）：监护人同意 + 孩子本人愿意参与，双重勾选
 * - L3/L4（高中/成人）：本人知情同意
 */
export function ConsentGate({ level, onConsent }: Props) {
  const isUnder14 = level === 'L1' || level === 'L2';
  const [guardian, setGuardian] = useState(false);
  const [assent, setAssent] = useState(false);
  const [self, setSelf] = useState(false);

  const canStart = isUnder14 ? guardian && assent : self;
  const meta = levelMeta[level];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 flex flex-col">
      <div className="max-w-lg mx-auto px-5 pt-8 w-full">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {meta.emoji} {meta.label}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-4xl block">🌱</span>
            <p className="text-xs text-gray-400 font-medium tracking-wider">开始之前</p>
            <h1 className="text-xl font-bold text-gray-900">你的答案属于你</h1>
          </div>

          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-medium h-fit mt-0.5">可以跳过</span>
              <span className="text-gray-600">&ldquo;不知道、没经历过、都不像&rdquo;都是有效答案，不需要硬选</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-medium h-fit mt-0.5">不会定型</span>
              <span className="text-gray-600">结果只是当前的探索入口，不代表永久的人格或能力标签</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-xs font-medium h-fit mt-0.5">不留档案</span>
              <span className="text-gray-600">不收集姓名、学校等身份信息，答案只用于本次评分</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium h-fit mt-0.5">AI 可选</span>
              <span className="text-gray-600">完成后可只看本地报告；仅在主动点击 AI 解读时，匿名汇总分才会发送给第三方 AI 服务</span>
            </li>
          </ul>

          <div className="space-y-3 pt-1 border-t border-gray-100">
            {isUnder14 ? (
              <>
                <label className="flex items-start gap-3 cursor-pointer group pt-4">
                  <input
                    type="checkbox"
                    checked={guardian}
                    onChange={(e) => setGuardian(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <strong className="text-gray-800">监护人同意</strong> — 我了解这是兴趣探索工具，不是诊断或选拔依据，并同意孩子自愿参与
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={assent}
                    onChange={(e) => setAssent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    <strong className="text-gray-800">我愿意参与</strong>（孩子本人勾选）— 我知道随时可以停下来，也不需要选&ldquo;大人喜欢的答案&rdquo;
                  </span>
                </label>
              </>
            ) : (
              <label className="flex items-start gap-3 cursor-pointer group pt-4">
                <input
                  type="checkbox"
                  checked={self}
                  onChange={(e) => setSelf(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  <strong className="text-gray-800">我理解并自愿参与</strong> — 我知道结果不构成心理诊断、升学或职业决策意见
                </span>
              </label>
            )}
          </div>

          <button
            onClick={onConsent}
            disabled={!canStart}
            className="w-full py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200/50 active:scale-[0.98]"
          >
            进入探索 →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
