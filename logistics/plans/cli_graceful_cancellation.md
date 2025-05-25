# CLI Graceful Cancellation Plan

## Overview

Currently, the tinyagent-ts CLI supports cancellation of operations via Ctrl+C (SIGINT), but users need a more intuitive way to cancel operations without exiting the entire CLI. This plan outlines the implementation of ESC key support for gracefully cancelling the current operation while keeping the CLI session alive.

## Current State

- The CLI uses an `AbortController` to handle cancellation via Ctrl+C
- When Ctrl+C is pressed during an operation, the current operation is aborted
- When Ctrl+C is pressed outside an operation, the CLI exits
- There is no clear indication to users that they can cancel operations
- ESC key is not currently supported for cancellation

## Goals

1. Implement ESC key support to cancel the current operation
2. Provide clear user feedback about cancellation options
3. Ensure graceful handling of the cancellation process
4. Update documentation and help text to inform users of this capability

## Implementation Plan

### Phase 1: Raw Mode and ESC Key Detection ✅ DONE

**Files to modify:**
- `/src/cli.ts` - Main CLI implementation
- `/src/utils/cli-formatter.ts` (create if not exists) - Extract CLI formatting logic

1. Configure the terminal to use "raw mode" during agent operations
   - Use the Node.js `readline` module's `emitKeypressEvents` function
   - Set `process.stdin.setRawMode(true)` during operations
   ```typescript
   // In src/cli.ts
   import * as readline from 'readline';
   
   // Setup at initialization
   readline.emitKeypressEvents(process.stdin);
   if (process.stdin.isTTY) {
     process.stdin.setRawMode(true);
   }
   ```

2. Implement keypress event listener to detect ESC key (ASCII code 27)
   ```typescript
   // In src/cli.ts
   process.stdin.on('keypress', (str, key) => {
     if (key && key.name === 'escape' && isRunningCommand && currentAbortController) {
       currentAbortController.abort();
       // Provide user feedback
       CLIFormatter.info('Operation cancelled by user (ESC key)');
     }
   });
   ```

3. Ensure raw mode is properly disabled after the operation completes
   ```typescript
   // In src/cli.ts handleInput function
   try {
     // Enable raw mode if not already enabled
     const wasRawMode = process.stdin.isRaw;
     if (process.stdin.isTTY && !wasRawMode) {
       process.stdin.setRawMode(true);
     }
     // Run operation
   } finally {
     // Restore previous raw mode state
     if (process.stdin.isTTY && !wasRawMode) {
       process.stdin.setRawMode(false);
     }
   }
   ```

### Phase 2: User Interface Improvements ✅ DONE

**Files to modify:**
- `/src/cli.ts` - Update help text and operation start/end handling
- `/src/utils/cli-formatter.ts` - Add new formatting methods

1. Add a new method to `CLIFormatter` to display cancellation options
   ```typescript
   // In src/utils/cli-formatter.ts or src/cli.ts (CLIFormatter class)
   static showCancellationOptions() {
     console.log(chalk.dim('Press ESC to cancel the current operation'));
   }
   
   // Also add an info method if not exists
   static info(message: string) {
     console.log(chalk.blue('ℹ') + ' ' + chalk.cyan(message));
   }
   ```

2. Display cancellation options when an operation starts
   ```typescript
   // In src/cli.ts handleInput function
   // Before starting the operation
   CLIFormatter.showCancellationOptions();
   const thinkingInterval = CLIFormatter.thinking();
   ```

3. Update the CLI help text to include information about cancellation
   ```typescript
   // In src/cli.ts help function
   static help() {
     // Existing help text...
     
     console.log(chalk.bold('\nCancelling Operations:'));
     console.log('  Press ' + chalk.inverse(' ESC ') + ' to cancel the current operation');
     console.log('  Press ' + chalk.inverse(' Ctrl+C ') + ' to cancel the operation or exit the CLI');
   }
   ```

