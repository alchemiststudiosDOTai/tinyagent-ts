
import { PromptEngine, defaultTemplates } from "../src/promptEngine";
import path from "path";

describe("PromptEngine", () => {
  let engine: PromptEngine;

  beforeEach(() => {
    engine = new PromptEngine();
  });

  it("renders the default greeting", () => {
    expect(engine.render("greeting", { user: "Fabian" }))
      .toBe("👋 Hey Fabian, how can I help?");
  });

  it("allows constructor overrides", () => {
    const custom = new PromptEngine({ greeting: () => "Hi" });
    expect(custom.render("greeting")).toBe("Hi");
  });

  it("registers a new template", () => {
    engine.register("thanks", () => "🙏 Thanks!");
    expect(engine.render("thanks")).toBe("🙏 Thanks!");
  });

  it("throws on duplicate register", () => {
    engine.register("dup", () => "one");
    expect(() => engine.register("dup", () => "two"))
      .toThrow(/already exists/i);
  });

  it("overwrites an existing template", () => {
    engine.overwrite("greeting", () => "Hola");
    expect(engine.render("greeting")).toBe("Hola");
  });

  it("throws on unknown key", () => {
    expect(() => engine.render("doesNotExist"))
      .toThrow(/not found/i);
  });

  it("does not mutate defaultTemplates", () => {
    expect(defaultTemplates.greeting({ user: "Fabian" }))
      .toBe("👋 Hey Fabian, how can I help?");
  });

  it("substitutes placeholders", () => {
    expect(engine.render("agent", { tools: "hammer" }))
      .toContain("hammer");
  });

  it("accepts file-based overrides", () => {
    const customFile = path.join(__dirname, "fixtures", "customAgent.md");
    const filePE     = new PromptEngine({}, { agent: customFile });

    expect(filePE.render("agent", { tools: "saw" }))
      .toMatch(/Custom[\s\S]*saw/);
  });
});
