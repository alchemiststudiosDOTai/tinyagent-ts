// tests/finalAnswerTool.test.ts

import { FinalAnswerTool } from "../src/final-answer.tool";

describe("FinalAnswerTool", () => {
  const tool = new FinalAnswerTool();

  const cases = ["result", "42"] as const;

  it.each(cases)("echoes the answer for %p", async (answer) => {
    const output = await tool.forward({ answer });
    expect(output).toStrictEqual({ answer });
  });
});
