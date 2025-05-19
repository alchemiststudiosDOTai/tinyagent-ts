import { PromptEngine, defaultTemplates } from "../src/promptEngine";
import fs from "fs";
import path from "path";

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`❌ ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

async function run(): Promise<void> {
  console.log("--- PromptEngine Tests ---");

  const engine = new PromptEngine();
  const result = engine.render("greeting", { user: "Fabian" });
  assert(result === "\u{1F44B} Hey Fabian, how can I help?", "Default greeting");

  const custom = new PromptEngine({ greeting: () => "Hi" });
  assert(custom.render("greeting") === "Hi", "Override on init");

  custom.register("thanks", () => "🙏 Thanks!");
  assert(custom.render("thanks") === "🙏 Thanks!", "Register new");

  try {
    custom.register("greeting", () => "oops");
    assert(false, "Duplicate register should throw");
  } catch (err) {
    assert(
      (err as Error).message === "already exists — use overwrite()",
      "Duplicate register error message",
    );
  }

  custom.overwrite("greeting", () => "Hola");
  assert(custom.render("greeting") === "Hola", "Overwrite existing");

  try {
    custom.render("doesNotExist");
    assert(false, "Unknown key should throw");
  } catch (err) {
    assert(
      (err as Error).message === "Prompt template doesNotExist not found",
      "Unknown key error message",
    );
  }

  // ensure defaultTemplates were not mutated
  const unchanged = defaultTemplates.greeting({ user: "Fabian" });
  assert(
    unchanged === "\u{1F44B} Hey Fabian, how can I help?",
    "Default templates remain unchanged",
  );

  // loadDir should import markdown files
  const loader = new PromptEngine();
  loader.loadDir(path.join(__dirname, "../src/core/prompts/system"));
  const agentPrompt = loader.render("agent");
  assert(
    agentPrompt.includes("AI assistant"),
    "loadDir loads markdown templates",
  );

  // registerFromFile should add a new template
  const tmp = path.join(__dirname, "temp.md");
  fs.writeFileSync(tmp, "From file");
  loader.registerFromFile("fromFile", tmp);
  assert(loader.render("fromFile") === "From file", "registerFromFile");
  fs.unlinkSync(tmp);

  console.log("--- All PromptEngine tests passed ---");
}

run();
