import { Agent, getBrowserTools } from '../src';

/**
 * Example demonstrating the text browser tools for web content consumption
 */
async function browserToolsExample() {
  console.log('=== Browser Tools Example ===\n');

  // Create an agent with ReAct mode
  const agent = new Agent({
    model: {
      name: 'openai/gpt-4o-mini',
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    mode: 'react',
    react: {
      maxSteps: 10,
      enableTrace: true,
    },
  });

  // Register browser tools
  const browserTools = getBrowserTools();
  console.log('Available browser tools:');
  browserTools.forEach(tool => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });
  console.log();

  // Register all browser tools with the agent
  browserTools.forEach(tool => agent.registerTool(tool));

  // Example tasks that demonstrate browser capabilities
  const tasks = [
    // Basic web browsing
    'Visit the Wikipedia homepage and tell me what the main article is today',
    
    // Page navigation
    'Visit a news website like BBC News, then scroll down to see more articles and summarize what topics are covered',
    
    // Search functionality
    'Visit any documentation website and search for "API" to find relevant sections',
    
    // Content analysis
    'Visit a tech blog or news site and find an article about artificial intelligence, then summarize its key points'
  ];

  // Run a simple demonstration task
  const demoTask = 'Visit https://example.com and describe what you see on the page';
  
  try {
    console.log(`Task: ${demoTask}\n`);
    
    const result = await agent.execute(demoTask);
    
    console.log('=== AGENT RESULT ===');
    console.log(`Success: ${result.success}`);
    if (result.data?.answer) {
      console.log(`Answer: ${result.data.answer}`);
    }
    console.log(`Steps: ${result.data?.steps || 'N/A'}`);
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n=== Additional Example Tasks ===');
  console.log('You can also try these tasks with the browser tools:');
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
}

/**
 * Direct browser usage example (without agent)
 */
async function directBrowserExample() {
  console.log('\n=== Direct Browser Usage Example ===\n');
  
  const { VisitPageTool, PageDownTool, FindOnPageTool } = await import('../src/tools/browser-tools');
  
  const visitTool = new VisitPageTool();
  const pageDownTool = new PageDownTool();
  const findTool = new FindOnPageTool();
  
  try {
    // Visit a page
    console.log('1. Visiting example.com...');
    const visitResult = await visitTool.execute({ url: 'https://example.com' });
    console.log(visitResult.slice(0, 500) + '...\n');
    
    // Scroll down
    console.log('2. Scrolling down...');
    const scrollResult = await pageDownTool.execute({});
    console.log(scrollResult.slice(0, 300) + '...\n');
    
    // Search for text
    console.log('3. Searching for "domain"...');
    const searchResult = await findTool.execute({ search_string: 'domain' });
    console.log(searchResult.slice(0, 400) + '...\n');
    
  } catch (error) {
    console.error('Error in direct browser example:', error instanceof Error ? error.message : String(error));
  }
}

// Run the examples
if (require.main === module) {
  (async () => {
    await browserToolsExample();
    await directBrowserExample();
  })().catch(console.error);
}

export { browserToolsExample, directBrowserExample };