# Web Search Example

## Detailed Explanation

The `web-search` example demonstrates how to build an agent that can perform real-time web searches, retrieve stock information, and extract and summarize content from web pages. This example showcases the integration of multiple tools—such as DuckDuckGo search, Yahoo Finance, and HTML content extraction—into a single agent powered by a language model. The agent can answer complex queries that require up-to-date information from the internet, such as generating research notes on companies by combining live stock data and the latest news.

Key features:
- **Stock Quote Retrieval:** Fetches the latest price, percent change, and market cap for a given stock symbol using Yahoo Finance.
- **Web Search:** Uses DuckDuckGo to find relevant news articles or web pages for a given query.
- **Content Extraction:** Downloads and extracts plain text from web pages for further analysis or summarization.
- **Agent Orchestration:** Combines these tools in a language model agent that can reason about which tools to use and how to synthesize the results.

---

## Code Breakdown

### 1. Environment Setup

```ts
import * as dotenv from 'dotenv';
dotenv.config();
```
Loads environment variables (such as API keys) from a `.env` file.

### 2. Tool Definitions

#### a. StockResearchTools

A class containing three main tools, each decorated with `@tool`:

- **stockQuote:**  
  Fetches the latest stock quote for a given symbol using Yahoo Finance.

- **topNewsUrl:**  
  Performs a DuckDuckGo search and returns the URL of the top non-Wikipedia result for a given query.

- **fetchPage:**  
  Downloads the HTML of a given URL and extracts the plain text content (up to a configurable length).

#### b. Tool Implementation Details

- **Rate Limiting:**  
  The DuckDuckGo search tool includes basic retry logic and exponential backoff to avoid being blocked.

- **Text Extraction:**  
  Uses `jsdom` to parse HTML and extract readable text from the page body.

### 3. Agent Wiring

#### a. StockResearchAgent

```ts
@model("openai/gpt-4.1-mini")
export class StockResearchAgent extends Agent { ... }
```
- Inherits from the base `Agent` class.
- Instantiates `StockResearchTools` and exposes its methods as agent tools.
- Each tool is re-exposed with logging for traceability.

### 4. Demo Usage

The script includes a demo block that runs if the file is executed directly:

- Instantiates the agent.
- Sends a prompt asking for a research note on a specific stock (e.g., AMC Entertainment).
- The agent:
  - Fetches the latest stock data.
  - Searches for the latest news.
  - Downloads and summarizes the news article.
  - Returns a structured JSON response.

---

## Customization Instructions

You can customize the `web-search` example in several ways:

### 1. Change the Search Engine

- Replace the `duck-duck-scrape` package in the `topNewsUrl` tool with another search API (e.g., Bing, Google Custom Search).
- Update the import and the logic in the `topNewsUrl` method accordingly.

### 2. Modify the Prompt

- In the demo block, change the `query` string to ask for different information, formats, or companies.
- You can prompt the agent to include additional data fields or change the output format.

### 3. Extend or Add Tools

- Add new methods to `StockResearchTools` and expose them via the agent.
- For example, add a tool to fetch financial statements, perform sentiment analysis, or summarize multiple articles.

### 4. Adjust Content Extraction

- Modify the `fetchPage` tool to use a more advanced text extraction library or to extract specific sections (e.g., article body only).
- Change the `maxLength` parameter to control how much text is returned.

### 5. Use a Different Model

- Change the `@model` decorator on `StockResearchAgent` to use a different language model, if supported.

---

## Use Cases

Agents with web search capabilities can be applied to a wide range of practical scenarios, including:

- **Automated Research Reports:**  
  Generate up-to-date research notes on companies, products, or topics by combining live data and recent news.

- **Market Monitoring:**  
  Track stock prices and news for a portfolio of companies, alerting users to significant changes or events.

- **Content Summarization:**  
  Summarize the main points of news articles, blog posts, or other web content for quick consumption.

- **Fact-Checking and Verification:**  
  Cross-reference claims or data points with the latest information available online.

- **Personalized News Aggregation:**  
  Build agents that curate and summarize news based on user interests or watchlists.

---