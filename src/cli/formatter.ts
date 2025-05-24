import chalk from 'chalk';

export class CLIFormatter {
  static showCancellationOptions() {
    console.log(chalk.dim('Press ESC to cancel the current operation'));
  }
  
  static formatEscapeKeyInfo(): string {
    return chalk.dim('Press ESC to cancel operations • Type "help" for commands • "exit" to quit');
  }
  
  static welcome(model: string) {
    console.log('');
    console.log(chalk.cyan.bold('╭─────────────────────────────────────╮'));
    console.log(chalk.cyan.bold('│           TINYAGENT-TS              │'));
    console.log(chalk.cyan.bold('╰─────────────────────────────────────╯'));
    console.log('');
    console.log(chalk.gray(`Working Directory: ${process.cwd()}`));
    console.log(chalk.gray(`Model: ${chalk.white(model)}`));
    console.log('');
  }

  static formatAvailableTools(tools: any[]): string {
    let output = chalk.gray(' Available tools:\n');
    tools.forEach((tool) => {
      output += chalk.gray(`   • ${chalk.white(tool.name)}: ${tool.description}\n`);
    });
    return output;
  }

  static prompt() {
    return chalk.blue.bold('❯ ') + chalk.white('');
  }

  static botResponse(message: string) {
    console.log('');
    console.log(chalk.green('') + chalk.white(message));
    console.log('');
  }

  static error(error: string) {
    console.log('');
    console.log(chalk.red('Error: ') + chalk.red(error));
    console.log('');
  }

  static info(message: string) {
    console.log('');
    console.log(chalk.blue('') + chalk.cyan(message));
    console.log('');
  }

  static thinking() {
    process.stdout.write(chalk.yellow(' Thinking'));
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
    process.stdout.write('\r' + ' '.repeat(25) + '\r');
  }

  static help() {
    console.log('');
    console.log(chalk.cyan.bold('╭─────────────────────────────────────╮'));
    console.log(chalk.cyan.bold('│              HELP GUIDE             │'));
    console.log(chalk.cyan.bold('╰─────────────────────────────────────╯'));
    console.log('');
    console.log(chalk.yellow.bold('Available Commands:'));
    console.log(chalk.white('   exit, quit') + chalk.gray(' ──── Exit the chat'));
    console.log(chalk.white('   help') + chalk.gray('       ──── Show this help message'));
    console.log(chalk.white('   clear, cls') + chalk.gray(' ──── Clear the screen'));
    console.log('');
    console.log(chalk.yellow.bold('CLI Options:'));
    console.log(chalk.white('   -m, --model <id>') + chalk.gray('     ──── LLM model (default: openai/gpt-4o-mini)'));
    console.log(chalk.white('   -p, --prompt <file>') + chalk.gray('   ──── System prompt file'));
    console.log(chalk.white('   -t, --trace') + chalk.gray('          ──── Show reasoning steps'));
    console.log(chalk.white('   --tools') + chalk.gray('             ──── Load all default tools'));
    console.log(chalk.white('   --tools-file <path>') + chalk.gray('  ──── Load custom tools from file'));
    console.log(chalk.white('   --test-mode') + chalk.gray('         ──── Enable test mode with mock responses'));
    console.log('');
    console.log(chalk.yellow.bold('Available Tools (when --tools is used):'));
    console.log(chalk.gray('   • file: Read, write, append or delete files'));
    console.log(chalk.gray('   • grep: Search for patterns in files'));
    console.log(chalk.gray('   • duckduckgo_search: Search the web'));
    console.log(chalk.gray('   • uuid: Generate random UUIDs'));
    console.log('');
    console.log(chalk.yellow.bold('Tips:'));
    console.log(chalk.gray('   • Ask questions naturally in plain English'));
    console.log(chalk.gray('   • Use --tools to enable file operations and web search'));
    console.log(chalk.gray('   • Use --trace flag when starting to see reasoning steps'));
    console.log(chalk.gray('   • Press ESC to cancel the current operation (graceful cancellation)'));
    console.log(chalk.gray('   • Press Ctrl+C to abort or exit the CLI'));
    console.log('');
  }

  static goodbye() {
    console.log('');
    console.log(chalk.cyan.bold('╭─────────────────────────────────────╮'));
    console.log(chalk.cyan.bold('│      Thanks for using TinyAgent!    │'));
    console.log(chalk.cyan.bold('╰─────────────────────────────────────╯'));
    console.log(chalk.gray('Goodbye!'));
    console.log('');
  }

  static trace(thought?: string, action?: string, observation?: string) {
    const parts = [];
    if (thought) parts.push(chalk.magenta('T: ') + chalk.white(thought));
    if (action) parts.push(chalk.blue('A: ') + chalk.cyan(action));
    if (observation) parts.push(chalk.green('O: ') + chalk.gray(observation));

    if (parts.length > 0) {
      console.log(chalk.dim(parts.join(chalk.dim(' │ '))));
    }
  }

  static clear() {
    process.stdout.write('\x1b[2J\x1b[0f');
  }
} 