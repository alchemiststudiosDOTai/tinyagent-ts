import type {
  ActionStep,
  CodeAction,
  JsonAction,
  ObservationStep,
  ReflexionStep,
  ScratchStep,
  ThoughtStep,
} from './steps';
import { LLMMessage } from '../agent';

export class Scratchpad {
  private task: string = '';
  private steps: ScratchStep[] = [];

  setTask(text: string): void {
    this.task = text;
  }

  clear(): void {
    this.steps = [];
    this.task = '';
  }

  addThought(text: string): void {
    this.steps.push({ type: 'thought', text } as ThoughtStep);
  }

  addAction(action: ActionStep): void {
    this.steps.push(action);
  }

  addObservation(text: string): void {
    this.steps.push({ type: 'observation', text } as ObservationStep);
  }

  addToolResult(tool: string, output: string): void {
    this.steps.push({ type: 'tool_result', tool, output });
  }

  addReflexion(text: string): void {
    this.steps.push({ type: 'reflexion', text } as ReflexionStep);
  }

  getLastObservation(): string | undefined {
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const s = this.steps[i];
      if (s.type === 'observation') return s.text;
    }
    return undefined;
  }

  /**
   * Get all steps in the scratchpad
   * @returns Array of all steps
   */
  getSteps(): ScratchStep[] {
    return [...this.steps];
  }

  /**
   * Get the most recent output/result for a given tool name.
   */
  getLastToolResult(toolName: string): string | undefined {
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const s = this.steps[i];
      if (s.type === 'tool_result' && s.tool === toolName) {
        return s.output;
      }
      // Some flows use 'observation' steps with JSON stringified output
      if (s.type === 'observation') {
        try {
          const parsed = JSON.parse(s.text);
          if (
            parsed &&
            parsed.tool === toolName &&
            typeof parsed.output === 'string'
          ) {
            return parsed.output;
          }
        } catch {}
      }
    }
    return undefined;
  }

  /**
   * Get the last argument value used for a specific key in any tool call.
   */
  getLastArgValue(argKey: string): any {
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const s = this.steps[i];
      if (
        s.type === 'action' &&
        s.mode === 'json' &&
        s.args &&
        argKey in s.args
      ) {
        return s.args[argKey];
      }
    }
    return undefined;
  }

  toMessages(systemPrompt: string): LLMMessage[] {
    const msgs: LLMMessage[] = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    if (this.task) msgs.push({ role: 'user', content: this.task });
    for (const step of this.steps) {
      switch (step.type) {
        case 'thought':
          msgs.push({ role: 'assistant', content: `Thought: ${step.text}` });
          break;
        case 'reflexion':
          msgs.push({ role: 'assistant', content: `Reflexion: ${step.text}` });
          break;
        case 'action':
          if (step.mode === 'code') {
            msgs.push({
              role: 'assistant',
              content: `Action:\n\`\`\`ts\n${step.code}\n\`\`\``,
            });
          } else {
            const json = JSON.stringify({ tool: step.tool, args: step.args });
            msgs.push({ role: 'assistant', content: `Action: ${json}` });
          }
          break;
        case 'observation':
          msgs.push({
            role: 'assistant',
            content: `Observation: ${step.text}`,
          });
          break;
        case 'tool_result':
          msgs.push({
            role: 'assistant',
            content: `Observation: ${step.output}`,
          });
          break;
      }
    }
    return msgs;
  }
}

export function parseThoughtAction(text: string): {
  thought?: string;
  action?: ActionStep;
  reflexion?: string;
} {
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
        const action: JsonAction = {
          type: 'action',
          mode: 'json',
          tool: parsed.tool,
          args: parsed.args,
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
        const action: JsonAction = {
          type: 'action',
          mode: 'json',
          tool: parsed.tool,
          args: parsed.args,
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
    const action: CodeAction = { type: 'action', mode: 'code', code };
    return { thought, action, reflexion };
  }

  // Final fallback: treat as code
  if (trimmed) {
    const action: CodeAction = { type: 'action', mode: 'code', code: trimmed };
    return { thought, action, reflexion };
  }

  return { thought, reflexion };
}
