'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { levelMeta, isLevelReady } from '@/lib/questions';
import type { Level } from '@/lib/questions/types';

export default function Home() {
  const router = useRouter();

  const handleSelect = (level: Level) => {
    if (!isLevelReady(level)) return;
    router.push(`/test?level=${level}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            🧭 探路者
          </h1>
          <p className="text-lg text-gray-600 mb-2 leading-relaxed">
            兴趣探索与职业方向启蒙测评
          </p>
          <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            基于霍兰德职业兴趣理论、荣格心理类型、加德纳多元智能和舒伯生涯发展理论，
            帮助你发现自己的兴趣种子和能力倾向。
          </p>
        </motion.div>
      </div>

      {/* 年龄选择 */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500 mb-6"
        >
          选择你当前的教育阶段，开始测评：
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(levelMeta) as [Level, typeof levelMeta.L1][]).map(
            ([level, meta], i) => {
              const ready = isLevelReady(level);
              return (
                <motion.button
                  key={level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => handleSelect(level)}
                  disabled={!ready}
                  className={`
                    relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                    ${ready
                      ? 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 cursor-pointer group'
                      : 'bg-gray-50 border-2 border-dashed border-gray-200 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <div className="relative">
                    <span className="text-3xl mb-3 block">{meta.emoji}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {meta.label}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{meta.desc}</p>
                    {ready ? (
                      <span className="text-xs text-blue-500 font-medium">
                        开始测评 →
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        即将开放
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            }
          )}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
          <p className="font-medium">📋 使用前请了解：</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 leading-relaxed">
            <li>这是兴趣探索工具，不是专业诊断或升学决策依据</li>
            <li>不要求填写姓名、学校等身份信息</li>
            <li>答案只用于当次评分，不建立个人档案或样本库</li>
            <li>匿名汇总分会发送给 AI 服务生成文字解读，你也可以只查看基础报告</li>
            <li>小学生和初中生请在家长知情下使用</li>
          </ul>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-300 pb-6">
        探路者 · 兴趣探索工具 · 结果反映当前回答倾向，建议通过真实活动验证
      </footer>
    </main>
  );
}
