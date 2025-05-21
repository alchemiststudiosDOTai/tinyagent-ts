import { Agent } from "../src/agent";


describe("Agent Integration - Retry Logic", () => {
  beforeAll(() => {
    process.env.OPENROUTER_API_KEY ||= 'test';
  });
  class TestAgent extends Agent<string> {
    // Minimal model decorator simulation
    getModelName() {
      return "test-model";
    }
  }

  it("retries on invalid output and succeeds on valid output", async () => {
    // Arrange
    const agent = new TestAgent();
    // Mock makeOpenRouterRequest: first call returns invalid, second returns valid
    const invalidResponse = {
      choices: [
        { message: { content: "not a valid json" } }
      ]
    };
    const validObj = {
      tool: "final_answer",
      args: { answer: "42" }
    };
    const validResponse = {
      choices: [
        { message: { content: JSON.stringify(validObj) } }
      ]
    };
    const makeOpenRouterRequestMock = jest
      .spyOn(agent as any, "makeOpenRouterRequest")
      .mockImplementationOnce(async () => invalidResponse)
      .mockImplementationOnce(async () => validResponse);

    // Act
    const result = await agent.run("What is the answer?");

    // Assert
    expect(makeOpenRouterRequestMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ answer: "42" });
  });

  it("continues when the model calls an unknown tool", async () => {
    const agent = new TestAgent();
    const unknown = { choices: [ { message: { content: '{"tool":"bogus","args":{}}' } } ] };
    const final = { choices: [ { message: { content: '{"tool":"final_answer","args":{"answer":"ok"}}' } } ] };
    const mock = jest
      .spyOn(agent as any, "makeOpenRouterRequest")
      .mockImplementationOnce(async () => unknown)
      .mockImplementationOnce(async () => final);

    const result = await agent.run("test");

    expect(mock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ answer: "ok" });
  });
});