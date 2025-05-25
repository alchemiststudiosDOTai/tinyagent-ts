import { pythonExecTool } from '../src/tools/pythonExec';

describe('Python Execution Tool Test', () => {
  it('should execute basic Python code', async () => {
    const result = await pythonExecTool.execute({
      code: 'print("Hello from Python!")',
      timeoutMs: 5000
    });
    
    expect(result).toBe('Hello from Python!');
  }, 10000);

  it('should handle mathematical calculations', async () => {
    const result = await pythonExecTool.execute({
      code: `
result = 15 * 8 + 12
print(f"Calculation result: {result}")
`,
      timeoutMs: 5000
    });
    
    expect(result).toContain('132');
  }, 10000);

  it('should handle data processing', async () => {
    const result = await pythonExecTool.execute({
      code: `
import json
data = [1, 2, 3, 4, 5]
squared = [x**2 for x in data]
print(json.dumps({"original": data, "squared": squared}))
`,
      timeoutMs: 5000
    });
    
    expect(result).toContain('"squared": [1, 4, 9, 16, 25]');
  }, 10000);

  it('should handle string manipulation', async () => {
    const result = await pythonExecTool.execute({
      code: `
text = "hello world"
processed = text.upper().replace(" ", "_")
print(f"Processed: {processed}")
`,
      timeoutMs: 5000
    });
    
    expect(result).toBe('Processed: HELLO_WORLD');
  }, 10000);

  it('should handle errors gracefully', async () => {
    const result = await pythonExecTool.execute({
      code: 'print(undefined_variable)',
      timeoutMs: 5000
    });
    
    expect(result).toContain('PythonExec error:');
    expect(result).toContain('NameError');
  }, 10000);

  it('should respect timeout limits', async () => {
    const result = await pythonExecTool.execute({
      code: `
import time
time.sleep(10)
print("This should timeout")
`,
      timeoutMs: 2000
    });
    
    expect(result).toContain('PythonExec error:');
  }, 15000);

  it('should handle complex data structures', async () => {
    const result = await pythonExecTool.execute({
      code: `
import datetime
import json

data = {
    "timestamp": str(datetime.datetime.now()),
    "users": [
        {"name": "Alice", "age": 30},
        {"name": "Bob", "age": 25}
    ],
    "total_users": 2
}

print(json.dumps(data, indent=2))
`,
      timeoutMs: 5000
    });
    
    expect(result).toContain('"name": "Alice"');
    expect(result).toContain('"total_users": 2');
  }, 10000);

  it('should validate schema constraints', () => {
    const schema = pythonExecTool.schema;
    
    // Test valid input
    const validResult = schema.safeParse({
      code: 'print("valid")',
      timeoutMs: 5000
    });
    expect(validResult.success).toBe(true);
    
    // Test code too long
    const longCodeResult = schema.safeParse({
      code: 'print("x")' + 'x'.repeat(4000),
      timeoutMs: 5000
    });
    expect(longCodeResult.success).toBe(false);
    
    // Test timeout too short
    const shortTimeoutResult = schema.safeParse({
      code: 'print("test")',
      timeoutMs: 100
    });
    expect(shortTimeoutResult.success).toBe(false);
  });
});