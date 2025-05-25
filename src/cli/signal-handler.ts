export interface SignalHandlerCallbacks {
  onEscapeKey?: () => void;
  onCtrlC?: () => void;
  onSigInt?: () => void;
  onSigTerm?: () => void;
}

export class SignalHandler {
  private callbacks: SignalHandlerCallbacks = {};
  private isActive = false;

  constructor(callbacks: SignalHandlerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  activate(): void {
    if (this.isActive) return;

    // Handle Ctrl+C (SIGINT) and SIGTERM
    process.on('SIGINT', this.handleSigInt);
    process.on('SIGTERM', this.handleSigTerm);
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) return;

    process.removeListener('SIGINT', this.handleSigInt);
    process.removeListener('SIGTERM', this.handleSigTerm);
    this.isActive = false;
  }

  createKeypressHandler(): (str: string, key: any) => void {
    return (_str: string, key: any) => {
      if (key && key.name === 'escape') {
        this.callbacks.onEscapeKey?.();
      } else if (key && key.ctrl && key.name === 'c') {
        this.callbacks.onCtrlC?.();
      }
    };
  }

  updateCallbacks(callbacks: Partial<SignalHandlerCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private handleSigInt = (): void => {
    console.log(''); // New line for clean output
    this.callbacks.onSigInt?.();
  };

  private handleSigTerm = (): void => {
    console.log(''); // New line for clean output
    this.callbacks.onSigTerm?.();
  };
} 