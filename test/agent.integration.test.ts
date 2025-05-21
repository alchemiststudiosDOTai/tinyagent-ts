import { Agent } from "../src/agent";


describe("Agent Integration - Retry Logic", () => {
  class TestAgent extends Agent<string, any> {
    // Minimal model decorator simulation
    getModelName() {
      return "test-model";
    }
    // No tools for this test
    protected buildToolRegistry() {
      return {};
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
      answer: "42"
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
    // Should match the valid object (schema-validated)
    expect(result).toEqual(expect.objectContaining(validObj));
  });
});