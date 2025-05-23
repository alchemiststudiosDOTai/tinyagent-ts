#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
dotenv.config();

import { MultiStepAgent, model } from './index';
import { ConfigurableAgent } from './configurableAgent';
import { ToolPresets } from './toolPresets';

// --- Enhanced CLI Utilities ---
class CLIFormatter {
  static welcome(model: string) {
    console.log('');
    console.log(chalk.cyan.bold('TINYAGENT-TS'));
    console.log('');
    console.log(chalk.gray('/help for help'));
    console.log('');
    console.log(chalk.gray(`cwd: ${process.cwd()}`));
    console.log('');
    console.log(chalk.gray(`Model: ${model}`));
    console.log('');
  }

  static prompt() {
    return chalk.blue.bold('> ') + chalk.white('');
  }

  static botResponse(message: string) {
    console.log('');
    console.log(chalk.white(message));
    console.log('');
  }

  static error(error: string) {
    console.log('');
    console.log(chalk.red('Error: ') + chalk.red(error));
    console.log('');
  }

  static thinking() {
    process.stdout.write(chalk.yellow('Thinking'));
    const dots = ['', '.', '..', '...'];
    let i = 0;
    return setInterval(() => {
      process.stdout.write(
        '\r' + chalk.yellow('Thinking' + dots[i % dots.length] + '   ')
      );
      i++;
    }, 500);
  }

  static stopThinking(interval: NodeJS.Timeout) {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(20) + '\r');
  }

  static help() {
    console.log('');
    console.log(chalk.cyan.bold('Help & Usage'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log('');
    console.log(chalk.yellow.bold('Available Commands:'));
    console.log(chalk.white('  exit, quit') + chalk.gray(' - Exit the chat'));
    console.log(
      chalk.white('  help') + chalk.gray(' - Show this help message')
    );
    console.log(
      chalk.white('  clear, cls') + chalk.gray(' - Clear the screen')
    );
    console.log('');
    console.log(chalk.yellow.bold('CLI Options:'));
    console.log(
      chalk.white('  -m, --model <id>') +
        chalk.gray(' - LLM model (default: openai/gpt-4o-mini)')
    );
    console.log(
      chalk.white('  -p, --prompt <file>') + chalk.gray(' - System prompt file')
    );
    console.log(
      chalk.white('  -t, --trace') + chalk.gray(' - Show reasoning steps')
    );
    console.log(
      chalk.white('  --tools <preset>') +
        chalk.gray(' - Tool preset: all, basic, search, none')
    );
    console.log(
      chalk.white('  --tools-file <path>') +
        chalk.gray(' - Load custom tools from file')
    );
    console.log(
      chalk.white('  --test-mode') +
        chalk.gray(' - Enable test mode with mock responses (for testing only)')
    );
    console.log('');
    console.log(chalk.yellow.bold('Tool Presets:'));
    console.log(
      chalk.white('  all') +
        chalk.gray(
          ' - All built-in tools (file, grep, search, human-loop, uuid)'
        )
    );
    console.log(
      chalk.white('  basic') + chalk.gray(' - Essential tools (file, uuid)')
    );
    console.log(
      chalk.white('  search') +
        chalk.gray(' - Search tools (file, uuid, duckduckgo-search)')
    );
    console.log(chalk.white('  none') + chalk.gray(' - No tools (default)'));
    console.log('');
    console.log(chalk.yellow.bold('Tips:'));
    console.log(chalk.gray('  • Ask questions naturally in plain English'));
    console.log(
      chalk.gray('  • The agent can use tools to help answer your questions')
    );
    console.log(
      chalk.gray('  • Use --trace flag when starting to see reasoning steps')
    );
    console.log(
      chalk.gray(
        '  • Try --tools basic for file operations, --tools all for everything'
      )
    );
    console.log('');
  }

  static goodbye() {
    console.log('');
    console.log(chalk.cyan('Thanks for using tinyAgent-TS!'));
    console.log('');
  }

  static trace(thought?: string, action?: string, observation?: string) {
    const parts = [];
    if (thought) parts.push(chalk.magenta('T: ') + chalk.white(thought));
    if (action) parts.push(chalk.blue('A: ') + chalk.cyan(action));
    if (observation) parts.push(chalk.green('O: ') + chalk.gray(observation));

    if (parts.length > 0) {
      console.log(chalk.dim(parts.join(chalk.dim(' | '))));
    }
  }

  static clear() {
    process.stdout.write('\x1b[2J\x1b[0f');
  }
}

// --- Enhanced Chat Agent ---
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
      // Override the model
      (this as any).modelName = modelName;
    }
    if (systemPrompt) {
      this.promptEngine.overwrite('agent', () => systemPrompt);
    }
  }

  protected getModelName(): string {
    return (this as any).modelName || super.getModelName();
  }

  // Create a wrapper method for the CLI that returns a string
  async runForCLI(input: string): Promise<string> {
    // If in test mode, return mock responses
    if (this.testMode) {
      return this.getMockResponse(input);
    }

    // Temporarily override console.log to intercept trace messages
    const originalLog = console.log;
    const traceEnabled = (this as any).trace;

    if (traceEnabled) {
      console.log = (message: string) => {
        // Check if this is a trace message (format: "T: ... | A: ... | O: ...")
        if (
          typeof message === 'string' &&
          (message.includes('T: ') ||
            message.includes('A: ') ||
            message.includes('O: '))
        ) {
          // Parse the trace message and use our enhanced formatter
          const parts = message.split(' | ');
          let thought, action, observation;

          parts.forEach((part) => {
            if (part.startsWith('T: ')) thought = part.substring(3);
            else if (part.startsWith('A: ')) action = part.substring(3);
            else if (part.startsWith('O: ')) observation = part.substring(3);
          });

          CLIFormatter.trace(thought, action, observation);
        } else {
          originalLog(message);
        }
      };
    }

    try {
      const result = await super.run(input);
      return result.answer;
    } finally {
      // Restore original console.log
      console.log = originalLog;
    }
  }

  // Mock response generator for test mode
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

  // Public method to set trace
  setTrace(enabled: boolean) {
    (this as any).trace = enabled;
  }
}

