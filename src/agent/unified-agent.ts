import { ModelManager } from '../model';
import { ReActEngine } from '../react';
import { StandardToolRegistry, FinalAnswerTool, Tool } from '../tools';
import { PromptEngine } from '../promptEngine';
import { Agent, AgentConfig, AgentExecutionOptions, AgentResult, AgentMode } from './types';

/**
 * Unified agent implementation supporting multiple execution modes
 */
export class UnifiedAgent implements Agent {
  private modelManager: ModelManager;
  private toolRegistry: StandardToolRegistry;
  private reactEngine: ReActEngine;
  private promptEngine: PromptEngine;
  private config: Required<AgentConfig>;

  constructor(config: AgentConfig = {}) {
    // Set default configuration
    this.config = {
      mode: config.mode || 'react',
      model: {
        name: config.model?.name || 'openai/gpt-4o-mini',
        provider: config.model?.provider || 'openrouter',
        apiKey: config.model?.apiKey || process.env.OPENROUTER_API_KEY || '',
      },
      react: {
        maxSteps: 5,
        enableReflexion: true,
        enableTrace: false,
        ...config.react,
      },
      systemPrompt: config.systemPrompt,
      systemPromptFile: config.systemPromptFile,
      debug: config.debug || false,
      logger: config.logger || console,
    };

    // Initialize components
    this.modelManager = new ModelManager({
      defaultModel: this.config.model.name,
      defaultProvider: this.config.model.provider,
      apiKey: this.config.model.apiKey,
    });

    this.toolRegistry = new StandardToolRegistry();
    this.reactEngine = new ReActEngine(this.modelManager);
    this.promptEngine = new PromptEngine(
      {},
      this.config.systemPromptFile ? { agent: this.config.systemPromptFile } : {}
    );

    // Register default tools
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    // Always register final answer tool
    const finalAnswerTool = new FinalAnswerTool();
    this.toolRegistry.register(finalAnswerTool);
    
    // Register with ReAct engine
    this.reactEngine.registerTool({
      name: finalAnswerTool.name,
      description: finalAnswerTool.description,
      schema: finalAnswerTool.schema,
      execute: finalAnswerTool.execute.bind(finalAnswerTool),
    });
  }

  async execute<T = any>(
    input: string,
    options: AgentExecutionOptions = {}
  ): Promise<AgentResult<T>> {
    const startTime = Date.now();
    const mode = this.config.mode;
    const model = options.model || this.config.model.name;

    try {
      let result: any;
      let steps: any[] = [];

      switch (mode) {
        case 'simple':
          result = await this.executeSimple(input, options);
          break;
        
        case 'react':
          const reactResult = await this.executeReAct(input, options);
          result = reactResult.finalAnswer;
          steps = reactResult.steps;
          break;
        
        case 'triage':
          result = await this.executeTriage(input, options);
          break;
        
        default:
          throw new Error(`Unknown agent mode: ${mode}`);
      }

      return {
        success: true,
        data: result,
        metadata: {
          mode,
          model,
          executionTime: Date.now() - startTime,
          steps,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          mode,
          model,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private async executeSimple(
    input: string,
    options: AgentExecutionOptions
  ): Promise<any> {
    const systemPrompt = options.systemPrompt || 
      this.config.systemPrompt || 
      this.promptEngine.render('agent', {});

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: input },
    ];

    const response = await this.modelManager.chat(messages, {
      model: options.model,
      abortSignal: options.abortSignal,
    });

    return { answer: response.content };
  }

  private async executeReAct(
    input: string,
    options: AgentExecutionOptions
  ): Promise<any> {
    const systemPrompt = options.systemPrompt || 
      this.config.systemPrompt || 
      this.promptEngine.render('react', {
        tools: this.toolRegistry.getCatalog(),
      });

    const reactConfig = {
      ...this.config.react,
      enableTrace: options.trace ?? this.config.react?.enableTrace,
    };

    return await this.reactEngine.execute(
      input,
      systemPrompt,
      reactConfig,
      {
        model: options.model,
        abortSignal: options.abortSignal,
      }
    );
  }

  private async executeTriage(
    input: string,
    options: AgentExecutionOptions
  ): Promise<any> {
    const toolsList = this.toolRegistry.getAll()
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');

    return {
      answer: `Here are the available tools, choose the best one for the task:\n${toolsList}`,
    };
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update model manager if model config changed
    if (config.model) {
      this.modelManager.updateConfig({
        defaultModel: config.model.name,
        defaultProvider: config.model.provider,
        apiKey: config.model.apiKey,
      });
    }
  }

  getToolRegistry(): StandardToolRegistry {
    return this.toolRegistry;
  }

  getModelManager(): ModelManager {
    return this.modelManager;
  }

  getReActEngine(): ReActEngine {
    return this.reactEngine;
  }

  /**
   * Register a tool with both the registry and ReAct engine
   */
  registerTool(tool: Tool): void {
    this.toolRegistry.register(tool);
    this.reactEngine.registerTool({
      name: tool.name,
      description: tool.description,
      schema: tool.schema,
      execute: tool.execute.bind(tool),
    });
  }

  /**
   * Unregister a tool from both the registry and ReAct engine
   */
  unregisterTool(name: string): void {
    this.toolRegistry.unregister(name);
    this.reactEngine.unregisterTool(name);
  }

  /**
   * Register multiple tools at once
   */
  registerTools(tools: Tool[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }
} 