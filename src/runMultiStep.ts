import { Agent, LLMMessage } from './agent';
import { findFirstJson } from './utils/json';

export interface MultiStepOptions {
  maxSteps?: number;
}

export interface ToolResultStep {
  tool: string;
  output: string;
}

export async function runMultiStep<I = string, O = string>(
  agent: Agent<I, O>,
  input: I,
  options: MultiStepOptions = {}
): Promise<O> {
  const { maxSteps = 6 } = options;
  const modelName = (agent as any).getModelName();
  const tools = (agent as any).buildToolRegistry();
  const toolCatalog = Object.values(tools)
    .filter((t: any) => t.meta.name !== 'final_answer')
    .map((t: any) => `- ${t.meta.name}: ${t.meta.description}`)
    .join('\n');
  const system = (agent as any).promptEngine.render('agent', { tools: toolCatalog });
  const messages: LLMMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: String(input) }
  ];
  const scratch: ToolResultStep[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const resp = await (agent as any).makeOpenRouterRequest(messages, modelName);
    const reply = resp.choices[0]?.message?.content?.trim() ?? '';
    const jsonStr = findFirstJson(reply);
    if (!jsonStr) {
      // Non JSON => done
      return reply as unknown as O;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return reply as unknown as O;
    }
    if (parsed.tool === 'final_answer') {
      return (parsed.args?.answer ?? '') as unknown as O;
    }
    const selected = tools[parsed.tool];
    if (!selected) {
      return (`Unknown tool: ${parsed.tool}`) as unknown as O;
    }
    let result: any;
    try {
      result = await selected.call(parsed.args);
    } catch (e: any) {
      result = e instanceof Error ? e.message : String(e);
    }
    scratch.push({ tool: parsed.tool, output: String(result) });
    messages.push({ role: 'assistant', content: reply });
    messages.push({ role: 'assistant', content: JSON.stringify({ observation: String(result) }) });
  }
  return (scratch[scratch.length - 1]?.output ?? '') as unknown as O;
}

