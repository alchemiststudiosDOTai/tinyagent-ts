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
      .filter((t) => t.meta.name !== 'final_answer')
      .map((t) => `- ${t.meta.name}: ${t.meta.description}`)
      .join('\n');
    const defaultPrompt = this.promptEngine.render('react', {
      tools: toolCatalog,
    });
    const systemPrompt = this.customSystemPrompt ?? defaultPrompt;

    this.scratchpad.clear();
    this.scratchpad.setTask(String(task));

    const finalTool = new FinalAnswerTool();
    let usedTool = false;

    for (let step = 0; step < this.maxSteps; step++) {
      const messages: LLMMessage[] = this.scratchpad.toMessages(systemPrompt);
      const response = await this.makeOpenRouterRequest(messages, modelName);
      const reply = response.choices[0]?.message?.content?.trim() ?? '';

      const { thought, action } = parseThoughtAction(reply);
      if (thought) this.scratchpad.addThought(thought);
      if (action) this.scratchpad.addAction(action);
      this.log(thought, action);

      let observation = '';
      try {
        if (action && action.mode === 'json') {
          if (action.tool === finalTool.name) {
            if (!usedTool) {
              console.warn('final_answer called before any other tool');
            }
            // Ensure args has the required 'answer' property for FinalAnswerInput
            const finalAnswerArgs = { answer: action.args.answer as string };
            const finalAnswer = await finalTool.forward(finalAnswerArgs);
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
            usedTool = true;
            observation = JSON.stringify(result);
          }
        } else if (action) {
          observation = 'Code actions not supported';
        } else {
          observation = 'No action provided';
        }
      } catch (err) {
        observation = err instanceof Error ? err.message : String(err);
      }

      this.scratchpad.addObservation(observation);
      this.log(undefined, undefined, observation);
      if (this.onStep) this.onStep(this.scratchpad);

      // Reflexion step
      const reflectMsgs: LLMMessage[] = this.scratchpad.toMessages(systemPrompt);
      reflectMsgs.push({ role: 'user', content: 'Reflect:' });
      const reflectRes = await this.makeOpenRouterRequest(reflectMsgs, modelName);
      const reflectReply = reflectRes.choices[0]?.message?.content?.trim() ?? '';
      const { thought: fixThought, action: fixAction, reflexion } =
        parseThoughtAction(reflectReply);
      if (reflexion) {
        this.scratchpad.addReflexion(reflexion);
        this.log(reflexion);
      }
      if (fixAction) {
        if (fixAction.mode === 'json') {
          if (fixAction.tool === finalTool.name) {
            if (!usedTool) {
              console.warn('final_answer called before any other tool');
            }
            // Ensure args has the required 'answer' property for FinalAnswerInput
            const finalAnswerArgs = { answer: fixAction.args.answer as string };
            const finalAnswer = await finalTool.forward(finalAnswerArgs);
            const obs =
              typeof finalAnswer === 'object'
                ? JSON.stringify(finalAnswer)
                : String(finalAnswer);
            this.scratchpad.addObservation(obs);
            this.log(undefined, undefined, obs);
            if (this.onStep) this.onStep(this.scratchpad);
            return fixAction.args.answer as unknown as O;
          }
          const tool = tools[fixAction.tool];
          let obs = '';
          try {
            if (!tool) {
              obs = `Unknown tool: ${fixAction.tool}`;
            } else {
              const result = await tool.call(fixAction.args);
              usedTool = true;
              obs = JSON.stringify(result);
            }
          } catch (err) {
            obs = err instanceof Error ? err.message : String(err);
          }
          if (fixThought) this.scratchpad.addThought(fixThought);
          this.scratchpad.addAction(fixAction);
          this.scratchpad.addObservation(obs);
          this.log(fixThought, fixAction, obs);
          if (this.onStep) this.onStep(this.scratchpad);
        }
      } else if (fixThought) {
        this.scratchpad.addThought(fixThought);
        this.log(fixThought);
        if (this.onStep) this.onStep(this.scratchpad);
      }
    }

    return (this.scratchpad.getLastObservation() ?? '') as unknown as O;
  }
}
