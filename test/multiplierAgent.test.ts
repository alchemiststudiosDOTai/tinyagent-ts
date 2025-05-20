import * as dotenv from "dotenv";
dotenv.config();
import { MultiplierAgent } from "../src/multiplierAgent";

// Type-safe, immutable test cases
const testCases = [
  { question: "What is 12 multiplied by 5?", expected: "60" },
  { question: "What is 7 times 8?", expected: "56" },
  { question: "Multiply 0 by 99.", expected: "0" },
  { question: "What is 100 times 1?", expected: "100" },
  // Edge cases
  { question: "What is -3 times 7?", expected: "-21" },
  { question: "Multiply 2.5 by 4.", expected: "10" },
  { question: "What is 123456 times 0?", expected: "0" },
  { question: "Multiply apples by oranges.", expected: "error" }, // Malformed
] as const;

describe("MultiplierAgent", () => {
  let agent: MultiplierAgent;

  beforeAll(() => {
    agent = new MultiplierAgent();
    if (!process.env.RUN_LIVE) {
      // Mock agent.run for CI: deterministic answers
      jest.spyOn(agent, "run").mockImplementation(async (q: string) => {
        if (/apples|oranges/i.test(q)) return "Sorry, I can only multiply numbers.";
        const match = q.match(/(-?\d+(?:\.\d+)?)\D+(-?\d+(?:\.\d+)?)/);
        if (!match) return "Sorry, I can only multiply numbers.";
        const a = Number(match[1]);
        const b = Number(match[2]);
        if (isNaN(a) || isNaN(b)) return "Sorry, I can only multiply numbers.";
        return `The product of ${a} and ${b} is ${a * b}.`;
      });
    }
  });

  testCases.forEach(({ question, expected }) => {
    it(`returns expected result for: "${question}"`, async () => {
      const answer = await agent.run(question);
      if (expected === "error") {
        expect(answer.toLowerCase()).toContain("sorry");
      } else {
        expect(answer).toContain(expected);
      }
    });
  });
});