// --- util -------------------------------------------------------------
async function readPrompt(p: string | undefined): Promise<string> {
  if (!p) return 'You are a helpful assistant.';
  const full = path.resolve(p);
  return fs.readFile(full, 'utf8');
}

// --- Tool Loading Utilities ---
function loadToolPreset(preset: string): any[] {
  switch (preset.toLowerCase()) {
    case 'all':
      return ToolPresets.all();
    case 'basic':
      return ToolPresets.basic();
    case 'search':
      return ToolPresets.search();
    case 'none':
      return ToolPresets.none();
    default:
      console.warn(`Unknown tool preset: ${preset}. Using 'none'.`);
      return ToolPresets.none();
  }
}

async function loadCustomTools(toolsFile: string): Promise<any[]> {
  try {
    const fullPath = path.resolve(toolsFile);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      throw new Error(`Tools file not found: ${fullPath}`);
    }

    // Dynamic import (works for both JS and TS files)
    const module = await import(fullPath);
    const tools = module.default || module.tools || module;

    if (!Array.isArray(tools)) {
      throw new Error('Custom tools file must export an array of tools');
    }

    return tools;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load custom tools: ${message}`);
  }
}

function handleCommand(input: string): boolean {
  const cmd = input.toLowerCase().trim();

  switch (cmd) {
    case 'help':
      CLIFormatter.help();
      return true;
    case 'clear':
    case 'cls':
      CLIFormatter.clear();
      return true;
    case 'exit':
    case 'quit':
      CLIFormatter.goodbye();
      process.exit(0);
    default:
      return false;
  }
}

// --- main -------------------------------------------------------------
async function main() {
  const pkg = require('../package.json');

  const program = new Command()
    .name('tinyagent')
    .description('tinyAgent-TS interactive chat')
    .version(pkg.version, '-v, --version', 'print CLI version')
    .option(
      '-m, --model <id>',
      'LLM model id (OpenRouter style)',
      'openai/gpt-4o-mini'
    )
    .option('-p, --prompt <file>', 'Markdown/text file for the system prompt')
    .option('-t, --trace', 'show ReAct thoughts / actions', false)
    .option(
      '--tools <preset>',
      'Tool preset: all, basic, search, none (default: none)',
      'none'
    )
    .option(
      '--tools-file <path>',
      'Load custom tools from JS/TS file exporting tool array'
    )
    .option(
      '--test-mode',
      'Enable test mode with mock responses (for testing only)',
      false
    )
    .allowExcessArguments(false)
    .action(async (opts) => {
      try {
        // Load tools based on options
        let tools: any[] = [];

        if (opts.toolsFile) {
          // Load custom tools from file
          tools = await loadCustomTools(opts.toolsFile);
          console.log(
            chalk.gray(
              `Loaded ${tools.length} custom tools from ${opts.toolsFile}`
            )
          );
        } else {
          // Load preset tools
          tools = loadToolPreset(opts.tools);
          if (tools.length > 0) {
            console.log(
              chalk.gray(
                `Loaded '${opts.tools}' tool preset (${tools.length} tools)`
              )
            );
          }
        }

        const systemPrompt = await readPrompt(opts.prompt);

        // Use ConfigurableAgent if we have tools, otherwise SimpleChatAgent for compatibility
        let agent: any;
        if (tools.length > 0) {
          // For ConfigurableAgent with tools, don't override the ReAct system prompt unless explicitly provided via CLI
          const agentOptions = opts.prompt ? { systemPrompt } : {};
          agent = new ConfigurableAgent(agentOptions, tools);
          if (opts.model !== 'openai/gpt-4o-mini') {
            // Override model for ConfigurableAgent
            agent.setModelName(opts.model);
          }
          // Add test mode support to ConfigurableAgent
          if (opts.testMode) {
            (agent as any).testMode = true;
          }
        } else {
          // Fallback to SimpleChatAgent for backward compatibility
          agent = new SimpleChatAgent(opts.model, systemPrompt, opts.testMode);
        }

        if (opts.trace) {
          // Enable tracing if requested
          if (agent.setTrace) {
            agent.setTrace(true);
          } else {
            // For ConfigurableAgent, set trace on options
            (agent as any).trace = true;
          }
        }

        // Enhanced welcome screen with tool info
        CLIFormatter.welcome(opts.model);

        if (tools.length > 0) {
          console.log(chalk.gray('Available tools:'));
          tools.forEach((tool) => {
            console.log(chalk.gray(`  ${tool.name}: ${tool.description}`));
          });
          console.log('');
        }

        process.stdin.setEncoding('utf8');

        // Enhanced input loop with better error handling
        const handleInput = async (line: string) => {
          const cleaned = line.trim();
          if (!cleaned) {
            process.stdout.write(CLIFormatter.prompt());
            return;
          }

          // Handle built-in commands
          if (handleCommand(cleaned)) {
            process.stdout.write(CLIFormatter.prompt());
            return;
          }

          // Show thinking indicator
          const thinkingInterval = CLIFormatter.thinking();

          try {
            let answer: string;
            if (agent.runForCLI) {
              // Both SimpleChatAgent and ConfigurableAgent have runForCLI
              answer = await agent.runForCLI(cleaned);
            } else {
              // Fallback (shouldn't happen now)
              const result = await agent.run(cleaned);
              answer = result.answer;
            }
            CLIFormatter.stopThinking(thinkingInterval);
            CLIFormatter.botResponse(answer);
          } catch (error) {
            CLIFormatter.stopThinking(thinkingInterval);
            CLIFormatter.error(
              error instanceof Error ? error.message : String(error)
            );
          }

          process.stdout.write(CLIFormatter.prompt());
        };

        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
          console.log('\n');
          CLIFormatter.goodbye();
          process.exit(0);
        });

        // Start the input loop
        process.stdout.write(CLIFormatter.prompt());

        for await (const line of process.stdin) {
          await handleInput(line);
        }
      } catch (error) {
        console.error(
          chalk.red('Failed to initialize:'),
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  program.parse();
}

main().catch(console.error);
