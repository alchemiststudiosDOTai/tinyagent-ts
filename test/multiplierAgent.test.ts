import * as dotenv from "dotenv";
dotenv.config(); // Load .env file

// Assuming the MultiplierAgent will be exported from its final location after refactoring
// For now, import directly from the current location
import { MultiplierAgent } from "../src/multiplierAgent";

/**
 * Simple baseline test for MultiplierAgent.
 * Executes the agent with a specific question and checks if the expected result is present in the output.
 */
async function runMultiplierAgentTest(): Promise<void> {
  console.log("--- Running MultiplierAgent Baseline Test ---");

  // Ensure API key is available (Agent constructor also checks this)
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "💥 TEST FAILED: OPENROUTER_API_KEY environment variable is not set.",
    );
    process.exit(1);
  }

  const agent = new MultiplierAgent();
  const question = "What is 12 multiplied by 5? Use your tool.";
  const expectedResultSubstring = "60"; // The core numerical result we expect

  console.log(`❓ Question: "${question}"`);
  console.log(`ակ Expected result substring: "${expectedResultSubstring}"`);

  try {
    const answer = await agent.run(question);
    console.log(`🤖 Agent Raw Answer: "${answer}"`);

    // Basic assertion: Check if the answer string includes the expected number
    if (answer.includes(expectedResultSubstring)) {
      console.log(
        `✅ TEST PASSED: Agent answer contains "${expectedResultSubstring}".`,
      );
    } else {
      console.error(
        `❌ TEST FAILED: Agent answer did not contain "${expectedResultSubstring}".`,
      );
      process.exit(1); // Indicate failure
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("💥 TEST FAILED: Agent run failed with error:", message);
    process.exit(1); // Indicate failure
  } finally {
    console.log("--- MultiplierAgent Baseline Test Finished ---");
  }
}

// Execute the test function
runMultiplierAgentTest();
