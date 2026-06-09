'use client';

import { motion } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selected?: number;
  onSelect: (value: AnswerValue) => void;
}

const labels = ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'];

export function LikertScale({ question, selected, onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-4"
    >
      {question.likertStatement && (
        <p className="text-gray-600 italic text-center text-sm leading-relaxed px-2">
          &ldquo;{question.likertStatement}&rdquo;
        </p>
      )}
      <div className="flex justify-between gap-2 px-1">
        {[1, 2, 3, 4, 5].map((val) => {
          const isSelected = selected === val;
          return (
            <button
              key={val}
              onClick={() => onSelect({ kind: 'likert', value: val as 1 | 2 | 3 | 4 | 5 })}
              className={`
                flex-1 flex flex-col items-center gap-2 py-3 px-1 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 scale-105 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <span className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                {val}
              </span>
              <span className="text-xs text-gray-500 text-center leading-tight">
                {labels[val - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
