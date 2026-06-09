import { z } from "zod";

export const levels = ["L1", "L2", "L3", "L4"] as const;
export const questionTypes = [
  "single",
  "likert",
  "ranking",
  "forcedChoice",
] as const;

export type Level = (typeof levels)[number];
export type QuestionType = (typeof questionTypes)[number];

const scoreKeyPattern =
  /^(energy|intelligence|riasec|drive|jung|readiness)\.[A-Za-z0-9_-]+$/;

export const scoreTargetSchema = z.object({
  key: z.string().regex(scoreKeyPattern),
  value: z.number(),
});

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  scores: z.array(scoreTargetSchema),
});

export const questionSchema = z
  .object({
    id: z.string().regex(/^L[1-4]-(ENERGY|ABILITY|RIASEC|DRIVE|JUNG|READY)-\d{3}$/),
    level: z.enum(levels),
    number: z.number().int().positive(),
    type: z.enum(questionTypes),
    prompt: z.string().min(1),
    options: z.array(questionOptionSchema),
    likertScores: z.array(scoreTargetSchema).optional(),
    reverse: z.boolean().optional(),
    sourceMarkdown: z.string().min(1),
  })
  .superRefine((question, context) => {
    const optionIds = question.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({
        code: "custom",
        message: "Option IDs must be unique",
        path: ["options"],
      });
    }
  });

export type ScoreTarget = z.infer<typeof scoreTargetSchema>;
export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type Question = z.infer<typeof questionSchema>;

export type AnswerValue =
  | { kind: "single"; optionId: string }
  | { kind: "likert"; value: 1 | 2 | 3 | 4 | 5 }
  | { kind: "ranking"; optionIds: string[] }
  | {
      kind: "forcedChoice";
      mostOptionId: string;
      leastOptionId?: string;
    };

export interface Answer {
  questionId: string;
  value: AnswerValue;
}
