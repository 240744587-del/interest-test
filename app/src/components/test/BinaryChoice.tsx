'use client';

import { motion } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selected?: string;
  onSelect: (value: AnswerValue) => void;
}

export function BinaryChoice({ question, selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {question.options.map((opt, i) => {
        const isSelected = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect({ kind: 'single', optionId: opt.id })}
            className={`
              w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200
              text-base leading-relaxed
              ${isSelected
                ? 'border-[#66784e] bg-[#edf1df] text-[#31402f] shadow-md scale-[1.02]'
                : 'border-[#ded7c7] bg-[#fffdf8] hover:border-[#aab58e] hover:shadow-sm text-gray-700'
              }
            `}
          >
            <span className={`
              inline-flex items-center justify-center w-7 h-7 rounded-full mr-3 text-sm font-bold
              ${isSelected ? 'bg-[#66784e] text-white' : 'bg-[#f0ece2] text-gray-500'}
            `}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt.text}
          </motion.button>
        );
      })}
    </div>
  );
}
