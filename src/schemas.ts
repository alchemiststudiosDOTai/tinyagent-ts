import { z } from "zod";

export const ToolCallSchema = z.object({
  tool: z.string().min(1),
  args: z.record(z.any()),
}).strict();

// All assistant replies must be well‑formed tool calls. Direct answers must be
// returned via the `final_answer` tool rather than a standalone `answer` field.
export const AssistantReplySchema = ToolCallSchema;
