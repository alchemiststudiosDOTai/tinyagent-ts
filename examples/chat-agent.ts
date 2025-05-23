import { model } from '../src/decorators';
import { MultiStepAgent, MultiStepOptions } from '../src/multiStepAgent';

export interface ChatAgentOptions extends MultiStepOptions {
  model?: string;
}

@model('openai/gpt-4o-mini')
export class ChatAgent extends MultiStepAgent<string> {
  private readonly chosenModel: string;

  constructor(options: ChatAgentOptions = {}) {
    const { model, systemPrompt, systemPromptFile, ...rest } = options;
    super({ systemPrompt, systemPromptFile, ...rest });
    this.chosenModel = model ?? super.getModelName();
    if (systemPrompt) {
      this.promptEngine.overwrite('agent', () => systemPrompt);
    } else if (!systemPromptFile) {
      this.promptEngine.overwrite('agent', () => 'You are a helpful assistant.');
    }
  }

  protected getModelName(): string {
    return this.chosenModel;
  }

  async run(input: string, opts: Partial<MultiStepOptions> = {}): Promise<string> {
    const result = await super.run(input, opts);
    return result.answer;
  }
}