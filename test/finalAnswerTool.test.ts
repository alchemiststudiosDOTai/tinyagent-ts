// tests/finalAnswerTool.test.ts

import { FinalAnswerTool } from "../src/final-answer.tool";

describe("FinalAnswerTool", () => {
  const tool = new FinalAnswerTool();

  /**
   * A handful of representative payloads – proves the tool
   * blindly echoes whatever it receives.
   */
  const cases = [
    "plain string",
    42,
    { foo: "bar", nested: { n: 1 } },
    ["a", 1, false],
    null,
    undefined,
  ] as const;

  it.each(cases)("returns the exact input for %p", async (input) => {
    const output = await tool.forward(input as any);
    expect(output).toStrictEqual(input);
  });
});
