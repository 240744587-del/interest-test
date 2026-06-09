'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import type { Question, AnswerValue } from '@/lib/questions/types';

interface Props {
  question: Question;
  selected?: string[];
  onSelect: (value: AnswerValue) => void;
}

export function RankingQuestion({ question, selected, onSelect }: Props) {
  const [items, setItems] = useState(
    selected?.map((id) => question.options.find((o) => o.id === id)!).filter(Boolean)
    ?? [...question.options]
  );

  useEffect(() => {
    // 初次渲染也提交一个默认排序
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
      <p className="text-sm text-gray-500 text-center">
        拖动调整顺序（最上面 = 最想要）
      </p>
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="cursor-grab active:cursor-grabbing"
          >
            <div className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white
              ${index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}
              transition-colors duration-200
            `}>
              <span className={`
                w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-400'}
              `}>
                {index + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1">{item.text}</span>
              <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </motion.div>
  );
}
