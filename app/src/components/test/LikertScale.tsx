'use client';

import { motion } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selected?: number;
  onSelect: (value: AnswerValue) => void;
}

const labels = ['完全不像我', '不太像我', '说不好', '比较像我', '非常像我'];
const emojis = ['😐', '🤔', '😶', '🙂', '😄'];

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

      {/* 刻度条样式 - 移动端友好 */}
      <div className="space-y-3">
        <div className="flex justify-between gap-1.5 sm:gap-2 px-0.5">
          {[1, 2, 3, 4, 5].map((val) => {
            const isSelected = selected === val;
            return (
              <button
                key={val}
                onClick={() => onSelect({ kind: 'likert', value: val as 1 | 2 | 3 | 4 | 5 })}
                className={`
                  flex-1 flex flex-col items-center gap-1.5 py-3 sm:py-4 px-1 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-[#66784e] bg-[#edf1df] scale-[1.05] shadow-md shadow-[#dfe6ca]'
                    : 'border-[#e4ddcf] bg-[#fffdf8] hover:border-[#aab58e] hover:bg-[#faf7ef]'
                  }
                `}
              >
                <span className="text-xl sm:text-2xl">{emojis[val - 1]}</span>
                <span className={`
                  text-[10px] sm:text-xs text-center leading-tight font-medium
                  ${isSelected ? 'text-[#53663f]' : 'text-gray-400'}
                `}>
                  {labels[val - 1]}
                </span>
              </button>
            );
          })}
        </div>

        {/* 滑动提示条 */}
        <div className="relative h-1.5 bg-gray-100 rounded-full mx-2">
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${selected === i + 1 ? 'bg-[#66784e]' : 'bg-gray-300'}`} />
              </div>
            ))}
          </div>
          {selected && (
            <motion.div
              className="absolute top-0 h-full bg-gradient-to-r from-[#cbd5aa] to-[#829463] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((selected - 1) / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
