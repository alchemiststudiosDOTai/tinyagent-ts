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
  private agent: any;
  private currentAbortController: AbortController | null = null;
  private isRunning = false;

  constructor(
    private AgentClass: any,
    private ConfigurableAgentClass: any,
    private options: AgentOptions
  ) {
    this.initializeAgent();
  }

  private initializeAgent(): void {
    const { model, systemPrompt, testMode, trace, tools = [] } = this.options;

    if (tools.length > 0) {
      // Use ConfigurableAgent with tools
      const agentOptions = systemPrompt ? { systemPrompt } : {};
      this.agent = new this.ConfigurableAgentClass(agentOptions, tools);
      
      if (model !== 'openai/gpt-4o-mini') {
        this.agent.setModelName(model);
      }
      
      if (testMode) {
        (this.agent as any).testMode = true;
      }
    } else {
      // Use SimpleChatAgent for backward compatibility
      this.agent = new this.AgentClass(model, systemPrompt, testMode);
    }

    // Enable tracing if requested
    if (trace) {
      if (this.agent.setTrace) {
        this.agent.setTrace(true);
      } else {
        (this.agent as any).trace = true;
      }
    }
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

      if (this.agent.runForCLI) {
        answer = await this.agent.runForCLI(input, { 
          abortSignal: this.currentAbortController.signal 
        });
      } else {
        // Fallback
        const result = await this.agent.run(input, { 
          abortSignal: this.currentAbortController.signal 
        });
        answer = result.answer;
      }

      return answer;
    } finally {
      this.isRunning = false;
      this.currentAbortController = null;
    }
  }

  abort(reason?: string): void {
    if (this.currentAbortController && this.isRunning) {
      this.currentAbortController.abort(new Error(reason || 'Operation aborted'));
      this.isRunning = false;
      this.currentAbortController = null;
    }
  }

  isCurrentlyRunning(): boolean {
    return this.isRunning;
  }

  getAgent(): any {
    return this.agent;
  }

  getAvailableTools(): any[] {
    return this.options.tools || [];
  }
} 