import { z } from 'zod';

/**
 * Schema for validating final answer structure
 */
export const FinalAnswerSchema = z.object({
  answer: z.unknown().refine((val) => val !== undefined && val !== null, {
    message: 'Answer cannot be undefined or null',
  }),
});

export type FinalAnswer = z.infer<typeof FinalAnswerSchema>;

/**
 * Validate and cast a raw final answer through the schema
 */
export function validateFinalAnswer(rawAnswer: unknown): FinalAnswer {
  try {
    return FinalAnswerSchema.parse(rawAnswer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid final answer structure: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw error;
  }
}
