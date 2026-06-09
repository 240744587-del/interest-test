'use client';

import { useState, useCallback } from 'react';
import type { Answer, AnswerValue, Level } from '@/lib/questions/types';

interface AnswerStore {
  level: Level | null;
  answers: Map<string, Answer>;
  currentIndex: number;
}

export function useAnswerStore() {
  const [store, setStore] = useState<AnswerStore>({
    level: null,
    answers: new Map(),
    currentIndex: 0,
  });

  const setLevel = useCallback((level: Level) => {
    setStore({ level, answers: new Map(), currentIndex: 0 });
  }, []);

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setStore((prev) => {
      const next = new Map(prev.answers);
      next.set(questionId, { questionId, value });
      return { ...prev, answers: next };
    });
  }, []);

  const getAnswer = useCallback(
    (questionId: string): Answer | undefined => store.answers.get(questionId),
    [store.answers]
  );

  const goTo = useCallback((index: number) => {
    setStore((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  const goNext = useCallback(() => {
    setStore((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
  }, []);

  const goPrev = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  }, []);

  const getAllAnswers = useCallback((): Answer[] => {
    return Array.from(store.answers.values());
  }, [store.answers]);

  const answeredCount = store.answers.size;

  return {
    level: store.level,
    currentIndex: store.currentIndex,
    answeredCount,
    setLevel,
    setAnswer,
    getAnswer,
    getAllAnswers,
    goTo,
    goNext,
    goPrev,
  };
}
