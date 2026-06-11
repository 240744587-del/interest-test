import { z } from "zod";
import type { Level, ScoreResult } from "@/lib/questions/types";
import type { AIReport } from "./types";

const reportSection = z.string().min(10).max(2000);
const reportSchema = z
  .object({
    overview: reportSection,
    interestInterpretation: reportSection,
    abilityInterpretation: reportSection,
    cognitiveInterpretation: reportSection,
    driveInterpretation: reportSection,
    explorationSuggestions: reportSection,
    actionSteps: reportSection,
    guardianNote: reportSection.optional(),
  })
  .strict();

export function parseAIReport(text: string, level: Level): AIReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI 返回结构无效");
  }

  const result = reportSchema.safeParse(parsed);
  if (!result.success || (level !== "L4" && !result.data.guardianNote)) {
    throw new Error("AI 返回结构无效");
  }

  return result.data;
}

export function shouldForceTemplateReport(summary: ScoreResult): boolean {
  return summary.consistencyFlags.includes("low-evidence");
}
