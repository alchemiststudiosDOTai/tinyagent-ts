import { ZodSchema } from 'zod';

/**
 * Compile a reusable validator function from a Zod schema.
 * Throws a formatted error message on validation failure.
 */
export function compileValidator<T>(schema: ZodSchema<T>) {
  return (input: unknown): T => {
    const result = schema.safeParse(input);
    if (result.success) return result.data;
    const msg = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    throw new Error(msg);
  };
}
