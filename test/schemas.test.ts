import { ToolCallSchema, AssistantReplySchema } from "../src/schemas";

describe("ToolCallSchema", () => {
  it("accepts a valid tool call", () => {
    const data = { tool: "add", args: { a: 1, b: 2 } };
    const result = ToolCallSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects extra keys", () => {
    const data = { tool: "add", args: { a: 1, b: 2 }, foo: 99 };
    const result = ToolCallSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects missing required keys", () => {
    const data = { tool: "add" };
    const result = ToolCallSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const data = { tool: 123, args: "not-an-object" };
    const result = ToolCallSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});


describe("AssistantReplySchema", () => {
  it("accepts a valid tool call", () => {
    const data = { tool: "add", args: { a: 1, b: 2 } };
    const result = AssistantReplySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects extra keys in tool call", () => {
    const data = { tool: "add", args: { a: 1, b: 2 }, foo: 99 };
    const result = AssistantReplySchema.safeParse(data);
    expect(result.success).toBe(false);
  });


  it("rejects missing required keys", () => {
    const data = {};
    const result = AssistantReplySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const data = { tool: 123, args: "not-an-object" };
    const result = AssistantReplySchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});