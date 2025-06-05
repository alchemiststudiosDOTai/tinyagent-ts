import "dotenv/config";
import { MathAgent } from "../examples/math-agent";

(async () => {
  const agent = new MathAgent();
  const q = "What is 3 multiplied by 4?";
  try {
    const answer = await agent.run(q);
    console.log("Agent reply:", answer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error:", msg);
  }
})(); 