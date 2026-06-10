'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selectedMost?: string;
  selectedLeast?: string;
  onSelect: (value: AnswerValue) => void;
}

export function ForcedChoice({ question, selectedMost, selectedLeast, onSelect }: Props) {
  const [most, setMost] = useState<string | undefined>(selectedMost);
  const [least, setLeast] = useState<string | undefined>(selectedLeast);
  const [mode, setMode] = useState<'most' | 'least'>(selectedMost ? 'least' : 'most');

  const handleClick = (optionId: string) => {
    if (mode === 'most') {
      const newMost = optionId;
      const newLeast = least === optionId ? undefined : least;
      setMost(newMost);
      setLeast(newLeast);
      setMode('least');
      if (newLeast) {
        onSelect({ kind: 'forcedChoice', mostOptionId: newMost, leastOptionId: newLeast });
      }
    } else {
      if (optionId === most) return;
      const newLeast = optionId;
      setLeast(newLeast);
      setMode('most');
      onSelect({ kind: 'forcedChoice', mostOptionId: most!, leastOptionId: newLeast });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-4"
    >
      {/* 步骤指示 */}
      <div className="flex items-center justify-center gap-3 text-sm">
        <button
          onClick={() => setMode('most')}
          className={`px-4 py-2 rounded-full transition-all border ${
            mode === 'most'
              ? 'bg-green-50 text-green-700 font-medium border-green-200 shadow-sm'
              : 'bg-white text-gray-400 border-gray-100'
          }`}
        >
          <span className="mr-1">👍</span>
          {most ? '已选最喜欢' : '选最喜欢'}
        </button>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <button
          onClick={() => setMode('least')}
          className={`px-4 py-2 rounded-full transition-all border ${
            mode === 'least'
              ? 'bg-red-50 text-red-700 font-medium border-red-200 shadow-sm'
              : 'bg-white text-gray-400 border-gray-100'
          }`}
        >
          <span className="mr-1">👎</span>
          {least ? '已选最不想' : '选最不想'}
        </button>
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {question.options.map((opt, i) => {
          const isMost = most === opt.id;
          const isLeast = least === opt.id;
          const isDisabled = mode === 'least' && opt.id === most;
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleClick(opt.id)}
              disabled={isDisabled}
              className={`
                text-left px-4 py-3.5 rounded-xl border-2 transition-all text-sm leading-relaxed
                flex items-start gap-2.5
                ${isMost ? 'border-green-400 bg-green-50 text-green-900 shadow-sm' : ''}
                ${isLeast ? 'border-red-300 bg-red-50 text-red-900 shadow-sm' : ''}
                ${!isMost && !isLeast && !isDisabled ? 'border-gray-150 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700' : ''}
                ${isDisabled ? 'opacity-30 cursor-not-allowed border-gray-100 bg-gray-50' : ''}
              `}
            >
              <span className={`
                shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
                ${isMost ? 'bg-green-500 text-white' : ''}
                ${isLeast ? 'bg-red-400 text-white' : ''}
                ${!isMost && !isLeast ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {isMost ? '👍' : isLeast ? '👎' : String.fromCharCode(65 + i)}
              </span>
              <span>{opt.text}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
