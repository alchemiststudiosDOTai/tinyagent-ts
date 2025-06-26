import { z } from 'zod';

/**
 * Format a Zod schema for LLM prompt inclusion
 */
export function formatZodSchemaForPrompt(schema: z.ZodSchema<any>): string {
  try {
    // Handle different Zod schema types
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape as Record<string, z.ZodTypeAny>;
      const params: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const paramInfo = formatZodTypeForPrompt(key, value);
        if (paramInfo) {
          params.push(paramInfo);
        }
      }

      return params.length > 0 ? `{${params.join(', ')}}` : '{}';
    }

    // For non-object schemas, just indicate the type
    return formatZodTypeForPrompt('input', schema) || 'any';
  } catch (error) {
    // Fallback if schema parsing fails
    return 'object';
  }
}

/**
 * Format a single Zod type for prompt inclusion
 */
function formatZodTypeForPrompt(
  key: string,
  zodType: z.ZodTypeAny
): string | null {
  try {
    // Handle optional/nullable types
    let isOptional = false;
    let innerType = zodType;

    if (zodType instanceof z.ZodOptional) {
      isOptional = true;
      innerType = zodType.unwrap();
    }

    if (zodType instanceof z.ZodNullable) {
      isOptional = true;
      innerType = zodType.unwrap();
    }

    if (zodType instanceof z.ZodDefault) {
      isOptional = true;
      innerType = zodType.removeDefault();
    }

    // Get the basic type
    let typeStr = getZodTypeName(innerType);

    // Add description if available
    const description = (zodType as any)._def?.description;
    if (description) {
      typeStr += ` // ${description}`;
    }

    // Handle optional parameters
    const optionalMarker = isOptional ? '?' : '';

    return `"${key}"${optionalMarker}: ${typeStr}`;
  } catch (error) {
    // Fallback for any parsing errors
    return `"${key}": any`;
  }
}

/**
 * Get a human-readable type name from a Zod type
 */
function getZodTypeName(zodType: z.ZodTypeAny): string {
  const typeName = (zodType as any)._def?.typeName;

  switch (typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodNumber':
      return 'number';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodArray': {
      const elementType = getZodTypeName((zodType as z.ZodArray<any>).element);
      return `${elementType}[]`;
    }
    case 'ZodEnum': {
      const values = (zodType as any)._def.values;
      return `"${values.join('" | "')}"`;
    }
    case 'ZodLiteral': {
      const value = (zodType as any)._def.value;
      return typeof value === 'string' ? `"${value}"` : String(value);
    }
    case 'ZodObject':
      return 'object';
    case 'ZodUnion': {
      const options = (zodType as any)._def.options;
      return options.map((opt: any) => getZodTypeName(opt)).join(' | ');
    }
    default:
      return 'any';
  }
}

/**
 * Extract example values from Zod schema for demonstration
 */
export function extractZodSchemaExamples(
  schema: z.ZodSchema<any>
): Record<string, any> {
  try {
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape as Record<string, z.ZodTypeAny>;
      const examples: Record<string, any> = {};

      for (const [key, value] of Object.entries(shape)) {
        const example = getZodTypeExample(value);
        if (example !== undefined) {
          examples[key] = example;
        }
      }

      return examples;
    }

    return {};
  } catch (error) {
    return {};
  }
}

/**
 * Generate example value for a Zod type
 */
function getZodTypeExample(zodType: z.ZodTypeAny): any {
  try {
    // Handle wrapped types
    let innerType = zodType;

    if (zodType instanceof z.ZodOptional) {
      innerType = zodType.unwrap();
    }

    if (zodType instanceof z.ZodNullable) {
      innerType = zodType.unwrap();
    }

    if (zodType instanceof z.ZodDefault) {
      return (zodType as any)._def.defaultValue();
    }

    const typeName = (innerType as any)._def?.typeName;

    switch (typeName) {
      case 'ZodString':
        return 'example_string';
      case 'ZodNumber':
        return 42;
      case 'ZodBoolean':
        return true;
      case 'ZodArray': {
        const elementExample = getZodTypeExample(
          (innerType as z.ZodArray<any>).element
        );
        return [elementExample];
      }
      case 'ZodEnum': {
        const values = (innerType as any)._def.values;
        return values[0];
      }
      case 'ZodLiteral':
        return (innerType as any)._def.value;
      case 'ZodObject':
        return extractZodSchemaExamples(innerType);
      default:
        return undefined;
    }
  } catch (error) {
    return undefined;
  }
}
