'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Question, AnswerValue, Answer } from '@/lib/questions/types';
import { getQuestionBank } from '@/lib/questions';
import type { Level } from '@/lib/questions/types';
import { BinaryChoice } from './BinaryChoice';
import { ScenarioChoice } from './ScenarioChoice';
import { LikertScale } from './LikertScale';
import { RankingQuestion } from './RankingQuestion';
import { ForcedChoice } from './ForcedChoice';

interface Props {
  level: Level;
}

export function QuestionEngine({ level }: Props) {
  const router = useRouter();
  const bank = useMemo(() => getQuestionBank(level), [level]);
  const questions = bank.questions;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward
  const [submitting, setSubmitting] = useState(false);

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;
  const currentAnswer = answers.get(question?.id);

  const handleSelect = useCallback(
    (value: AnswerValue) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(question.id, { questionId: question.id, value });
        return next;
      });
    },
    [question]
  );

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const allAnswers = Array.from(answers.values());
    // 将答案存到 sessionStorage 给结果页用
    sessionStorage.setItem(
      'test-result',
      JSON.stringify({ level, answers: allAnswers })
    );
    router.push('/result');
  }, [answers, level, router]);

  // 获取已选中的值
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
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>第 {currentIndex + 1} / {total} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={question.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25 }}
            className="w-full space-y-6"
          >
            {/* 题目文本 */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
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
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← 上一题
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {submitting ? '生成报告中...' : `查看报告（${answers.size}/${total}）`}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!hasCurrentAnswer}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              下一题 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
