import { execSync } from 'child_process';
import { join } from 'path';
import 'dotenv/config';

describe('Examples E2E Smoke Tests', () => {
  const examplesDir = join(__dirname, '..', 'examples');
  const timeout = 60000; // 60 seconds timeout for each example

  // Skip tests if no API key is provided
  const shouldSkip =
    !process.env.OPENROUTER_API_KEY && !process.env.SMOLAGENTS_E2E;

  beforeAll(() => {
    if (shouldSkip) {
      console.log(
        'Skipping E2E tests: No OPENROUTER_API_KEY or SMOLAGENTS_E2E environment variable'
      );
    }
  });

  const examples = [
    'simple-agent.ts',
    'modes-example.ts',
    'custom-tools-example.ts',
  ];

  examples.forEach((exampleFile) => {
    it(
      `should run ${exampleFile} without returning undefined`,
      async () => {
        if (shouldSkip) {
          return; // Skip if no API key
        }

        const examplePath = join(examplesDir, exampleFile);

        try {
          // Run the example using tsx
          const output = execSync(`npx tsx "${examplePath}"`, {
            encoding: 'utf8',
            timeout: timeout,
            cwd: join(__dirname, '..'),
            env: { ...process.env },
          });

          // Check that output contains meaningful content (Answer: or Response: followed by non-empty text)
          expect(output).toMatch(/(Answer|Response):\s*\S+/);

          // Ensure output doesn't contain "undefined" as an answer
          expect(output).not.toMatch(/(Answer|Response):\s*undefined/);
          expect(output).not.toMatch(/(Answer|Response):\s*null/);
          expect(output).not.toMatch(/No response received/);

          console.log(`✅ ${exampleFile} completed successfully`);
        } catch (error) {
          console.error(`❌ ${exampleFile} failed:`, error);
          throw error;
        }
      },
      timeout
    );
  });

  it('should validate that all examples produce meaningful output', async () => {
    if (shouldSkip) {
      return;
    }

    // Run a simple validation that examples don't crash
    const testImportsPath = join(examplesDir, 'test-imports.ts');

    const output = execSync(`npx tsx "${testImportsPath}"`, {
      encoding: 'utf8',
      timeout: 30000,
      cwd: join(__dirname, '..'),
      env: { ...process.env },
    });

    expect(output).toContain('All API tests passed');
  }, 30000);
});
