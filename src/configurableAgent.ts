import { MultiStepAgent, MultiStepOptions } from './multiStepAgent';
import { model } from './decorators';
import { Scratchpad } from './utils/scratchpad';
import chalk from 'chalk';

/**
 * Agent supporting custom tool injection via constructor.
 */
@model('openai/gpt-4o-mini')
export class ConfigurableAgent<I = string> extends MultiStepAgent<I> {
  private readonly externalTools: any[];
  private modelNameOverride?: string;
  public testMode: boolean = false;

  constructor(options: MultiStepOptions = {}, externalTools: any[] = []) {
    super(options);
    this.externalTools = externalTools;
    
    // If no custom system prompt provided, use CLI-specific ReAct prompt for better tool usage behavior
    if (!options.systemPrompt && !options.systemPromptFile) {
      this.promptEngine.overwrite('react', (data) => {
        return this.promptEngine.render('cli-react', data);
      });
    }
  }

  protected getModelName(): string {
    return this.modelNameOverride || super.getModelName();
  }

  // Method to set model name (for CLI compatibility)
  setModelName(modelName: string) {
    this.modelNameOverride = modelName;
  }

  // Display steps in clean format (no emojis)
  private displayReActSteps(pad: Scratchpad): void {
    const steps = pad.getSteps();
    const lastStep = steps[steps.length - 1];

    if (lastStep.type === 'thought') {
      console.log(chalk.magenta(`Thought: ${lastStep.text}`));
    } else if (lastStep.type === 'action') {
      if (lastStep.mode === 'json') {
        console.log(
          chalk.blue(
            `Action: ${lastStep.tool}(${JSON.stringify(lastStep.args)})`
          )
        );
      } else {
        console.log(chalk.blue(`Action: [Code Action]`));
      }
    } else if (lastStep.type === 'observation') {
      console.log(chalk.green(`Observation: ${lastStep.text}`));
    }
  }

  /**
   * CLI wrapper for agent run. Supports aborting via options.abortSignal.
   */
  async runForCLI(input: string, options?: { abortSignal?: AbortSignal }): Promise<string> {
    // If in test mode, return mock responses
    if (this.testMode) {
      return this.getMockResponse(input);
    }
    const result = await super.run(input as I, {
      trace: (this as any).trace,
      onStep: (this as any).trace ? this.displayReActSteps.bind(this) : undefined,
      abortSignal: options?.abortSignal,
    });
    return result.answer;
  }

  // Public method to set trace (for CLI compatibility)
  setTrace(enabled: boolean) {
    (this as any).trace = enabled;
  }

  /**
   * Builds the tool registry, including injected tools.
   */
  protected buildToolRegistry(): Record<string, any> {
    const registry = { ...super.buildToolRegistry() };

    // Convert external tool instances to ToolHandle format
    for (const tool of this.externalTools) {
      if (
        tool &&
        tool.name &&
        tool.description &&
        typeof tool.forward === 'function'
      ) {
        registry[tool.name] = {
          meta: {
            name: tool.name,
            description: tool.description,
            method: 'forward',
            schema: tool.schema || null,
          },
          call: async (args: Record<string, unknown>, abortSignal?: AbortSignal) => {
            void abortSignal;
            try {
              // Parse args with tool's schema if available
              const parsed = tool.schema ? tool.schema.parse(args) : args;
              return await tool.forward(parsed);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);
              throw new Error(
                `Error executing tool "${tool.name}": ${message}`
              );
            }
          },
        };
      }
    }

    return registry;
  }

  // Mock response generator for test mode (same as SimpleChatAgent)
  private getMockResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello world') && lowerInput.includes('file')) {
      return "The file 'hello_world.txt' has been created with the content 'Hello, World!'";
    }

    if (
      lowerInput.includes('create') ||
      lowerInput.includes('make') ||
      lowerInput.includes('file')
    ) {
      return "I've successfully created the requested file for you.";
    }

    return 'This is a test response from the mock agent.';
  }
}
