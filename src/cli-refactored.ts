#!/usr/bin/env node
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
dotenv.config();

import { MultiStepAgent, model } from './index';
import { ConfigurableAgent } from './configurableAgent';
import { CLIController, CLIFormatter, readPrompt, loadToolPreset, loadCustomTools } from './cli';

// --- Enhanced Chat Agent (moved from original CLI) ---
@model('openai/gpt-4o-mini')
class SimpleChatAgent extends MultiStepAgent<string> {
  private testMode: boolean = false;

  constructor(
    modelName?: string,
    systemPrompt?: string,
    testMode: boolean = false
  ) {
    super();
    this.testMode = testMode;
    if (modelName) {
      (this as any).modelName = modelName;
    }
    if (systemPrompt) {
      this.promptEngine.overwrite('agent', () => systemPrompt);
    }
  }

  protected getModelName(): string {
    return (this as any).modelName || super.getModelName();
  }

  async runForCLI(input: string): Promise<string> {
    if (this.testMode) {
      return this.getMockResponse(input);
    }

    const originalLog = console.log;
    const traceEnabled = (this as any).trace;
    let traceMessages: string[] = [];

    if (traceEnabled) {
      console.log = (...args) => {
        const message = args.join(' ');
        traceMessages.push(message);
      };
    }

    try {
      const result = await this.run(input);
      const answer = result.answer;

      if (traceEnabled) {
        console.log = originalLog;
        traceMessages.forEach((msg: string) => {
          if (msg.includes('T:') || msg.includes('A:') || msg.includes('O:')) {
            console.log(chalk.dim(msg));
          }
        });
      }

      return answer;
    } finally {
      console.log = originalLog;
    }
  }

  private getMockResponse(input: string): string {
    const responses = [
      "This is a mock response for testing purposes.",
      "I'm in test mode, so this isn't a real AI response.",
      "Mock response: I understand your question about '" + input + "'",
      "Test mode activated - this is a simulated response.",
      "In test mode, I can only provide mock responses like this one."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  setTrace(enabled: boolean) {
    (this as any).trace = enabled;
  }
}

async function main() {
  try {
    const program = new Command();
    
    program
      .name('tinyagent-ts')
      .description('AI Agent CLI powered by TinyAgent-TS')
      .version('1.0.0');

    program
      .option('-m, --model <id>', 'LLM model to use', 'openai/gpt-4o-mini')
      .option('-p, --prompt <file>', 'System prompt file')
      .option('-t, --trace', 'Show reasoning steps', false)
      .option('--tools', 'Load all default tools', false)
      .option('--tools-file <path>', 'Load custom tools from file')
      .option('--test-mode', 'Enable test mode with mock responses', false)
      .action(async (opts) => {
        try {
          // Load tools
          let tools: any[] = [];
          if (opts.toolsFile) {
            tools = await loadCustomTools(opts.toolsFile);
          } else if (opts.tools) {
            tools = loadToolPreset('all');
          }

          // Read system prompt if provided
          const systemPrompt = await readPrompt(opts.prompt);

          // Create CLI controller
          const cliController = new CLIController(
            SimpleChatAgent,
            ConfigurableAgent,
            {
              model: opts.model,
              systemPrompt,
              testMode: opts.testMode,
              trace: opts.trace,
              tools,
              enableRawMode: true, // Enable raw mode for ESC key handling
            }
          );

          // Start the CLI
          await cliController.start();
        } catch (error) {
          CLIFormatter.error(
            error instanceof Error ? error.message : String(error)
          );
          process.exit(1);
        }
      });

    program.parse();
  } catch (error) {
    console.error(
      chalk.red('Failed to initialize:'),
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch(console.error); 