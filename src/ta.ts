import "dotenv/config";
import { MultiplierAgent } from "./multiplierAgent";

(async () => {
  const agent = new MultiplierAgent({ systemPromptFile: process.argv[2] });
  const q = "What is 3 multiplied by 4?";
  try {
    const answer = await agent.run(q);
    console.log("Agent reply:", answer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error:", msg);
  }
})();
