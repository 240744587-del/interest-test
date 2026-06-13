import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepageSource = readFileSync(
  new URL('./page.tsx', import.meta.url),
  'utf8',
);
const globalStyles = readFileSync(
  new URL('./globals.css', import.meta.url),
  'utf8',
);
const startPageUrl = new URL('./start/page.tsx', import.meta.url);
const startSource = existsSync(startPageUrl)
  ? readFileSync(startPageUrl, 'utf8')
  : '';

describe('homepage brand treatment', () => {
  it('uses the approved open-field logo beside the Xiangye wordmark', () => {
    expect(homepageSource).toContain('/brand/xiangye-logo-d-transparent.png');
    expect(homepageSource).toContain('brand-hero__logo');
    expect(homepageSource).toContain('aria-label="向野"');
    expect(globalStyles).toContain('.brand-hero__logo-crop');
    expect(globalStyles).not.toContain('mix-blend-mode: multiply;');
  });

  it('uses the approved wordmark without a wheat emoji', () => {
    expect(homepageSource).not.toContain('🌾 向野');
    expect(homepageSource).toContain('brand-wordmark');
    expect(homepageSource).not.toContain(
      'XIANGYE · 兴趣与成长方向探索',
    );
  });

  it('uses the approved product positioning and dedicated start route', () => {
    expect(homepageSource).toContain('从兴趣出发，向辽阔处生长');
    expect(homepageSource).toContain('面向不同成长阶段的兴趣探索工具');
    expect(homepageSource).not.toContain(
      'className="hero-eyebrow"',
    );
    expect(homepageSource).toContain('href="/start"');
    expect(homepageSource).not.toContain('免费 · 匿名 · 无需注册');
  });

  it('centers the hero start button without showing an estimated duration', () => {
    expect(homepageSource).toContain(
      'className="hero-slogan mt-9 w-fit',
    );
    expect(homepageSource).toContain(
      'className="hero-primary-action mt-8 flex w-full max-w-96 justify-center"',
    );
    expect(homepageSource).not.toContain('约 10-25 分钟');
  });

  it('makes the brand more prominent than the homepage slogan', () => {
    expect(homepageSource).toContain('<span>向野</span>');
    expect(homepageSource).toContain('className="hero-slogan');
    expect(globalStyles).toContain(
      'font-size: clamp(4rem, 8vw, 6.5rem);',
    );
    expect(globalStyles).toContain('display: inline-flex;');
    expect(globalStyles).toContain('align-items: center;');
    expect(globalStyles).toContain(
      'font-size: clamp(1.5rem, 2.4vw, 2rem);',
    );
  });

  it('keeps hero content visible when mount animations are paused', () => {
    expect(homepageSource).not.toContain(
      'initial={{ opacity: 0, y: 24 }}',
    );
    expect(homepageSource).not.toContain(
      'initial={{ opacity: 0, scale: 0.94 }}',
    );
  });

  it('uses the uploaded field illustration as the homepage background', () => {
    expect(globalStyles).toContain(
      'url("/brand/xiangye-field-cover.png")',
    );
    expect(globalStyles).toContain('background-size: cover;');
  });

  it('moves the growth visual to the second screen with six dimensions', () => {
    const heroEnd = homepageSource.indexOf(
      '<section className="story-section story-section--cream">',
    );
    const growthMap = homepageSource.indexOf(
      'className="growth-map growth-map--dimensions"',
    );

    expect(growthMap).toBeGreaterThan(heroEnd);
    expect(homepageSource).toContain('growth-bloom__emergence');
    expect(homepageSource).toContain('growth-bloom__trail');
    expect(homepageSource).toContain('growth-bloom__node');
    expect(homepageSource).toContain('心理能量');
    expect(homepageSource).toContain('能力倾向');
    expect(homepageSource).toContain('兴趣类型');
    expect(homepageSource).toContain('核心驱动力');
    expect(homepageSource).toContain('认知风格');
    expect(homepageSource).toContain('发展准备度');
    expect(homepageSource).not.toContain('feature-visual--dimensions');
    expect(globalStyles).toContain('@keyframes trait-emerge');
    expect(globalStyles).toContain('@keyframes trait-float');
    expect(globalStyles).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
  });

  it('removes the disconnected homepage journey strip', () => {
    expect(homepageSource).not.toContain('journeySteps');
    expect(homepageSource).not.toContain('journey-strip-section');
    expect(globalStyles).not.toContain('.journey-strip-section');
    expect(globalStyles).not.toContain('.journey-step');
  });

  it('keeps stage selection off the homepage and on the start page', () => {
    expect(homepageSource).not.toContain('选择教育阶段');
    expect(homepageSource).not.toContain('levelOrder');
    expect(startSource).toContain('选择教育阶段');
    expect(startSource).toContain("const levelOrder: Level[] = ['L1', 'L2', 'L3', 'L4']");
  });

  it('presents each approved product feature as its own section', () => {
    expect(homepageSource).toContain('从多个角度，看见成长线索');
    expect(homepageSource).toContain('不同阶段，不同探索方式');
    expect(homepageSource).toContain('结果是线索，不是标签');
    expect(homepageSource).toContain('隐私优先，由你决定');
  });
});
