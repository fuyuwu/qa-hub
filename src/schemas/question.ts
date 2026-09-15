import { z } from "zod";

export const difficultyEnum = z.enum(["easy", "medium", "hard"]);
export const reviewStatusEnum = z.enum(["new", "reviewing", "mastered"]);

const baseQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
  difficulty: difficultyEnum,
  source: z.string().url().optional(),
  followUp: z.string().optional(),
  reviewStatus: reviewStatusEnum,
  practiceCount: z.number().int().min(0),
  tags: z.array(z.string().min(1)),
});

export const createQuestionSchema = baseQuestionSchema.extend({
  difficulty: difficultyEnum.default("medium"),
  reviewStatus: reviewStatusEnum.default("new"),
  practiceCount: z.number().int().min(0).default(0),
  tags: z.array(z.string().min(1)).default([]),
});

// No defaults here: an omitted field must mean "leave unchanged", not "reset to default".
export const updateQuestionSchema = baseQuestionSchema.partial();

export const listQuestionsQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: difficultyEnum.optional(),
  reviewStatus: reviewStatusEnum.optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
