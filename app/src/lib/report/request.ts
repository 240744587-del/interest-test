import { z } from "zod";
import type { ReportRequest } from "@/lib/questions/types";

export const MAX_REPORT_BODY_BYTES = 32 * 1024;

const boundedScore = z.number().finite().min(0).max(100);
const scoreKey = z
  .string()
  .regex(/^(energy|intelligence|riasec|drive|jung|readiness)\.[A-Za-z0-9_-]+$/);

const reportRequestSchema = z
  .object({
    level: z.enum(["L1", "L2", "L3", "L4"]),
    summary: z
      .object({
        level: z.enum(["L1", "L2", "L3", "L4"]),
        dimensions: z
          .array(
            z
              .object({
                key: z.enum([
                  "energy",
                  "intelligence",
                  "riasec",
                  "drive",
                  "cognitive",
                  "readiness",
                ]),
                label: z.string().max(80),
                subScores: z
                  .array(
                    z
                      .object({
                        key: scoreKey,
                        label: z.string().max(80),
                        score: boundedScore,
                      })
                      .strict(),
                  )
                  .max(100),
              })
              .strict(),
          )
          .max(6),
        jung: z
          .object({
            EI: boundedScore,
            SN: boundedScore,
            TF: boundedScore,
            JP: boundedScore,
          })
          .strict(),
        riasec: z
          .object({
            scores: z
              .object({
                R: boundedScore,
                I: boundedScore,
                A: boundedScore,
                S: boundedScore,
                E: boundedScore,
                C: boundedScore,
              })
              .strict(),
            code: z.string().regex(/^(?:[RIASEC]{3})?$/),
            consistency: z.enum(["high", "medium", "low"]),
            differentiation: z.enum(["high", "medium", "low"]),
            clarity: z.enum(["high", "medium", "low"]),
          })
          .strict(),
        readiness: z
          .object({
            overall: boundedScore,
            subScores: z.record(scoreKey, boundedScore),
          })
          .strict()
          .optional(),
        consistencyFlags: z.array(z.literal("low-evidence")).max(1),
        candidateFields: z.array(z.string().max(80)).max(20),
      })
      .strict(),
  })
  .strict()
  .refine(({ level, summary }) => level === summary.level, {
    message: "教育阶段不一致",
  });

export function parseReportRequest(body: string): ReportRequest {
  if (Buffer.byteLength(body, "utf8") > MAX_REPORT_BODY_BYTES) {
    throw new Error("请求内容过大");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("无效的请求参数");
  }

  const result = reportRequestSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("无效的请求参数");
  }

  return result.data;
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin === null) return true;

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const protocol = forwardedProto || requestUrl.protocol.replace(":", "");

  return origin === `${protocol}://${host}`;
}

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions) {
  const entries = new Map<string, { count: number; resetAt: number }>();

  return {
    consume(key: string): boolean {
      const currentTime = now();
      const current = entries.get(key);
      if (!current || current.resetAt <= currentTime) {
        entries.set(key, { count: 1, resetAt: currentTime + windowMs });
        return true;
      }
      if (current.count >= limit) return false;
      current.count += 1;
      return true;
    },
  };
}
