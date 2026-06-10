// ============================================================
// POST /api/report — AI 智能报告生成 (DeepSeek)
// 对齐 product-spec-v2.md §7.2-7.4, §8.3, §9.3
// ============================================================

import OpenAI from 'openai';
import { buildSystemPrompt, buildUserMessage } from '@/lib/report/prompt';
import { generateTemplateReport } from '@/lib/report/template';
import type { AIReport } from '@/lib/report/types';
import type { ReportRequest } from '@/lib/questions/types';

const TIMEOUT_MS = 60_000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReportRequest;
    const { level, summary } = body;

    if (
      !level ||
      !summary ||
      !['L1', 'L2', 'L3', 'L4'].includes(level) ||
      !Array.isArray(summary.dimensions) ||
      typeof summary.riasec?.code !== 'string' ||
      typeof summary.jung?.EI !== 'number'
    ) {
      return Response.json({ ok: false, error: '无效的请求参数' }, { status: 400 });
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

      const report = JSON.parse(text) as AIReport;

      const requiredFields: (keyof AIReport)[] = [
        'overview',
        'interestInterpretation',
        'abilityInterpretation',
        'cognitiveInterpretation',
        'driveInterpretation',
        'explorationSuggestions',
        'actionSteps',
      ];

      for (const field of requiredFields) {
        if (typeof report[field] !== 'string' || report[field]!.length < 10) {
          throw new Error(`AI 报告字段 ${field} 无效`);
        }
      }

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
    console.error('[report] Request failed:', outerError instanceof Error ? outerError.message : 'unknown');
    return Response.json({ ok: false, error: '报告生成失败，请重试' }, { status: 500 });
  }
}
