import type { ScoreResult } from "@/lib/questions/types";

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
