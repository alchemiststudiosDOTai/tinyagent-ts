import { z } from "zod";

export const ToolCallSchema = z.object({
  tool: z.string().min(1),
  args: z.record(z.any()),
}).strict();

export const DirectAnswerSchema = z.object({
  answer: z.string().min(1),
}).strict();

export const AssistantReplySchema = z.union([ToolCallSchema, DirectAnswerSchema]);