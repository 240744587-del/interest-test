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
  const [mode, setMode] = useState<'most' | 'least'>('most');

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
      if (optionId === most) return; // 不能选同一个
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
      <div className="flex items-center justify-center gap-4 text-sm">
        <button
          onClick={() => setMode('most')}
          className={`px-3 py-1.5 rounded-full transition-all ${
            mode === 'most' ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-500'
          }`}
        >
          👍 选最喜欢
        </button>
        <button
          onClick={() => setMode('least')}
          className={`px-3 py-1.5 rounded-full transition-all ${
            mode === 'least' ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-500'
          }`}
        >
          👎 选最不喜欢
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          const isMost = most === opt.id;
          const isLeast = least === opt.id;
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleClick(opt.id)}
              disabled={mode === 'least' && opt.id === most}
              className={`
                text-left px-4 py-3 rounded-xl border-2 transition-all text-sm leading-relaxed
                flex items-start gap-2
                ${isMost ? 'border-green-500 bg-green-50 text-green-900' : ''}
                ${isLeast ? 'border-red-400 bg-red-50 text-red-900' : ''}
                ${!isMost && !isLeast ? 'border-gray-200 bg-white hover:border-gray-300 text-gray-700' : ''}
                ${mode === 'least' && opt.id === most ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <span className="shrink-0 mt-0.5">
                {isMost && '👍'}{isLeast && '👎'}{!isMost && !isLeast && String.fromCharCode(65 + i)}
              </span>
              <span>{opt.text}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
