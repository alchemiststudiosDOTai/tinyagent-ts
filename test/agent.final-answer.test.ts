import { z } from 'zod';
import { Agent } from '../src/agent';
import { model, tool } from '../src/decorators';

describe('final_answer enforcement', () => {
  beforeAll(() => {
    process.env.OPENROUTER_API_KEY ||= 'test';
  });

  @model('test-model')
  class CalcAgent extends Agent<string> {
    @tool('Add numbers', z.object({ a: z.number(), b: z.number() }))
    add({ a, b }: { a: number; b: number }) {
      return String(a + b);
    }
  }

  it('returns final answer when model calls final_answer', async () => {
    const agent = new CalcAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"add","args":{"a":1,"b":2}}' } }] },
      { choices: [{ message: { content: '{"tool":"final_answer","args":{"answer":"3"}}' } }] },
    ];
    jest
      .spyOn(agent as any, 'makeOpenRouterRequest')
      .mockImplementation(async () => responses.shift()!);

    const out = await agent.run('Add 1 and 2');
    expect(out).toEqual({ answer: '3' });
  });

  it('fails when final_answer is not used', async () => {
    const agent = new CalcAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"add","args":{"a":1,"b":2}}' } }] },
      { choices: [{ message: { content: '{"tool":"FINISH","args":{"answer":"3"}}' } }] },
    ];
    jest
      .spyOn(agent as any, 'makeOpenRouterRequest')
      .mockImplementation(async () => responses.shift()!);

    const out = await agent.run('Add 1 and 2');
    expect(out.answer).toMatch(/unknown tool/i);
  });
});
