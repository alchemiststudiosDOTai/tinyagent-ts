// src/triageAgent.ts
import "reflect-metadata";
import { Agent } from "./agent";
import { FinalAnswerArgs } from "./final-answer.tool";
import { META_KEYS, ToolMetadata, model } from "./decorators";

/**
 * A minimal agent that simply lists available tools and prompts the user
 * to choose which one to run. This can be used as an initial triage step
 * before invoking a more capable agent.
 */
@model("qwen/qwen2-72b-instruct")
export class TriageAgent extends Agent<string> {
  /**
   * Returns a message listing all tools defined on this agent class.
   * The user can then pick the best tool for their task.
   */
  async run(_input: string): Promise<FinalAnswerArgs> {
    const tools: ToolMetadata[] =
      Reflect.getMetadata(META_KEYS.TOOLS, this.constructor) || [];
    const list = tools
      .map((t) => `- ${t.name}: ${t.description}`)
      .join("\n");
    return { answer: `hey here are the tools you have, choose the best one for the task:\n${list}` };
  }
}
