import { ReActState, ReActStep, ActionStep } from './types';
import { LLMMessage } from '../model';

/**
 * Implementation of ReAct state management
 */
export class ReActStateManager implements ReActState {
  private task: string = '';
  private steps: ReActStep[] = [];

  setTask(text: string): void {
    this.task = text;
  }

  getTask(): string {
    return this.task;
  }

  clear(): void {
    this.steps = [];
    this.task = '';
  }

  addThought(text: string): void {
    this.steps.push({
      type: 'thought',
      text,
      timestamp: new Date(),
    });
  }

  addAction(action: ActionStep): void {
    this.steps.push({
      ...action,
      timestamp: new Date(),
    });
  }

  addObservation(text: string): void {
    this.steps.push({
      type: 'observation',
      text,
      timestamp: new Date(),
    });
  }

  addReflexion(text: string): void {
    this.steps.push({
      type: 'reflexion',
      text,
      timestamp: new Date(),
    });
  }

  getSteps(): ReActStep[] {
    return [...this.steps];
  }

  /**
   * Get the last argument value used for a specific key in any tool call.
   */
  getLastArgValue(argKey: string): unknown {
    for (let i = this.steps.length - 1; i >= 0; i--) {
      const step = this.steps[i];
      if (
        step.type === 'action' &&
        (step as ActionStep).mode === 'json' &&
        (step as ActionStep).args &&
        argKey in (step as ActionStep).args!
      ) {
        return (step as ActionStep).args![argKey];
      }
    }
    return undefined;
  }

  /**
   * Convert state to LLM messages format
   */
  toMessages(systemPrompt: string): LLMMessage[] {
    const msgs: LLMMessage[] = [];

    if (systemPrompt) {
      msgs.push({ role: 'system', content: systemPrompt });
    }

    if (this.task) {
      msgs.push({ role: 'user', content: this.task });
    }

    for (const step of this.steps) {
      switch (step.type) {
        case 'thought':
          msgs.push({ role: 'assistant', content: `Thought: ${step.text}` });
          break;
        case 'reflexion':
          msgs.push({ role: 'assistant', content: `Reflexion: ${step.text}` });
          break;
        case 'action':
          const actionStep = step as ActionStep;
          if (actionStep.mode === 'code') {
            msgs.push({
              role: 'assistant',
              content: `Action:\n\`\`\`ts\n${actionStep.text}\n\`\`\``,
            });
          } else {
            const json = JSON.stringify({
              tool: actionStep.tool,
              args: actionStep.args,
            });
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
