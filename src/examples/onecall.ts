import * as dotenv from "dotenv";
dotenv.config(); // Load .env file

import { z } from "zod";
import { Agent } from "../agent";
import { model, tool } from "../decorators";

/**
 * A simple agent that can fetch and process information with a single call.
 * This agent demonstrates handling a request that only requires one decision or action.
 */
@model("mistralai/mistral-small-3.1-24b-instruct:free")
export class WeatherAgent extends Agent<string, string> {
  /**
   * Gets current weather for a location (simulated).
   */
  @tool("Get current weather", z.object({ location: z.string() }))
  getWeather({ location }: { location: string }): string {
    console.log(`WeatherAgent: Called getWeather tool with location=${location}`);
    
    // This is a simulated response - in a real app, you would call a weather API
    const conditions = ["sunny", "cloudy", "rainy", "windy", "snowy"] as const;
    type WeatherCondition = typeof conditions[number];
    
    const temperatures: Record<WeatherCondition, { min: number; max: number }> = {
      sunny: { min: 75, max: 95 },
      cloudy: { min: 60, max: 75 },
      rainy: { min: 50, max: 65 },
      windy: { min: 55, max: 70 },
      snowy: { min: 20, max: 35 }
    };
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const tempRange = temperatures[condition];
    const temp = Math.floor(Math.random() * (tempRange.max - tempRange.min + 1)) + tempRange.min;
    
    return `Current weather in ${location}: ${condition} with a temperature of ${temp}°F`;
  }
  
  /**
   * Recommends an activity based on weather (simulated).
   */
  @tool("Recommend activity", z.object({ weather: z.string() }))
  recommendActivity({ weather }: { weather: string }): string {
    console.log(`WeatherAgent: Called recommendActivity tool with weather=${weather}`);
    
    // Simple rule-based recommendations
    if (weather.includes("sunny")) {
      return "It's sunny! Great day for hiking, going to the beach, or having a picnic.";
    } else if (weather.includes("cloudy")) {
      return "Cloudy weather is perfect for visiting museums, shopping, or going to a cafe.";
    } else if (weather.includes("rainy")) {
      return "It's rainy. Good time to visit indoor attractions, go to a movie, or stay in with a book.";
    } else if (weather.includes("windy")) {
      return "Windy day! Consider flying a kite, going sailing, or finding indoor activities.";
    } else if (weather.includes("snowy")) {
      return "Snow day! Perfect for skiing, snowboarding, building a snowman, or enjoying hot cocoa inside.";
    } else {
      return "Consider checking out local attractions regardless of the weather!";
    }
  }
}

/**
 * Demo function to run the WeatherAgent with a single query that requires just one tool call.
 */
export async function runOneCallDemo(): Promise<void> {
  // Ensure API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "💥 Error: OPENROUTER_API_KEY environment variable is not set. Please set it in your .env file.",
    );
    process.exit(1);
  }

  const agent = new WeatherAgent();
  
  // This is a query that should only require one tool call to answer
  const query = "What's the weather like in Seattle?";

  console.log("🌦️ Running WeatherAgent OneCall Demo...\n");
  console.log(`❓ Query: "${query}"`);
  
  try {
    const answer = await agent.run(query);
    console.log(`✅ Answer: ${answer}\n`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${message}\n`);
  }
}

// Run the demo if this file is being run directly
if (require.main === module) {
  runOneCallDemo();
}
