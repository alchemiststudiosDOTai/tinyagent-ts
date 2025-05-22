// src/final-answer.tool.ts
// Simple “always-run” tool that returns whatever answer it is given.
import { z } from 'zod';

export interface Tool<I = unknown, O = unknown> {
  /** A human-readable name used when the agent calls this tool. */
  readonly name: string;
  /** A short description surfaced to the LLM. */
  readonly description: string;
  /** Strongly-typed runtime validation of the input payload (if you need it). */
  validate?(input: I): void;
  /** Core execution logic. */
  forward(input: I): O | Promise<O>;
}

// Explicit args type for the built-in final_answer tool
export type FinalAnswerArgs = { answer: string };
export type FinalAnswerOutput = FinalAnswerArgs;

export const FinalAnswerSchema = z.object({ answer: z.string() });

/**
 * Always provide the agent’s final answer verbatim.
 */
export class FinalAnswerTool
  implements Tool<FinalAnswerArgs, FinalAnswerOutput>
{
  readonly name = 'final_answer';
  readonly description =
    'Provides the definitive answer to the user’s question.';
  readonly schema = FinalAnswerSchema;

  forward(answer: FinalAnswerArgs): FinalAnswerOutput {
    const parsed = FinalAnswerSchema.parse(answer);
    return parsed;
  }
}
