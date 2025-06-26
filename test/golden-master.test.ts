import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const GOLDEN_MASTER_FILE = path.resolve(__dirname, 'golden-master-output.txt');

describe('Golden Master Test for Simple Agent', () => {
  let originalConsoleLog: typeof console.log;
  let consoleOutput: string[] = [];

  beforeAll(() => {
    // Mock console.log to capture output
    originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      consoleOutput.push(args.map((arg) => String(arg)).join(' '));
    };
  });

  afterEach(() => {
    consoleOutput = []; // Clear output after each test
  });

  afterAll(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  it('should match the golden master output', async () => {
    return new Promise<void>((resolve, _reject) => {
      exec(`${__dirname}/run-simple-agent.sh`, (_error, _stdout, _stderr) => {
        const actualOutput = consoleOutput.join('\n').trim();
        let expectedOutput = '';

        if (fs.existsSync(GOLDEN_MASTER_FILE)) {
          expectedOutput = fs.readFileSync(GOLDEN_MASTER_FILE, 'utf8').trim();
        } else {
          // If golden master file doesn't exist, create it with current output
          fs.writeFileSync(GOLDEN_MASTER_FILE, actualOutput);
          console.log(`Golden master file created at ${GOLDEN_MASTER_FILE}`);
          expectedOutput = actualOutput;
        }

        // We need to ignore the UUID part of the output as it changes every time
        const actualOutputWithoutUUID = actualOutput.replace(
          /UUID: [0-9a-fA-F-]{36}/,
          'UUID: [UUID_PLACEHOLDER]'
        );
        const expectedOutputWithoutUUID = expectedOutput.replace(
          /UUID: [0-9a-fA-F-]{36}/,
          'UUID: [UUID_PLACEHOLDER]'
        );

        expect(actualOutputWithoutUUID).toEqual(expectedOutputWithoutUUID);
        resolve();
      });
    });
  }, 30000); // Increase timeout for agent execution
});
