// src/final-answer.tool.ts
// Simple “always-run” tool that returns whatever answer it is given.

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

export type FinalAnswerInput = unknown;
export type FinalAnswerOutput = unknown;

/**
 * Always provide the agent’s final answer verbatim.
 */
export class FinalAnswerTool implements Tool<FinalAnswerInput, FinalAnswerOutput> {
  readonly name = 'final_answer';
  readonly description = "Provides the definitive answer to the user’s question.";

  forward(answer: FinalAnswerInput): FinalAnswerOutput {
    return answer;
  }
}
