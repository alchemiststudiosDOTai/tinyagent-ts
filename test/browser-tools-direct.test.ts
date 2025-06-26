import {
  VisitPageTool,
  PageDownTool,
  FindOnPageTool,
} from '../src/tools/browser-tools';

describe('Browser Tools Direct', () => {
  it('should work without LLM for basic web fetching', async () => {
    await testBrowserDirectly();
  }, 30000);
});

async function testBrowserDirectly() {
  console.log('🌐 Testing Browser Tools Directly (No LLM)\n');

  const visitTool = new VisitPageTool();
  const pageDownTool = new PageDownTool();
  const findTool = new FindOnPageTool();

  try {
    console.log('1️⃣ Visiting https://tinyagent.xyz/...\n');
    const visitResult = await visitTool.execute({
      url: 'https://tinyagent.xyz/',
    });

    console.log('📄 Visit Result:');
    console.log('-'.repeat(50));
    console.log(
      visitResult.slice(0, 1000) +
        (visitResult.length > 1000 ? '\n... (truncated)' : '')
    );
    console.log('-'.repeat(50));

    console.log('\n2️⃣ Scrolling down to see more content...\n');
    const scrollResult = await pageDownTool.execute({});

    console.log('📄 Scroll Result:');
    console.log('-'.repeat(50));
    console.log(
      scrollResult.slice(0, 1000) +
        (scrollResult.length > 1000 ? '\n... (truncated)' : '')
    );
    console.log('-'.repeat(50));

    console.log('\n3️⃣ Searching for "agent" on the page...\n');
    const searchResult = await findTool.execute({ search_string: 'agent' });

    console.log('🔍 Search Result:');
    console.log('-'.repeat(50));
    console.log(
      searchResult.slice(0, 1000) +
        (searchResult.length > 1000 ? '\n... (truncated)' : '')
    );
    console.log('-'.repeat(50));

    console.log('\n✅ Browser tools test completed successfully!');
  } catch (error) {
    console.error(
      '❌ Error:',
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
if (require.main === module) {
  testBrowserDirectly().catch(console.error);
}
