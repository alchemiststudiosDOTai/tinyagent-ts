import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
const GOLDEN_MASTER_FILE = path.resolve(
  __dirname,
  'golden-master-react-output.txt'
);
describe('Golden Master Test for Simple React Agent', () => {
  let originalConsoleLog: typeof console.log;
  let consoleOutput: string[] = [];
  beforeAll(() => {
    originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      consoleOutput.push(args.map((arg) => String(arg)).join(' '));
    };
  });
  afterEach(() => {
    consoleOutput = [];
  });
  afterAll(() => {
    console.log = originalConsoleLog;
  });
  it('should match the golden master output', async () => {
    return new Promise<void>((resolve, _reject) => {
      exec(
        `${__dirname}/run-simple-react-agent.sh`,
        (_error, _stdout, _stderr) => {
          const actualOutput = consoleOutput.join('\n').trim();
          let expectedOutput = '';
          if (fs.existsSync(GOLDEN_MASTER_FILE)) {
            expectedOutput = fs.readFileSync(GOLDEN_MASTER_FILE, 'utf8').trim();
          } else {
            fs.writeFileSync(GOLDEN_MASTER_FILE, actualOutput);
            console.log(`Golden master file created at ${GOLDEN_MASTER_FILE}`);
            expectedOutput = actualOutput;
          }
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
        }
      );
    });
  }, 30000);
});
