// src/decorators.ts
import 'reflect-metadata';
import { z, ZodSchema } from 'zod';

/**
 * Defines symbols used as keys for storing metadata via `reflect-metadata`.
 */
export const META_KEYS = {
  /** Symbol for storing the model name metadata on an agent class. */
  MODEL: Symbol('model'),
  /** Symbol for storing the list of tool metadata on an agent class. */
  TOOLS: Symbol('tools'),
};

/**
 * Class decorator to associate an LLM model name with an agent class.
 * This name is used by the agent to make API calls to the specified model.
 *
 * @param name - The identifier of the LLM model (e.g., "qwen/qwen2-72b-instruct").
 * @returns A class decorator function.
 * @example
 * ```typescript
 * @model("qwen/qwen2-72b-instruct")
 * class MyAgent extends Agent {}
 * ```
 */
export function model(name: string): ClassDecorator {
  return (target) => Reflect.defineMetadata(META_KEYS.MODEL, name, target);
}

/**
 * Interface defining the structure for metadata associated with a tool.
 * This metadata is used by the agent to understand and execute the tool.
 */
export interface ToolMetadata {
  /** The name of the tool, typically derived from the method name. */
  name: string;
  /** A human-readable description of what the tool does. */
  description: string;
  /** The name of the class method that implements the tool's logic. */
  method: string;
  /** A Zod schema defining the expected parameters for the tool. */
  schema: ZodSchema<any>;
}

/**
 * Property decorator to define a class method as an agent tool.
 * It stores metadata about the tool, including its description and parameter schema.
 *
 * @param description - A human-readable description of the tool's purpose.
 * @param paramSchema - A Zod schema for validating the tool's input parameters. Defaults to an empty object schema.
 * @returns A property decorator function.
 * @example
 * ```typescript
 * class MyAgent extends Agent {
 *   @tool('Adds two numbers', z.object({ a: z.number(), b: z.number() }))
 *   add({ a, b }: { a: number; b: number }): string {
 *     return String(a + b);
 *   }
 * }
 * ```
 */
/**
 * Creates a tool decorator function that works with both legacy and standard decorators.
 */
export function tool(
  description: string,
  paramSchema: ZodSchema<any> = z.object({})
) {
  // This function is designed to handle both legacy and standard decorator usage
  return function decoratorFunction(
    targetOrClassMethod: any,
    contextOrPropertyKey?: any
  ): any {
    // Standard decorators (TypeScript 5+) pass a decorator context object as the second parameter
    if (
      contextOrPropertyKey &&
      typeof contextOrPropertyKey === 'object' &&
      contextOrPropertyKey.kind === 'method'
    ) {
      // This is the new decorators format
      const { name, addInitializer } = contextOrPropertyKey;

      // Add an initializer that will run when the class is instantiated
      if (addInitializer) {
        addInitializer(function (this: any) {
          // 'this' refers to the class instance
          const constructor = this.constructor;

          // Store metadata on the class constructor
          const list: ToolMetadata[] =
            Reflect.getMetadata(META_KEYS.TOOLS, constructor) || [];

          // Check if this tool is already registered to avoid duplicates
          if (!list.some((tool) => tool.name === String(name))) {
            list.push({
              name: String(name),
              description,
              method: String(name),
              schema: paramSchema,
            });
            Reflect.defineMetadata(META_KEYS.TOOLS, list, constructor);
          }
        });
      }

      // Fallback for older TypeScript versions that don't support addInitializer
      const target = targetOrClassMethod;
      const constructor = target.constructor;

      // Also register directly on the constructor as a fallback
      const directList: ToolMetadata[] =
        Reflect.getMetadata(META_KEYS.TOOLS, constructor) || [];
      if (!directList.some((tool) => tool.name === String(name))) {
        directList.push({
          name: String(name),
          description,
          method: String(name),
          schema: paramSchema,
        });
        Reflect.defineMetadata(META_KEYS.TOOLS, directList, constructor);
      }

      // Return the original method (no replacement)
      return targetOrClassMethod;
    }
    // Legacy decorators (TypeScript with experimentalDecorators flag)
    else {
      const target = targetOrClassMethod;
      const propertyKey = contextOrPropertyKey;

      const list: ToolMetadata[] =
        Reflect.getMetadata(META_KEYS.TOOLS, target.constructor) || [];
      list.push({
        name: String(propertyKey),
        description,
        method: String(propertyKey),
        schema: paramSchema,
      });
      Reflect.defineMetadata(META_KEYS.TOOLS, list, target.constructor);
    }
  };
}