4. Add a visual indicator during operations to remind users of cancellation options
   ```typescript
   // In src/cli.ts thinking function
   static thinking() {
     // Existing thinking animation code...
     
     // Add a subtle reminder every few seconds
     let reminderCount = 0;
     const interval = setInterval(() => {
       // Show reminder every 5 seconds
       if (reminderCount % 10 === 0) {
         process.stdout.write(chalk.dim('\r(Press ESC to cancel) '));
       }
       reminderCount++;
       // Rest of animation code...
     }, 500);
     
     return interval;
   }
   ```

### Phase 3: Testing and Documentation

**Files to modify:**
- `/test/cli-hello-world.test.ts` - Update existing CLI test
- `/test/cli-cancellation.test.ts` (new) - Add specific cancellation tests
- `/README.md` - Update documentation
- `/src/cli.ts` - Update welcome message

1. Update the CLI test suite to verify ESC key cancellation works
   ```typescript
   // In /test/cli-cancellation.test.ts (new file)
   import { spawn } from 'child_process';
   import * as path from 'path';
   
   describe('CLI Cancellation Test', () => {
     it('cancels operation when ESC key is pressed', async () => {
       const cliPath = path.resolve(__dirname, '../src/cli.ts');
       
       const nodeProcess = spawn('npx', ['tsx', cliPath, '--test-mode'], {
         stdio: ['pipe', 'pipe', 'inherit'],
         cwd: process.cwd(),
         env: { ...process.env, OPENROUTER_API_KEY: 'testkey' },
       });
       
       let output = '';
       nodeProcess.stdout.on('data', (data) => {
         output += data.toString();
         if (output.includes('> ')) {
           // When prompt appears, send a complex task
           nodeProcess.stdin.write('write a long essay about artificial intelligence');
           
           // Wait a bit then send ESC key (ASCII 27)
           setTimeout(() => {
             nodeProcess.stdin.write(String.fromCharCode(27));
           }, 1000);
         }
         
         // Check for cancellation message
         if (output.includes('Operation cancelled by user (ESC key)')) {
           nodeProcess.stdin.end();
         }
       });
       
       await new Promise<void>((resolve, reject) => {
         nodeProcess.on('close', (code) => {
           try {
             expect(code).toBe(0);
             expect(output).toContain('Operation cancelled by user (ESC key)');
             resolve();
           } catch (error) {
             reject(error);
           }
         });
       });
     }, 30000); // Longer timeout for this test
   });
   ```

2. Update documentation
   ```markdown
   <!-- In /README.md -->
   ## CLI Usage
   
   ### Cancelling Operations
   
   TinyAgent CLI provides two ways to cancel operations:
   
   - Press **ESC** to cancel the current operation while keeping the CLI session active
   - Press **Ctrl+C** to cancel the current operation or exit the CLI if no operation is running
   ```

3. Add a clear message in the welcome text about cancellation options
   ```typescript
   // In src/cli.ts welcome function
   static welcome(model: string) {
     // Existing welcome message...
     
     console.log(
       chalk.dim('Tip: Press ESC to cancel an operation, or Ctrl+C to exit')
     );
   }
   ```

## Technical Considerations

1. **Cross-platform compatibility**: Ensure ESC key detection works on Windows, macOS, and Linux
2. **Terminal compatibility**: Handle different terminal emulators appropriately
3. **State management**: Ensure the CLI returns to a clean state after cancellation
4. **User experience**: Provide clear feedback when operations are cancelled

## Timeline

- Phase 1 (Raw Mode and ESC Key Detection): 
- Phase 2 (User Interface Improvements):
- Phase 3 (Testing and Documentation): 


## Success Criteria

1. Users can cancel operations using the ESC key without exiting the CLI
2. Clear feedback is provided when operations are cancelled
3. Documentation clearly explains cancellation options
4. All tests pass, including new tests for ESC key cancellation
5. The feature works consistently across different platforms and terminal emulators
