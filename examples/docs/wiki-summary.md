# Wiki Summary Example

## Detailed Explanation

The `wiki-summary` example demonstrates how to build an agent that can fetch the content of a web page (such as a Wikipedia article) and generate a concise summary using a language model. This example showcases the integration of web scraping and language model reasoning, allowing the agent to extract relevant information from a live web page and distill it into a human-readable summary.

Key features:
- **Web Page Fetching:** Downloads the HTML content of a specified URL.
- **Text Extraction:** Extracts and cleans the main text content from the web page, focusing on the body text.
- **Summarization:** Uses a language model to generate a summary of the extracted content, guided by a user prompt.
- **Agent Orchestration:** Combines these steps in a multi-step agent that can be easily customized for different summarization tasks.

---

## Code Breakdown

### 1. Environment Setup

```ts
import * as dotenv from 'dotenv';
dotenv.config();
```
Loads environment variables from a `.env` file, such as API keys for the language model.

### 2. Imports and Dependencies

```ts
import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { z } from 'zod';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
```
- Uses decorators to define the agent and its tools.
- `MultiStepAgent` provides the agent framework.
- `zod` is used for input validation.
- `node-fetch` and `jsdom` are used to fetch and parse web pages.

### 3. Agent Definition

```ts
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
```
- The agent uses the `openai/gpt-4.1-mini` model.
- The `fetchPage` tool downloads the HTML of the given URL, parses it, and extracts up to 2000 characters of body text for summarization.

### 4. Running the Agent

```ts
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
```
- Instantiates the agent and defines a summarization task for a specific Wikipedia article.
- Runs the agent and prints the summary to the console.

---

## Customization Instructions

You can easily adapt the `wiki-summary` example for different summarization needs:

- **Change the Summarization Prompt:**  
  Modify the `task` string to specify what you want summarized or how you want the summary to be structured. For example:
  ```ts
  const task = 'Summarize the main contributions of Alan Turing from https://en.wikipedia.org/wiki/Alan_Turing';
  ```
  You can ask for summaries of specific sections, key points, or even request a summary in a particular style.

- **Use Different Article Sources:**  
  Change the URL in the `task` to point to any public web page, not just Wikipedia. The agent will attempt to extract and summarize the main body text.

- **Adjust Text Extraction Length:**  
  By default, the agent extracts up to 2000 characters from the web page. You can modify the `.slice(0, 2000)` in the `fetchPage` method to increase or decrease the amount of text processed.

- **Enhance Content Extraction:**  
  For more advanced use, you can improve the text extraction logic (e.g., extracting only the first paragraph, or using more sophisticated HTML parsing) by editing the `fetchPage` method.

---

## Use Cases

Agents like `wiki-summary` are useful for a variety of real-world applications:

- **Research Assistance:**  
  Quickly generate summaries of long articles, papers, or Wikipedia entries to accelerate research and information gathering.

- **Content Curation:**  
  Automatically produce concise digests of web content for newsletters, blogs, or knowledge bases.

- **Accessibility:**  
  Provide simplified summaries of complex web pages for users with cognitive or language barriers.

- **Automated Knowledge Extraction:**  
  Integrate with other systems to extract and summarize information from web sources for downstream analysis or reporting.

- **Education:**  
  Help students and educators by summarizing reference materials or generating study notes from online resources.