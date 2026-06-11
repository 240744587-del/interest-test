import type { ScoreResult } from "@/lib/questions/types";
import type {
  ReportAPIResponse,
  ReportStatus,
} from "@/lib/report/types";

export type ResultAction =
  | { type: "set"; result: ScoreResult }
  | { type: "clear" };

export function resultReducer(
  state: ScoreResult | null,
  action: ResultAction,
): ScoreResult | null {
  if (action.type === "set") {
    return action.result;
  }

  return null;
}

export function canShowDetailedCharts(result: ScoreResult): boolean {
  return !result.consistencyFlags.includes("low-evidence");
}

export function canRequestAIReport(result: ScoreResult): boolean {
  return !result.consistencyFlags.includes("low-evidence");
}

export function resolveReportStatus(response: ReportAPIResponse): ReportStatus {
  if (response.ok && response.report && !response.fallback) {
    return { kind: "done", report: response.report };
  }
  if (response.ok && response.fallback) {
    return {
      kind: "fallback",
      message: "AI 暂时不可用，当前继续显示本地基础报告",
    };
  }
  return { kind: "error", message: response.error || "生成失败" };
}
