'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { QuestionEngine } from '@/components/test/QuestionEngine';
import { ConsentGate } from '@/components/test/ConsentGate';
import { isLevelReady } from '@/lib/questions';
import type { Level } from '@/lib/questions/types';

function TestContent() {
  const searchParams = useSearchParams();
  const level = searchParams.get('level') as Level | null;
  const [consented, setConsented] = useState(false);

  if (!level || !['L1', 'L2', 'L3', 'L4'].includes(level)) {
    return (
      <div className="warm-field-soft min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center space-y-3">
          <p>请先选择教育阶段开始测评</p>
          <Link href="/start" className="field-accent text-sm hover:underline">
            前往选择 →
          </Link>
        </div>
      </div>
    );
  }

  if (!isLevelReady(level)) {
    return (
      <div className="warm-field-soft min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center space-y-3">
          <p className="text-4xl">🚧</p>
          <p>{level} 题库正在开发中，敬请期待</p>
          <Link href="/start" className="field-accent text-sm hover:underline">← 重新选择</Link>
        </div>
      </div>
    );
  }

  if (!consented) {
    return <ConsentGate level={level} onConsent={() => setConsented(true)} />;
  }

  return <QuestionEngine level={level} />;
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="warm-field-soft min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#66784e] border-t-transparent rounded-full" />
        </div>
      }
    >
      <TestContent />
    </Suspense>
  );
}
