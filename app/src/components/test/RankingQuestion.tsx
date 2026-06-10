'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selected?: string[];
  onSelect: (value: AnswerValue) => void;
}

const rankColors = [
  'border-yellow-400 bg-yellow-50',
  'border-gray-300 bg-gray-50',
  'border-amber-300/50 bg-amber-50/30',
  'border-gray-200 bg-white',
];

const rankBadges = [
  'bg-yellow-400 text-white',
  'bg-gray-400 text-white',
  'bg-amber-300 text-white',
  'bg-gray-200 text-gray-500',
];

export function RankingQuestion({ question, selected, onSelect }: Props) {
  const [items, setItems] = useState(
    selected?.map((id) => question.options.find((o) => o.id === id)!).filter(Boolean)
    ?? [...question.options]
  );

  useEffect(() => {
    if (!selected) {
      onSelect({ kind: 'ranking', optionIds: items.map((o) => o.id) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReorder = (newItems: typeof items) => {
    setItems(newItems);
    onSelect({ kind: 'ranking', optionIds: newItems.map((o) => o.id) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-3"
    >
      <p className="text-sm text-gray-400 text-center flex items-center justify-center gap-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        拖动调整顺序（最上面 = 最想要）
      </p>
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <motion.div
              layout
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl border-2
                ${rankColors[index] || rankColors[3]}
                transition-colors duration-200 shadow-sm
              `}
            >
              <span className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${rankBadges[index] || rankBadges[3]}
              `}>
                {index + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1 leading-relaxed">{item.text}</span>
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </motion.div>
  );
}
