import { IOManager } from './io-manager';
import { SignalHandler } from './signal-handler';
import { AgentInteraction, AgentOptions } from './agent-interaction';
import { StateManager } from './state-manager';
import { CLIFormatter } from './formatter';

export interface CLIOptions extends AgentOptions {
  enableRawMode?: boolean;
}

export class CLIController {
  private ioManager: IOManager;
  private signalHandler: SignalHandler;
  private agentInteraction: AgentInteraction;
  private stateManager: StateManager;
  private isInitialized = false;
  private isShuttingDown = false;

  constructor(
    AgentClass: any,
    ConfigurableAgentClass: any,
    private options: CLIOptions
  ) {
    this.stateManager = new StateManager();
    this.ioManager = new IOManager({ enableRawMode: options.enableRawMode });
    this.agentInteraction = new AgentInteraction(
      AgentClass, 
      ConfigurableAgentClass, 
      options
    );
    this.signalHandler = new SignalHandler({
      onEscapeKey: () => this.handleEscapeKey(),
      onSigInt: () => this.handleSigInt(),
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Setup I/O and signal handling
      this.ioManager.setupKeypressEvents();
      this.signalHandler.activate();
      
      const keypressHandler = this.signalHandler.createKeypressHandler();
      this.ioManager.addKeypressListener(keypressHandler);

      // Show welcome message
      this.showWelcome();
      this.showHelpHint();

      this.isInitialized = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      CLIFormatter.error(`Failed to initialize CLI: ${message}`);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.runInputLoop();
    } catch (error) {
      if (!this.isShuttingDown) {
        const message = error instanceof Error ? error.message : String(error);
        CLIFormatter.error(`CLI error: ${message}`);
      }
    } finally {
      this.cleanup();
    }
  }

  private async runInputLoop(): Promise<void> {
    while (!this.isShuttingDown) {
      try {
        const line = await this.ioManager.readLine();
        
        if (this.isShuttingDown) break;
        
        await this.handleInput(line);
      } catch (error) {
        if (this.isShuttingDown) break;
        
        const message = error instanceof Error ? error.message : String(error);
        CLIFormatter.error(`Input error: ${message}`);
        
        // Continue the loop unless it's a critical error
        if (error instanceof Error && error.name === 'CRITICAL') {
          break;
        }
      }
    }
  }

  private async handleInput(line: string): Promise<void> {
    const cleaned = line.trim();
    
    // Skip empty input
    if (!cleaned) {
      return;
    }

    this.stateManager.setLastCommand(cleaned);

    // Handle built-in commands first
    if (this.handleBuiltInCommand(cleaned)) {
      return;
    }

    // Process with agent
    await this.processAgentQuery(cleaned);
  }

  private async processAgentQuery(query: string): Promise<void> {
    try {
      this.stateManager.setRunning(true, 'agent-query');
      
      // Show thinking indicator
      const thinkingInterval = CLIFormatter.thinking();
      
      try {
        const answer = await this.agentInteraction.runQuery(query);
        CLIFormatter.stopThinking(thinkingInterval);
        CLIFormatter.botResponse(answer);
      } catch (error) {
        CLIFormatter.stopThinking(thinkingInterval);
        throw error;
      }
      
    } catch (error: any) {
      this.handleAgentError(error);
    } finally {
      this.stateManager.setRunning(false);
    }
  }

  private handleAgentError(error: any): void {
    if (error?.name === 'AbortError') {
      if (error.message?.includes('ESC key')) {
        // ESC cancellation is already handled in handleEscapeKey
        return;
      } else {
        CLIFormatter.info('Operation aborted by user (Ctrl+C)');
      }
    } else {
      const message = error instanceof Error ? error.message : String(error);
      CLIFormatter.error(message);
    }
  }

  private handleBuiltInCommand(input: string): boolean {
    const command = input.toLowerCase();
    
    switch (command) {
      case 'exit':
      case 'quit':
        this.gracefulExit();
        return true;
      
      case 'help':
        CLIFormatter.help();
        return true;
      
      case 'clear':
      case 'cls':
        CLIFormatter.clear();
        this.showWelcome();
        this.showHelpHint();
        return true;
      
      default:
        return false;
    }
  }

  private handleEscapeKey(): void {
    if (!this.stateManager.isCurrentlyRunning()) {
      return;
    }

    // Cancel the running operation
    this.agentInteraction.abort('Operation cancelled by ESC key');
    this.stateManager.setRunning(false);
    
    // Provide user feedback
    CLIFormatter.info('Operation cancelled by user (ESC key)');
    
    // Clear any partial input and reset prompt
    this.ioManager.clearCurrentInput();
    console.log(''); // Clean line break
  }

  private handleSigInt(): void {
    if (this.stateManager.isCurrentlyRunning()) {
      // Cancel current operation
      this.agentInteraction.abort('Operation aborted by Ctrl+C');
      this.stateManager.setRunning(false);
      CLIFormatter.info('Operation aborted by user (Ctrl+C)');
    } else {
      // Exit the CLI
      this.gracefulExit();
    }
  }

  private gracefulExit(): void {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    CLIFormatter.goodbye();
    
    // Allow time for cleanup
    setTimeout(() => {
      process.exit(0);
    }, 100);
  }

  private showWelcome(): void {
    CLIFormatter.welcome(this.options.model);
    
    const tools = this.agentInteraction.getAvailableTools();
    if (tools.length > 0) {
      console.log(CLIFormatter.formatAvailableTools(tools));
    }
  }

  private showHelpHint(): void {
    console.log(CLIFormatter.formatEscapeKeyInfo());
    console.log('');
  }

  cleanup(): void {
    try {
      this.ioManager.cleanup();
      this.signalHandler.deactivate();
      this.stateManager.reset();
    } catch (error) {
      // Silent cleanup - don't show errors during shutdown
    }
  }
} 