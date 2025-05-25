import { ParsedReActResponse, ActionStep } from './types';

/**
 * Parse a ReAct response text into structured components
 */
export function parseReActResponse(text: string): ParsedReActResponse {
  const reflexMatch = text.match(
    /Reflect(?:ion|xion)?:([\s\S]*?)(?=\n(?:Thought|Action):|$)/i
  );
  const reflexion = reflexMatch ? reflexMatch[1].trim() : undefined;

  const thoughtMatch = text.match(/Thought:(.*?)(?:\nAction:|$)/s);
  const thought = thoughtMatch ? thoughtMatch[1].trim() : '';
  const actionPart = text.split(/\nAction:/s)[1] ?? '';
  const trimmed = actionPart.trim();

  // First, try to parse as JSON directly
  try {
    // Check if the trimmed text is a JSON object
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.tool === 'string' && typeof parsed.args === 'object') {
        const action: ActionStep = {
          type: 'action',
          mode: 'json',
          tool: parsed.tool,
          args: parsed.args,
          text: trimmed,
        };
        return { thought, action, reflexion };
      }
    }
  } catch {
    // If JSON parsing fails, continue to other formats
  }

  // Try to extract JSON from the text (may be embedded in other text)
  const jsonMatch = trimmed.match(/{\s*"tool"\s*:\s*"([^"]+)".*}/);
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed.tool === 'string' && typeof parsed.args === 'object') {
        const action: ActionStep = {
          type: 'action',
          mode: 'json',
          tool: parsed.tool,
          args: parsed.args,
          text: jsonStr,
        };
        return { thought, action, reflexion };
      }
    } catch {
      // If JSON parsing fails, continue to other formats
    }
  }

  // Check for code blocks
  if (trimmed.startsWith('```')) {
    const codeMatch = trimmed.match(/```(?:\w+)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : trimmed;
    const action: ActionStep = { 
      type: 'action', 
      mode: 'code', 
      tool: 'code',
      text: code 
    };
    return { thought, action, reflexion };
  }

  // Final fallback: treat as code
  if (trimmed) {
    const action: ActionStep = { 
      type: 'action', 
      mode: 'code', 
      tool: 'code',
      text: trimmed 
    };
    return { thought, action, reflexion };
  }

  return { thought, reflexion };
}

/**
 * Extract tool name and arguments from action text
 */
export function parseToolCall(actionText: string): { tool: string; args: Record<string, unknown> } | null {
  try {
    // Try to parse as JSON
    if (actionText.startsWith('{') && actionText.endsWith('}')) {
      const parsed = JSON.parse(actionText);
      if (typeof parsed.tool === 'string' && typeof parsed.args === 'object') {
        return { tool: parsed.tool, args: parsed.args };
      }
    }

    // Try to extract JSON from text
    const jsonMatch = actionText.match(/{\s*"tool"\s*:\s*"([^"]+)".*}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.tool === 'string' && typeof parsed.args === 'object') {
        return { tool: parsed.tool, args: parsed.args };
      }
    }
  } catch {
    // Parsing failed
  }

  return null;
} 