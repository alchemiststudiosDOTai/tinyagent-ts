import * as readline from 'readline';
import chalk from 'chalk';

export interface IOManagerOptions {
  enableRawMode?: boolean;
}

export class IOManager {
  private rl: readline.Interface;
  private keypressListeners: Array<(str: string, key: any) => void> = [];
  private isWaitingForInput = false;

  constructor(private options: IOManagerOptions = {}) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
  }

  enableRawMode(): void {
    // Only enable raw mode for keypress detection, not for input
    if (this.options.enableRawMode && process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin, this.rl);
    }
  }

  disableRawMode(): void {
    // No need to disable raw mode with this approach
  }

  setupKeypressEvents(): void {
    this.enableRawMode();
  }

  addKeypressListener(listener: (str: string, key: any) => void): void {
    this.keypressListeners.push(listener);
    process.stdin.on('keypress', listener);
  }

  removeKeypressListener(listener: (str: string, key: any) => void): void {
    const index = this.keypressListeners.indexOf(listener);
    if (index !== -1) {
      this.keypressListeners.splice(index, 1);
      process.stdin.removeListener('keypress', listener);
    }
  }

  writePrompt(): void {
    if (!this.isWaitingForInput) {
      this.rl.setPrompt(this.formatPrompt());
      this.rl.prompt();
      this.isWaitingForInput = true;
    }
  }

  private formatPrompt(): string {
    return chalk.blue.bold('❯ ');
  }

  cleanup(): void {
    // Remove all keypress listeners
    this.keypressListeners.forEach(listener => {
      process.stdin.removeListener('keypress', listener);
    });
    this.keypressListeners = [];
    
    if (this.rl) {
      this.rl.close();
    }
  }

  async *readLines(): AsyncGenerator<string, void, unknown> {
    return new Promise<void>((resolve) => {
      const generator = {
        next: () => {
          return new Promise<{ value: string; done: boolean }>((lineResolve) => {
            const onLine = (line: string) => {
              this.isWaitingForInput = false;
              this.rl.removeListener('line', onLine);
              lineResolve({ value: line, done: false });
            };
            
            this.rl.on('line', onLine);
            this.writePrompt();
          });
        },
        [Symbol.asyncIterator]: function() { return this; }
      };
      
      resolve(generator as any);
    }) as any;
  }

  // Simplified method for reading a single line
  async readLine(): Promise<string> {
    return new Promise((resolve) => {
      const onLine = (line: string) => {
        this.isWaitingForInput = false;
        this.rl.removeListener('line', onLine);
        resolve(line);
      };
      
      this.rl.on('line', onLine);
      this.writePrompt();
    });
  }

  // Method to clear current input when cancelling
  clearCurrentInput(): void {
    if (this.isWaitingForInput) {
      this.rl.write('', { ctrl: true, name: 'u' }); // Clear line
      this.isWaitingForInput = false;
    }
  }
} 