import { UnifiedAgent } from '../agent/unified-agent';

export interface AgentOptions {
  model: string;
  systemPrompt?: string;
  testMode?: boolean;
  trace?: boolean;
  tools?: any[];
}

export interface AgentRunOptions {
  abortSignal?: AbortSignal;
}

export class AgentInteraction {
  private agent!: UnifiedAgent;
  private currentAbortController: AbortController | null = null;
  private isRunning = false;
  private options: AgentOptions;

  constructor(options: AgentOptions) {
    this.options = options;
    this.initializeAgent();
  }

  private initializeAgent(): void {
    const { model, systemPrompt, testMode, trace, tools = [] } = this.options;

    // Create agentModel as object if model is string
    const agentModel = typeof model === 'string' ? { name: model } : model;

    // Instantiate UnifiedAgent directly with options
    const agentConfig = {
      model: agentModel,
      systemPrompt,
      testMode,
      trace,
      tools,
    };

    this.agent = new UnifiedAgent(agentConfig);
  }

  async runQuery(input: string, options: AgentRunOptions = {}): Promise<string> {
    if (this.isRunning) {
      throw new Error('Agent is already running a query');
    }

    this.isRunning = true;
    this.currentAbortController = new AbortController();

    // If external abort signal provided, forward abort
    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        this.currentAbortController?.abort();
      });
    }

    try {
      let answer: string;

      // Use execute method of UnifiedAgent
      const result = await this.agent.execute(input, {
        abortSignal: this.currentAbortController.signal,
      });
      answer = result.data;

      return answer;
    } catch (error) {
      // Re-throw with better error context for tool failures
      if (error instanceof Error && error.message.includes('Tool')) {
        const enhancedError = new Error(`${error.message}`);
        enhancedError.name = error.name;
        throw enhancedError;
      }
      throw error;
    } finally {
      this.isRunning = false;
      this.currentAbortController = null;
    }
  }

  abort(reason?: string): void {
    if (this.currentAbortController && this.isRunning) {
      const abortError = new Error(reason || 'Operation aborted');
      abortError.name = 'AbortError';
      this.currentAbortController.abort(abortError);
      this.isRunning = false;
      this.currentAbortController = null;
    }
  }

  isCurrentlyRunning(): boolean {
    return this.isRunning;
  }

  getAgent(): UnifiedAgent {
    return this.agent;
  }

  getAvailableTools(): any[] {
    return this.options.tools || [];
  }
}
