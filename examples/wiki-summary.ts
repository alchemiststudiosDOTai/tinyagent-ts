import * as dotenv from 'dotenv';
dotenv.config();

import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { z } from 'zod';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

/**
 * Agent that fetches a web page and summarizes it.
 */
@model('openai/gpt-4.1-mini')
class WikiAgent extends MultiStepAgent<string> {
  @tool('Fetch page text', z.object({ url: z.string() }))
  async fetchPage({ url }: { url: string }): Promise<string> {
    const res = await fetch(url);
    const html = await res.text();
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent?.trim().slice(0, 2000) ?? '';
  }
}

async function runDemo() {
  const agent = new WikiAgent();
  const task = 'Summarize the first paragraph of https://en.wikipedia.org/wiki/Turing_Award';
  console.log(`❓ ${task}`);
  const result = await agent.run(task, { trace: true });
  console.log('✅ Final Answer:', result);
}

if (require.main === module) {
  runDemo();
}
