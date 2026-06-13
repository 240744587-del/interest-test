'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronsDown,
  Compass,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/** 滚过首屏后出现的悬浮 CTA */
function FloatingCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-5 right-5 z-30"
        >
          <Link
            href="/start"
            className="field-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-xl transition-transform hover:-translate-y-0.5"
          >
            开始测评
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import type { CSSProperties } from 'react';

const stages = [
  ['L1', '小学', '发现兴趣种子'],
  ['L2', '初中', '认识能力倾向'],
  ['L3', '高中', '探索发展方向'],
  ['L4', '成人', '检视学习与职业'],
];

const bloomNodes = [
  { key: 'energy', label: '心理能量', delay: '.4s' },
  { key: 'ability', label: '能力倾向', delay: '.55s' },
  { key: 'interest', label: '兴趣类型', delay: '.7s' },
  { key: 'drive', label: '核心驱动力', delay: '.85s' },
  { key: 'cognition', label: '认知风格', delay: '1s' },
  { key: 'readiness', label: '发展准备度', delay: '1.15s' },
];

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.65 },
};

export default function Home() {
  return (
    <main className="marketing-page min-h-screen">
      <section className="hero-field relative flex min-h-[100svh] items-center overflow-hidden px-5 py-28">
        <div className="hero-field__inner mx-auto w-full max-w-6xl">
          <motion.div
            className="hero-field__copy relative z-10"
          >
            <h1 className="brand-hero" aria-label="向野">
              <span className="brand-hero__main">
                <span className="brand-hero__logo-crop" aria-hidden="true">
                  <Image
                    className="brand-hero__logo"
                    src="/brand/xiangye-logo-d-transparent.png"
                    alt=""
                    fill
                    sizes="104px"
                    priority
                  />
                </span>
                <span>向野</span>
              </span>
            </h1>
            <p className="hero-slogan mt-9 w-fit max-w-[38rem] font-heading-serif font-bold leading-[1.3] text-[#3a4a38]">
              从兴趣出发，向辽阔处生长
            </p>
            <p className="hero-description mt-5 max-w-[31rem] text-base leading-8 text-[#687267] sm:text-lg">
              面向不同成长阶段的兴趣探索工具，帮助你更好地认识自己，发现值得尝试的成长方向。
            </p>
            <div className="hero-primary-action mt-8 flex w-full max-w-96 justify-center">
              <Link
                href="/start"
                className="field-primary inline-flex min-w-44 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-medium transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                开始测评
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
        <a href="#growth-clues" className="hero-scroll-cue">
          <span>下滑了解更多</span>
          <ChevronsDown className="h-5 w-5" aria-hidden="true" />
        </a>
      </section>

      <section id="growth-clues" className="story-section story-section--cream">
        <motion.div {...sectionMotion} className="story-grid">
          <div>
            <p className="story-kicker">01 · 多维探索</p>
            <h2 className="story-title">从多个角度，看见成长线索</h2>
            <p className="story-copy">
              兴趣不是一个简单标签。测评从心理能量、能力倾向、兴趣类型、
              核心驱动力、认知风格与发展准备度六个维度，拼出更完整的探索画像。
            </p>
            <p className="story-note">
              参考霍兰德、荣格、加德纳、舒伯、施恩与心流等经典理论。
            </p>
          </div>
          <div className="growth-map growth-map--dimensions" aria-hidden="true">
            <div className="growth-bloom__halo" />
            <div className="growth-bloom__halo growth-bloom__halo--inner" />
            <svg className="growth-bloom__trail" viewBox="0 0 400 400">
              <path className="growth-bloom__trail-path growth-bloom__trail-path--one" d="M200 200 C200 158 200 117 200 72" />
              <path className="growth-bloom__trail-path growth-bloom__trail-path--two" d="M200 200 C235 178 278 150 320 122" />
              <path className="growth-bloom__trail-path growth-bloom__trail-path--three" d="M200 200 C240 218 281 246 321 278" />
              <path className="growth-bloom__trail-path growth-bloom__trail-path--four" d="M200 200 C200 242 200 285 200 328" />
              <path className="growth-bloom__trail-path growth-bloom__trail-path--five" d="M200 200 C162 220 119 247 79 278" />
              <path className="growth-bloom__trail-path growth-bloom__trail-path--six" d="M200 200 C161 179 119 150 80 122" />
            </svg>
            <div className="growth-bloom__seed">
              <Sprout className="h-7 w-7" />
              <span>成长线索</span>
            </div>
            {bloomNodes.map((node) => (
              <div
                key={node.key}
                className={`growth-bloom__emergence growth-bloom__emergence--${node.key}`}
                style={{ '--emerge-delay': node.delay } as CSSProperties}
              >
                <div className={`growth-bloom__node growth-bloom__node--${node.key}`}>
                  <strong>{node.label}</strong>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="story-section story-section--sage">
        <motion.div {...sectionMotion} className="story-grid story-grid--reverse">
          <div>
            <p className="story-kicker">02 · 分阶段适配</p>
            <h2 className="story-title">不同阶段，不同探索方式</h2>
            <p className="story-copy">
              小学生、初中生、高中生与成人面对的生活经验不同，不该回答同一套问题。
              向野按成长阶段调整题目表达、情境与解读重点，让回答更贴近真实体验。
            </p>
          </div>
          <div className="feature-visual stage-path">
            {stages.map(([level, label, description], index) => (
              <div
                key={level}
                className="stage-step"
                style={{ '--stage-offset': `${index * 8}%` } as CSSProperties}
              >
                <span className="stage-step__level">{level}</span>
                <div>
                  <strong>{label}</strong>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="story-section story-section--paper">
        <motion.div {...sectionMotion} className="story-grid">
          <div>
            <p className="story-kicker">03 · 开放探索</p>
            <h2 className="story-title">结果是线索，不是标签</h2>
            <p className="story-copy">
              报告反映的是你此刻的回答倾向，而不是永久不变的人格结论。
              它提供可以尝试的方向，真正的答案仍需要在学习、活动和工作中慢慢验证。
            </p>
          </div>
          <div className="feature-visual snapshot-card">
            <div className="snapshot-card__top">
              <span>此刻的探索画像</span>
              <Compass className="h-5 w-5" />
            </div>
            <div className="snapshot-card__line snapshot-card__line--wide" />
            <div className="snapshot-card__line" />
            <div className="snapshot-card__tags">
              <span>值得尝试</span>
              <span>继续观察</span>
              <span>真实体验</span>
            </div>
            <p>不是定论，而是一张继续出发的地图。</p>
          </div>
        </motion.div>
      </section>

      <section className="story-section story-section--olive">
        <motion.div {...sectionMotion} className="story-grid story-grid--reverse">
          <div>
            <p className="story-kicker story-kicker--light">04 · 隐私边界</p>
            <h2 className="story-title story-title--light">隐私优先，由你决定</h2>
            <p className="story-copy story-copy--light">
              无需填写姓名、学校或单位。答案只在本次测评中计算，不建立个人档案或样本库。
              AI 深度解读完全可选，只有主动点击时才发送匿名汇总分数。
            </p>
          </div>
          <div className="privacy-panel">
            <ShieldCheck className="h-9 w-9" />
            <div className="privacy-panel__row">
              <span>身份信息</span>
              <strong>不收集</strong>
            </div>
            <div className="privacy-panel__row">
              <span>作答结果</span>
              <strong>不留存</strong>
            </div>
            <div className="privacy-panel__row">
              <span>AI 解读</span>
              <strong>由你选择</strong>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="final-cta">
        <motion.div {...sectionMotion} className="mx-auto max-w-3xl text-center">
          <p className="brand-wordmark text-5xl sm:text-6xl">向野</p>
          <h2 className="mt-8 font-heading-serif text-3xl font-bold text-[#2c3b2f] sm:text-5xl">
            下一步，从认识自己开始
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#70796d]">
            选择与你当前阶段相符的题目，诚实回答此刻的感受。
          </p>
          <Link
            href="/start"
            className="field-primary mt-9 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-medium transition-transform hover:-translate-y-0.5"
          >
            开始测评
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <footer className="bg-[#f3eddf] px-5 py-7 text-center text-xs text-[#8a9086]">
        向野 · 兴趣与成长方向探索工具 · 结果反映当前回答倾向
      </footer>

      <FloatingCTA />
    </main>
  );
}
