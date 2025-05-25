// Simple test to verify CLI modules work
const { CLIFormatter } = require('./src/cli/formatter.ts');

console.log('Testing CLI modules...');
CLIFormatter.welcome('test-model');
console.log('CLI modules work!'); 