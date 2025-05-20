import {
  ActionStep,
  CodeAction,
  JsonAction,
  ObservationStep,
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

  toMessages(systemPrompt: string): LLMMessage[] {
    const msgs: LLMMessage[] = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    if (this.task) msgs.push({ role: 'user', content: this.task });
    for (const step of this.steps) {
      switch (step.type) {
        case 'thought':
          msgs.push({ role: 'assistant', content: `Thought: ${step.text}` });
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
      }
    }
    return msgs;
  }
}

export function parseThoughtAction(text: string): {
  thought: string;
  action: ActionStep;
} {
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
        return { thought, action };
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
        return { thought, action };
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
    return { thought, action };
  }

  // Final fallback: treat as code
  const action: CodeAction = { type: 'action', mode: 'code', code: trimmed };
  return { thought, action };
}
