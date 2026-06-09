'use client';

import { motion } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selected?: string;
  onSelect: (value: AnswerValue) => void;
}

export function ScenarioChoice({ question, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {question.options.map((opt, i) => {
        const isSelected = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect({ kind: 'single', optionId: opt.id })}
            className={`
              text-left px-4 py-4 rounded-2xl border-2 transition-all duration-200
              text-sm leading-relaxed min-h-[70px] flex items-start gap-3
              ${isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-gray-700'
              }
            `}
          >
            <span className={`
              inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0 mt-0.5
              ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}
            `}>
              {String.fromCharCode(65 + i)}
            </span>
            <span>{opt.text}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
