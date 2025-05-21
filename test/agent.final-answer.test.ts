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

  it('continues after unknown tool and returns final answer', async () => {
    const agent = new CalcAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"add","args":{"a":1,"b":2}}' } }] },
      { choices: [{ message: { content: '{"tool":"FINISH","args":{"answer":"3"}}' } }] },
      { choices: [{ message: { content: '{"tool":"final_answer","args":{"answer":"3"}}' } }] },
    ];
    jest
      .spyOn(agent as any, 'makeOpenRouterRequest')
      .mockImplementation(async () => responses.shift()!);

    const out = await agent.run('Add 1 and 2');
    expect(out).toEqual({ answer: '3' });
  });

  it('stops after two unknown tool calls', async () => {
    const agent = new CalcAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"bogus","args":{}}' } }] },
      { choices: [{ message: { content: '{"tool":"none","args":{}}' } }] },
      { choices: [{ message: { content: '{"tool":"final_answer","args":{"answer":"ok"}}' } }] },
    ];
    jest
      .spyOn(agent as any, 'makeOpenRouterRequest')
      .mockImplementation(async () => responses.shift()!);

    const out = await agent.run('Add 1 and 2');
    expect(out.answer).toContain('too many bad tool calls');
  });

  it('stops after two invalid tool calls', async () => {
    const agent = new CalcAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"add","args":{"a":1}}' } }] },
      { choices: [{ message: { content: '{"tool":"add","args":{"a":2}}' } }] },
      { choices: [{ message: { content: '{"tool":"final_answer","args":{"answer":"ok"}}' } }] },
    ];
    jest.spyOn(agent as any, 'makeOpenRouterRequest').mockImplementation(async () => responses.shift()!);
    const out = await agent.run('Add 1 and 2');
    expect(out.answer).toContain('too many bad tool calls');
  });

  it('handles malformed final_answer JSON', async () => {
    const agent = new CalcAgent();
    const bad = { choices: [{ message: { content: '{"tool":"final_answer"}' } }] };
    const goodObj = { tool: 'final_answer', args: { answer: 'fixed' } };
    jest
      .spyOn(agent as any, 'makeOpenRouterRequest')
      .mockImplementationOnce(async () => bad)
      .mockImplementationOnce(async () => ({ choices: [{ message: { content: JSON.stringify(goodObj) } }] }));
    jest.spyOn(agent as any, 'retryWithFixRequest').mockResolvedValue({ fixed: JSON.stringify(goodObj), fixedParsed: goodObj });
    const out = await agent.run('Add');
    expect(out).toEqual({ answer: 'fixed' });
  });

  it('truncates long observations', async () => {
    @model('test-model')
    class BigAgent extends Agent<string> {
      @tool('big', z.object({}))
      big() {
        return 'x'.repeat(4000);
      }
    }
    const agent = new BigAgent();
    const responses = [
      { choices: [{ message: { content: '{"tool":"big","args":{}}' } }] },
      { choices: [{ message: { content: '{"tool":"final_answer","args":{"answer":"done"}}' } }] },
    ];
    jest.spyOn(agent as any, 'makeOpenRouterRequest').mockImplementation(async () => responses.shift()!);
    const out = await agent.run('do big');
    const mem = (agent as any).memory;
    const last = mem[mem.length - 2]?.content || '';
    expect(last).toContain('<too large to show>');
    expect(out).toEqual({ answer: 'done' });
  });
});
