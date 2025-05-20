import { Agent, LLMMessage } from './agent';
import { FinalAnswerTool } from './final-answer.tool';
import { Scratchpad, parseThoughtAction } from './utils/scratchpad';
import { ActionStep } from './utils/steps';

export interface MultiStepOptions {
  maxSteps?: number;
  trace?: boolean;
  onStep?: (pad: Scratchpad) => void;
  systemPrompt?: string;
  systemPromptFile?: string;
}

export class MultiStepAgent<I = string, O = string> extends Agent<I, O> {
  private scratchpad = new Scratchpad();
  private maxSteps: number;
  private trace: boolean;
  private onStep?: (pad: Scratchpad) => void;

  constructor(options: MultiStepOptions = {}) {
    const {
      maxSteps = 5,
      trace = false,
      onStep,
      systemPrompt,
      systemPromptFile,
    } = options;
    super({ systemPrompt, systemPromptFile });
    this.maxSteps = maxSteps;
    this.trace = trace;
    this.onStep = onStep;
  }

  private log(t?: string, a?: ActionStep, o?: string) {
    if (!this.trace) return;
    const parts = [
      t && `T: ${t}`,
      a && `A: ${a.mode === 'code' ? 'code' : a.tool}`,
      o && `O: ${o}`,
    ];
    console.log(parts.filter(Boolean).join(' | '));
  }

  async run(task: I, opts: Partial<MultiStepOptions> = {}): Promise<O> {
    if (opts.trace !== undefined) this.trace = opts.trace;
    if (opts.onStep) this.onStep = opts.onStep;

    const modelName = this.getModelName();
    const tools = this.buildToolRegistry();
    const toolCatalog = Object.values(tools)
      .map((t) => `- ${t.meta.name}: ${t.meta.description}`)
      .join('\n');
    const defaultPrompt = this.promptEngine.render('react', {
      tools: toolCatalog,
    });
    const systemPrompt = this.customSystemPrompt ?? defaultPrompt;

    this.scratchpad.clear();
    this.scratchpad.setTask(String(task));

    const finalTool = new FinalAnswerTool();

    for (let step = 0; step < this.maxSteps; step++) {
      const messages: LLMMessage[] = this.scratchpad.toMessages(systemPrompt);
      const response = await this.makeOpenRouterRequest(messages, modelName);
      const reply = response.choices[0]?.message?.content?.trim() ?? '';

      const { thought, action } = parseThoughtAction(reply);
      this.scratchpad.addThought(thought);
      this.scratchpad.addAction(action);
      this.log(thought, action);

      let observation = '';
      try {
        if (action.mode === 'json') {
          if (action.tool === finalTool.name) {
            const finalAnswer = await finalTool.forward(action.args);
            observation = typeof finalAnswer === 'object' ? JSON.stringify(finalAnswer) : String(finalAnswer);
            this.scratchpad.addObservation(observation);
            this.log(undefined, undefined, observation);
            if (this.onStep) this.onStep(this.scratchpad);
            return action.args.answer as unknown as O;
          }
          const tool = tools[action.tool];
          if (!tool) {
            observation = `Unknown tool: ${action.tool}`;
          } else {
            const result = await tool.call(action.args);
            observation = JSON.stringify(result);
          }
        } else {
          observation = 'Code actions not supported';
        }
      } catch (err) {
        observation = err instanceof Error ? err.message : String(err);
      }

      this.scratchpad.addObservation(observation);
      this.log(undefined, undefined, observation);
      if (this.onStep) this.onStep(this.scratchpad);
    }

    return (this.scratchpad.getLastObservation() ?? '') as unknown as O;
  }
}
