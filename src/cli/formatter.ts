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
    console.log(chalk.blue.bold('┌──────────────────────────────────────────────────┐'));
    console.log(chalk.blue.bold('│') + chalk.cyan.bold('              TINYAGENT-TS                    ') + chalk.blue.bold('│'));
    console.log(chalk.blue.bold('│') + chalk.blue('          Advanced AI Agent Framework         ') + chalk.blue.bold('│'));
    console.log(chalk.blue.bold('└──────────────────────────────────────────────────┘'));
    console.log('');
    console.log(chalk.blue('>>') + chalk.gray(' Working Directory: ') + chalk.cyan(process.cwd()));
    console.log(chalk.blue('>>') + chalk.gray(' Model: ') + chalk.cyan(model));
    console.log(chalk.blue('>>') + chalk.gray(' Status: ') + chalk.green('ONLINE'));
    console.log('');
    console.log(chalk.dim('   Press ESC to cancel operations • Type "help" for more commands'));
    console.log('');
  }

  static formatAvailableTools(tools: any[]): string {
    let output = chalk.blue('>> ') + chalk.gray('Available tools:\n');
    tools.forEach((tool) => {
      output += chalk.blue('   [') + chalk.cyan(tool.name) + chalk.blue(']') + chalk.gray(': ' + tool.description + '\n');
    });
    return output;
  }

  static prompt() {
    return chalk.blue.bold('>>> ') + chalk.white('');
  }

  static botResponse(message: string) {
    console.log('');
    console.log(chalk.blue('[AGENT]') + ' ' + chalk.white(message));
    console.log('');
  }

  static error(error: string) {
    console.log('');
    console.log(chalk.red('[ERROR]') + ' ' + chalk.red(error));
    console.log('');
  }

  static info(message: string) {
    console.log('');
    console.log(chalk.blue('[INFO]') + ' ' + chalk.cyan(message));
    console.log('');
  }

  static operationCancelled(method: string) {
    console.log('');
    console.log(chalk.yellow('[CANCELLED]') + ' ' + chalk.cyan(`Operation cancelled by user (${method})`));
    console.log('');
  }

  static thinking() {
    process.stdout.write(chalk.blue('[THINKING]'));
    const dots = ['', '.', '..', '...'];
    let i = 0;
    return setInterval(() => {
      process.stdout.write(
        '\r' + chalk.blue('[THINKING' + dots[i % dots.length] + ']   ')
      );
      i++;
    }, 500);
  }

  static stopThinking(interval: NodeJS.Timeout) {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(30) + '\r');
  }

  static help() {
    console.log('');
    console.log(chalk.blue.bold('┌──────────────────────────────────────────────────┐'));
    console.log(chalk.blue.bold('│') + chalk.cyan.bold('                HELP GUIDE                    ') + chalk.blue.bold('│'));
    console.log(chalk.blue.bold('└──────────────────────────────────────────────────┘'));
    console.log('');
    console.log(chalk.cyan.bold('AVAILABLE COMMANDS:'));
    console.log(chalk.blue('  exit, quit') + chalk.gray(' ────── Exit the chat'));
    console.log(chalk.blue('  help') + chalk.gray('       ────── Show this help message'));
    console.log(chalk.blue('  clear, cls') + chalk.gray(' ────── Clear the screen'));
    console.log('');
    console.log(chalk.cyan.bold('CLI OPTIONS:'));
    console.log(chalk.blue('  -m, --model <id>') + chalk.gray('     ────── LLM model name (default: openai/gpt-4o-mini)'));
    console.log(chalk.blue('  -p, --prompt <file>') + chalk.gray('   ────── System prompt file'));
    console.log(chalk.blue('  -t, --trace') + chalk.gray('          ────── Show detailed reasoning steps'));
    console.log(chalk.blue('  --tools') + chalk.gray('             ────── Load all default tools'));
    console.log(chalk.blue('  --tools-file <path>') + chalk.gray('  ────── Load custom tools from file'));
    console.log(chalk.blue('  --test-mode') + chalk.gray('         ────── Enable test mode with mock responses'));
    console.log('');
    console.log(chalk.cyan.bold('AVAILABLE TOOLS (when --tools is used):'));
    console.log(chalk.gray('  [file] Read, write, append or delete files'));
    console.log(chalk.gray('  [grep] Search for patterns in files'));
    console.log(chalk.gray('  [duckduckgo_search] Search the web'));
    console.log(chalk.gray('  [uuid] Generate random UUIDs'));
    console.log('');
    console.log(chalk.cyan.bold('OPERATION CONTROL:'));
    console.log(chalk.gray('  Press ' + chalk.cyan('ESC') + ' to gracefully cancel the current operation'));
    console.log(chalk.gray('  Press ' + chalk.cyan('Ctrl+C') + ' to abort operation or exit the CLI'));
    console.log(chalk.gray('  Operations with tool failures will retry automatically (max 2 attempts)'));
    console.log('');
    console.log(chalk.cyan.bold('TIPS:'));
    console.log(chalk.gray('  Ask questions naturally in plain English'));
    console.log(chalk.gray('  Use --tools to enable file operations and web search'));
    console.log(chalk.gray('  Use --trace flag when starting to see reasoning steps'));
    console.log(chalk.gray('  If web search fails, try rephrasing your query'));
    console.log(chalk.gray('  Tool errors are handled gracefully with helpful suggestions'));
    console.log('');
  }

  static goodbye() {
    console.log('');
    console.log(chalk.blue.bold('┌──────────────────────────────────────────────────┐'));
    console.log(chalk.blue.bold('│') + chalk.cyan.bold('         SESSION TERMINATED                   ') + chalk.blue.bold('│'));
    console.log(chalk.blue.bold('│') + chalk.blue('       Thanks for using TinyAgent-TS          ') + chalk.blue.bold('│'));
    console.log(chalk.blue.bold('└──────────────────────────────────────────────────┘'));
    console.log(chalk.gray('Connection closed.'));
    console.log('');
  }

  static trace(thought?: string, action?: string, observation?: string) {
    const parts = [];
    if (thought) parts.push(chalk.magenta('[T] ') + chalk.white(thought));
    if (action) parts.push(chalk.blue('[A] ') + chalk.cyan(action));
    if (observation) parts.push(chalk.green('[O] ') + chalk.gray(observation));

    if (parts.length > 0) {
      console.log(chalk.dim('┌─────────────────────────────────────────────────'));
      parts.forEach(part => console.log(chalk.dim('│ ') + part));
      console.log(chalk.dim('└─────────────────────────────────────────────────'));
    }
  }

  static formatTraceSection(): string {
    return chalk.dim('┌─── REASONING TRACE ────────────────────────────────');
  }

  static formatTraceEnd(): string {
    return chalk.dim('└───────────────────────────────────────────────────');
  }

  static clear() {
    process.stdout.write('\x1b[2J\x1b[0f');
  }
} 