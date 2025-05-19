import "dotenv/config";
import fs from "fs";
import { MultiplierAgent } from "./multiplierAgent";

const promptPath = process.argv[2] ||
  `${__dirname}/core/prompts/system/agent.md`;
const promptText = fs.readFileSync(promptPath, "utf-8");

(async () => {
  const agent = new MultiplierAgent(promptText);
  const q = "What is 3 multiplied by 4?";
  try {
    const answer = await agent.run(q);
    console.log("Agent reply:", answer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error:", msg);
  }
})();
