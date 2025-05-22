import { z } from 'zod';
import { Agent } from '../src/agent';
import { model, tool } from '../src/decorators';
import { runMultiStep } from '../src/runMultiStep';

describe('runMultiStep', () => {
  beforeAll(() => {
    process.env.OPENROUTER_API_KEY ||= 'test';
  });
  @model('test-model')
  class CalcAgent extends Agent<string> {
    @tool('Add numbers', z.object({ a: z.number(), b: z.number() }))
    add({ a, b }: { a: number; b: number }): string {
      return String(a + b);
    }

    @tool('Multiply numbers', z.object({ a: z.number(), b: z.number() }))
    multiply({ a, b }: { a: number; b: number }): string {
      return String(a * b);
    }
  }

  it('handles two tool calls and final answer', async () => {
    const agent = new CalcAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"add","args":{"a":2,"b":3}}' } }] },
      { choices: [{ message: { content: '{"tool":"multiply","args":{"a":5,"b":6}}' } }] },
      { choices: [{ message: { content: '{"tool":"final_answer","args":{"answer":"30"}}' } }] },
    ];
    jest.spyOn(agent as any, 'makeOpenRouterRequest').mockImplementation(async () => responses.shift()!);
    const out = await runMultiStep(agent, 'Add 2+3 then multiply by 6');
    expect(out.answer).toContain('30');
  });
});

