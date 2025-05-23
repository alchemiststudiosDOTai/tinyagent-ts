import { spawn } from 'child_process';
import * as path from 'path';

describe('CLI Hello World Integration Test', () => {
  it('runs the hello world input and checks for created file message', async () => {
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
        // When prompt appears, send the test input
        nodeProcess.stdin.write('make a hello world file here\n');
      }
      if (
        output.includes('The file') &&
        output.includes('created with the content')
      ) {
        nodeProcess.stdin.end();
      }
    });

    await new Promise<void>((resolve, reject) => {
      nodeProcess.on('close', (code) => {
        try {
          expect(code).toBe(0);
          expect(output).toMatch(
            /The file 'hello_world.txt' has been created with the content 'Hello, World!'/
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }, 10000); // Increased timeout to 10 seconds
});
