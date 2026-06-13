'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getQuestionBank, isLevelReady, levelMeta } from '@/lib/questions';
import type { Level } from '@/lib/questions/types';

const levelOrder: Level[] = ['L1', 'L2', 'L3', 'L4'];

export default function StartPage() {
  const router = useRouter();

  const handleSelect = (level: Level) => {
    if (!isLevelReady(level)) return;
    router.push(`/test?level=${level}`);
  };

  return (
    <main className="warm-field-soft min-h-screen px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="brand-mark-sm">
            向野
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#6f786b] transition-colors hover:text-[#46563b]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-9 pt-12 text-center sm:pt-16"
        >
          <p className="text-xs font-medium tracking-[0.24em] text-[#77806f]">
            开始探索
          </p>
          <h1 className="mt-3 font-heading-serif text-3xl font-bold text-[#2d3b30] sm:text-4xl">
            选择教育阶段
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#7b8277]">
            不同阶段使用不同的题目情境。请选择与你当前生活经验最接近的一项。
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {levelOrder.map((level, index) => {
            const meta = levelMeta[level];
            const ready = isLevelReady(level);
            const bank = getQuestionBank(level);

            return (
              <motion.button
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => handleSelect(level)}
                disabled={!ready}
                className="field-surface group relative overflow-hidden rounded-3xl border p-6 text-left transition-all hover:-translate-y-1 hover:border-[#9aa77a] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#dfe6c8]/45" />
                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-3xl">{meta.emoji}</span>
                    <span className="rounded-full bg-[#eef1e2] px-3 py-1 text-xs font-medium text-[#61704f]">
                      {level}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#303c32]">{meta.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#747c72]">{meta.desc}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-[#8b9188]">
                      {bank.questions.length} 题 · 约 {bank.estimatedMinutes} 分钟
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#596b43]">
                      进入
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[#ded5c2] bg-[#fffaf0]/70 p-5 text-xs leading-6 text-[#807869]">
          这是兴趣探索工具，不是心理诊断、升学或职业决策依据。小学生和初中生请在家长知情下使用。
        </div>
      </div>
    </main>
  );
}
