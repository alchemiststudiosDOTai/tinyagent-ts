export interface CLIState {
  isRunning: boolean;
  currentOperation: string | null;
  lastCommand: string | null;
}

export class StateManager {
  private state: CLIState = {
    isRunning: false,
    currentOperation: null,
    lastCommand: null,
  };

  private listeners: Array<(state: CLIState) => void> = [];

  getState(): Readonly<CLIState> {
    return { ...this.state };
  }

  updateState(updates: Partial<CLIState>): void {
    this.state = { ...this.state, ...updates };
    
    // Notify listeners of state change
    this.listeners.forEach(listener => listener(this.state));
  }

  setRunning(isRunning: boolean, operation?: string): void {
    this.updateState({
      isRunning,
      currentOperation: isRunning ? operation || null : null,
    });
  }

  setLastCommand(command: string): void {
    this.updateState({ lastCommand: command });
  }

  isCurrentlyRunning(): boolean {
    return this.state.isRunning;
  }

  getCurrentOperation(): string | null {
    return this.state.currentOperation;
  }

  getLastCommand(): string | null {
    return this.state.lastCommand;
  }

  addStateListener(listener: (state: CLIState) => void): void {
    this.listeners.push(listener);
  }

  removeStateListener(listener: (state: CLIState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  reset(): void {
    this.updateState({
      isRunning: false,
      currentOperation: null,
      lastCommand: null,
    });
  }
} 