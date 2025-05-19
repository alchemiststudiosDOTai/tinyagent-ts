import { FinalAnswerTool } from "../src/final-answer.tool";

/**
 * Basic test to ensure FinalAnswerTool returns exactly the input it receives.
 */
async function runFinalAnswerToolTest(): Promise<void> {
  console.log("--- Running FinalAnswerTool Test ---");

  const tool = new FinalAnswerTool();
  const answer = "test answer";

  const result = await tool.forward(answer);
  console.log(`Tool returned: "${result}"`);

  if (result === answer) {
    console.log("✅ TEST PASSED: FinalAnswerTool returned the input verbatim.");
  } else {
    console.error("❌ TEST FAILED: FinalAnswerTool did not return the input.");
    process.exit(1);
  }

  console.log("--- FinalAnswerTool Test Finished ---");
}

runFinalAnswerToolTest();
