import { VisitPageTool } from '../src/tools/browser-tools';

describe('Tool Schema Validation', () => {
  it('should validate tool schemas correctly', async () => {
    await testToolSchema();
  });
});

async function testToolSchema() {
  console.log('🔧 Testing Tool Schema and Parameter Names\n');

  const visitTool = new VisitPageTool();

  // Check tool properties
  console.log('Tool Name:', visitTool.name);
  console.log('Tool Description:', visitTool.description);
  console.log('Tool Schema:', JSON.stringify(visitTool.schema.shape, null, 2));

  // Test schema validation
  console.log('\n✅ Valid Arguments:');
  try {
    const validArgs = { url: 'https://example.com' };
    const validated = visitTool.schema.parse(validArgs);
    console.log('Input:', validArgs);
    console.log('Validated:', validated);
  } catch (error) {
    console.error('Validation failed:', error);
  }

  console.log('\n❌ Invalid Arguments (missing url):');
  try {
    const invalidArgs = { param1: 'https://example.com' };
    const validated = visitTool.schema.parse(invalidArgs);
    console.log('This should not print');
  } catch (error) {
    console.log(
      'Expected validation error:',
      error.issues?.[0]?.message || error.message
    );
  }

  console.log('\n❌ Invalid Arguments (empty object):');
  try {
    const emptyArgs = {};
    const validated = visitTool.schema.parse(emptyArgs);
    console.log('This should not print');
  } catch (error) {
    console.log(
      'Expected validation error:',
      error.issues?.[0]?.message || error.message
    );
  }
}

if (require.main === module) {
  testToolSchema().catch(console.error);
}
