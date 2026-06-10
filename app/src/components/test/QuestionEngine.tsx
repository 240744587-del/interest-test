'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Question, AnswerValue, Answer } from '@/lib/questions/types';
import { getQuestionBank, levelMeta } from '@/lib/questions';
import type { Level } from '@/lib/questions/types';
import { questionBanks } from '@/data/questions/generated';
import { scoreAssessment } from '@/domain/assessment/score';
import { buildScoreResult } from '@/domain/assessment/report';
import { useResultStore } from '@/components/assessment/ResultStore';
import { BinaryChoice } from './BinaryChoice';
import { ScenarioChoice } from './ScenarioChoice';
import { LikertScale } from './LikertScale';
import { RankingQuestion } from './RankingQuestion';
import { ForcedChoice } from './ForcedChoice';

const dimensionLabels: Record<string, { label: string; color: string }> = {
  energy:       { label: '心理能量', color: 'bg-amber-100 text-amber-700' },
  intelligence: { label: '能力倾向', color: 'bg-purple-100 text-purple-700' },
  riasec:       { label: '兴趣类型', color: 'bg-blue-100 text-blue-700' },
  drive:        { label: '核心驱动力', color: 'bg-red-100 text-red-700' },
  cognitive:    { label: '认知风格', color: 'bg-indigo-100 text-indigo-700' },
  readiness:    { label: '发展准备度', color: 'bg-emerald-100 text-emerald-700' },
};

interface Props {
  level: Level;
}

export function QuestionEngine({ level }: Props) {
  const router = useRouter();
  const { setResult } = useResultStore();
  const bank = useMemo(() => getQuestionBank(level), [level]);
  const questions = bank.questions;
  const total = questions.length;
  const meta = levelMeta[level];
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;
  const currentAnswer = answers.get(question?.id);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total]);

  const handleSelect = useCallback(
    (value: AnswerValue) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, { questionId: question.id, value });
        return next;
      });

      // 自动前进：binary/scenario/likert 选完后短暂延迟自动到下一题
      const autoTypes = ['binary', 'scenario', 'likert'];
      if (autoTypes.includes(question.type) && currentIndex < total - 1) {
        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = setTimeout(() => {
          goNext();
        }, 400);
      }
    },
    [question, currentIndex, total, goNext]
  );

  const goPrev = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const score = scoreAssessment(
        level,
        Array.from(answers.values()),
        questionBanks[level],
      );
      setResult(buildScoreResult(score));
      router.push('/result');
    } catch {
      setSubmitting(false);
      setSubmitError('结果生成失败，请检查是否完成所有题目后重试');
    }
  }, [answers, level, router, setResult]);

  const getSelectedValue = (ans?: Answer) => {
    if (!ans) return undefined;
    if (ans.value.kind === 'single') return ans.value.optionId;
    if (ans.value.kind === 'likert') return ans.value.value;
    if (ans.value.kind === 'ranking') return ans.value.optionIds;
    if (ans.value.kind === 'forcedChoice')
      return { most: ans.value.mostOptionId, least: ans.value.leastOptionId };
    return undefined;
  };

  const isLastQuestion = currentIndex === total - 1;
  const allAnswered = answers.size === total;
  const hasCurrentAnswer = answers.has(question?.id);
  const dimInfo = dimensionLabels[question?.dimension] ?? { label: '', color: 'bg-gray-100 text-gray-600' };

  const renderQuestion = (q: Question) => {
    const sel = getSelectedValue(currentAnswer);
    switch (q.type) {
      case 'binary':
        return <BinaryChoice question={q} selected={sel as string | undefined} onSelect={handleSelect} />;
      case 'scenario':
        return <ScenarioChoice question={q} selected={sel as string | undefined} onSelect={handleSelect} />;
      case 'likert':
        return <LikertScale question={q} selected={sel as number | undefined} onSelect={handleSelect} />;
      case 'ranking':
        return <RankingQuestion question={q} selected={sel as string[] | undefined} onSelect={handleSelect} />;
      case 'forcedChoice': {
        const fc = sel as { most?: string; least?: string } | undefined;
        return (
          <ForcedChoice
            question={q}
            selectedMost={fc?.most}
            selectedLeast={fc?.least}
            onSelect={handleSelect}
          />
        );
      }
      default:
        return <div>暂不支持的题型</div>;
    }
  };

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* 顶部进度条 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100/80">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-600 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {meta.emoji} {meta.label}
            </Link>
            <span className="tabular-nums font-medium text-gray-500">{currentIndex + 1} / {total}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full space-y-6"
          >
            {/* 维度标签 */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${dimInfo.color}`}>
                {dimInfo.label}
              </span>
            </div>

            {/* 题目文本 */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed">
                {question.text}
              </h2>
              {question.description && (
                <p className="text-sm text-gray-500">{question.description}</p>
              )}
            </div>

            {/* 题目选项 */}
            {renderQuestion(question)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部导航 */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100/80">
        {submitError && (
          <p
            role="alert"
            className="max-w-lg mx-auto px-4 pt-3 text-center text-sm text-red-600"
          >
            {submitError}
          </p>
        )}
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            ← 上一题
          </button>

          {/* 跳题指示器 - 中间的小圆点 */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(total, 20) }, (_, i) => {
              const idx = total <= 20 ? i : Math.round((i / 19) * (total - 1));
              const answered = answers.has(questions[idx]?.id);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${isCurrent ? 'w-5 bg-blue-500' : answered ? 'bg-blue-300' : 'bg-gray-200'}
                  `}
                  title={`第 ${idx + 1} 题`}
                />
              );
            })}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200/50 active:scale-95"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  生成中...
                </span>
              ) : (
                `查看报告（${answers.size}/${total}）`
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!hasCurrentAnswer}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              下一题 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
