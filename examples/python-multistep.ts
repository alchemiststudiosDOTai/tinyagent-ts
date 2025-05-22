// examples/python-multistep.ts
/**
 * Example: Multi-step Python Execution Workflow
 *
 * This example demonstrates how to use the Python execution tool to perform
 * multiple sequential Python code executions, passing results between steps,
 * handling errors, and combining TypeScript with Python for a practical data
 * processing workflow.
 *
 * Workflow:
 * 1. Generate a list of numbers in Python.
 * 2. Filter the list in Python (e.g., keep only even numbers).
 * 3. Compute statistics (sum, mean) on the filtered list in Python.
 * 4. Handle errors and process results in TypeScript.
 */

import { PythonExec } from '../src/tools/pythonExec';

// Utility to handle Python execution and errors
async function runPythonStep(py: PythonExec, code: string, input?: any) {
  try {
    // The pythonExec method expects an object with code and optional timeoutMs
    // Input passing is not built-in, so we serialize input as JSON and inject it into the code
    const inputCode = input !== undefined
      ? `import json\ninput = json.loads('''${JSON.stringify(input)}''')\n`
      : '';
    const fullCode = inputCode + code + '\nimport json\nprint(json.dumps(result))';
    const stdout = await py.pythonExec({ code: fullCode, timeoutMs: 5000 });
    return JSON.parse(stdout);
  } catch (err) {
    console.error('Python execution error:', err);
    throw err;
  }
}

async function multiStepPythonWorkflow() {
  const py = new PythonExec();

  // Step 1: Generate a list of numbers in Python
  const numbers = await runPythonStep(py, `
result = list(range(1, 21))  # Numbers 1 to 20
  `);
  console.log('Step 1 - Generated numbers:', numbers);

  // Step 2: Filter the list to keep only even numbers
  const evenNumbers = await runPythonStep(py, `
result = [n for n in input if n % 2 == 0]
  `, numbers);
  console.log('Step 2 - Even numbers:', evenNumbers);

  // Step 3: Compute statistics (sum and mean) on the filtered list
  const stats = await runPythonStep(py, `
total = sum(input)
mean = total / len(input) if input else 0
result = {'sum': total, 'mean': mean, 'count': len(input)}
  `, evenNumbers);
  console.log('Step 3 - Statistics:', stats);

  // Step 4: Use the results in TypeScript
  if (stats.count === 0) {
    console.log('No numbers to process.');
  } else {
    console.log(
      `Processed ${stats.count} even numbers. Sum: ${stats.sum}, Mean: ${stats.mean}`
    );
  }
}

// Run the workflow
multiStepPythonWorkflow().catch((err) => {
  console.error('Workflow failed:', err);
});

/**
 * This example shows:
 * - Multiple sequential Python executions
 * - Passing results between steps
 * - Error handling in both Python and TypeScript
 * - A practical data processing workflow
 *
 * See also: docs/defualt-tools.md for documentation.
 */