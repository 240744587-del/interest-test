// ============================================================
// POST /api/report — AI 智能报告生成 (DeepSeek)
// 对齐 product-spec-v2.md §7.2-7.4, §8.3, §9.3
// ============================================================

import OpenAI from 'openai';
import { buildSystemPrompt, buildUserMessage } from '@/lib/report/prompt';
import { generateTemplateReport } from '@/lib/report/template';
import {
  MAX_REPORT_BODY_BYTES,
  createRateLimiter,
  isAllowedOrigin,
  parseReportRequest,
} from '@/lib/report/request';
import {
  parseAIReport,
  shouldForceTemplateReport,
} from '@/lib/report/response';

const TIMEOUT_MS = 60_000;
const reportLimiter = createRateLimiter({
  limit: 5,
  windowMs: 10 * 60_000,
});

function getClientKey(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return Response.json({ ok: false, error: '不允许的请求来源' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return Response.json({ ok: false, error: '请求格式不正确' }, { status: 415 });
    }

    const contentLength = Number(request.headers.get('content-length'));
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_REPORT_BODY_BYTES
    ) {
      return Response.json({ ok: false, error: '请求内容过大' }, { status: 413 });
    }

    if (!reportLimiter.consume(getClientKey(request))) {
      return Response.json(
        { ok: false, error: '请求过于频繁，请稍后再试' },
        { status: 429, headers: { 'Retry-After': '600' } },
      );
    }

    const body = parseReportRequest(await request.text());
    const { level, summary } = body;

    if (shouldForceTemplateReport(summary)) {
      const report = generateTemplateReport(level, summary);
      return Response.json({ ok: true, report, fallback: true });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === 'your-deepseek-api-key-here') {
      console.info('[report] No DeepSeek API key, using template fallback');
      const report = generateTemplateReport(level, summary);
      return Response.json({ ok: true, report, fallback: true });
    }

    const client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    });

    const systemPrompt = buildSystemPrompt(level);
    const userMessage = buildUserMessage(level, summary);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const completion = await client.chat.completions.create(
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 4096,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('AI 返回内容为空');

      const report = parseAIReport(text, level);

      console.info('[report] AI report generated successfully');
      return Response.json({ ok: true, report, fallback: false });
    } catch (aiError) {
      clearTimeout(timeout);
      const errorType =
        aiError instanceof Error
          ? aiError.name === 'AbortError' ? 'timeout' : 'api_error'
          : 'unknown';
      console.warn(`[report] AI failed (${errorType}), using template fallback`);
      const report = generateTemplateReport(level, summary);
      return Response.json({ ok: true, report, fallback: true });
    }
  } catch (outerError) {
    const message =
      outerError instanceof Error ? outerError.message : '报告生成失败，请重试';
    const status =
      message === '请求内容过大'
        ? 413
        : message === '无效的请求参数' || message === '教育阶段不一致'
          ? 400
          : 500;
    if (status === 500) {
      console.error('[report] Request failed:', message);
    }
    return Response.json(
      { ok: false, error: status === 500 ? '报告生成失败，请重试' : message },
      { status },
    );
  }
}
