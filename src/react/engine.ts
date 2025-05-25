import { ModelManager } from '../model';
import { ReActConfig, ReActResult, ReActTool, ActionStep } from './types';
import { ReActStateManager } from './state';
import { parseReActResponse } from './parser';

/**
 * ReAct engine that orchestrates the reasoning and acting loop
 */
export class ReActEngine {
  private modelManager: ModelManager;
  private state: ReActStateManager;
  private tools = new Map<string, ReActTool>();

  constructor(modelManager: ModelManager) {
    this.modelManager = modelManager;
    this.state = new ReActStateManager();
  }

  /**
   * Register a tool for use in ReAct loops
   */
  registerTool(tool: ReActTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): void {
    this.tools.delete(name);
  }

  /**
   * Get all registered tools
   */
  getTools(): ReActTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Execute a ReAct loop
   */
  async execute(
    task: string,
    systemPrompt: string,
    config: ReActConfig = {},
    options: {
      model?: string;
      abortSignal?: AbortSignal;
    } = {}
  ): Promise<ReActResult> {
    const {
      maxSteps = 5,
      enableReflexion = true,
      enableTrace = false,
      onStep,
      onComplete,
    } = config;

    this.state.clear();
    this.state.setTask(task);

    let finalAnswer: any = undefined;
    let usedTool = false;

    try {
      for (let step = 0; step < maxSteps; step++) {
        if (options.abortSignal?.aborted) {
          throw new Error('ReAct execution was aborted');
        }

        // Get current state as messages
        const messages = this.state.toMessages(systemPrompt);

        // Get response from model
        const response = await this.modelManager.chat(messages, {
          model: options.model,
          abortSignal: options.abortSignal,
        });

        // Parse the response
        const parsed = parseReActResponse(response.content);

        // Add thought if present
        if (parsed.thought) {
          this.state.addThought(parsed.thought);
          if (enableTrace) {
            console.log(`Thought: ${parsed.thought}`);
          }
          if (onStep) {
            onStep({ type: 'thought', text: parsed.thought });
          }
        }

        // Process action if present
        let observation = '';
        if (parsed.action) {
          this.state.addAction(parsed.action);
          if (enableTrace) {
            console.log(`Action: ${parsed.action.tool}(${JSON.stringify(parsed.action.args)})`);
          }
          if (onStep) {
            onStep(parsed.action);
          }

          try {
            // Check for final answer
            if (parsed.action.tool === 'final_answer') {
              if (!usedTool) {
                console.warn('final_answer called before any other tool');
              }
              finalAnswer = parsed.action.args;
              observation = JSON.stringify(finalAnswer);
              this.state.addObservation(observation);
              if (enableTrace) {
                console.log(`Observation: ${observation}`);
              }
              if (onStep) {
                onStep({ type: 'observation', text: observation });
              }
              break;
            }

            // Execute tool
            const tool = this.tools.get(parsed.action.tool);
            if (!tool) {
              observation = `Unknown tool: ${parsed.action.tool}`;
            } else {
              // Auto-fill missing arguments from state if possible
              let toolArgs = { ...parsed.action.args };
              if (tool.schema && typeof tool.schema.shape === 'object') {
                const argKeys = Object.keys(tool.schema.shape);
                for (const key of argKeys) {
                  if (toolArgs[key] === undefined) {
                    const lastValue = this.state.getLastArgValue(key);
                    if (lastValue !== undefined) {
                      toolArgs[key] = lastValue;
                    }
                  }
                }
              }

              const result = await tool.execute(toolArgs, options.abortSignal);
              usedTool = true;
              observation = JSON.stringify(result);
            }
          } catch (error) {
            observation = error instanceof Error ? error.message : String(error);
          }

          this.state.addObservation(observation);
          if (enableTrace) {
            console.log(`Observation: ${observation}`);
          }
          if (onStep) {
            onStep({ type: 'observation', text: observation });
          }
        }

        // Reflexion step if enabled
        if (enableReflexion && parsed.action) {
          const reflectMessages = this.state.toMessages(systemPrompt);
          reflectMessages.push({ role: 'user', content: 'Reflect:' });

          if (options.abortSignal?.aborted) {
            throw new Error('ReAct execution was aborted');
          }

          const reflectResponse = await this.modelManager.chat(reflectMessages, {
            model: options.model,
            abortSignal: options.abortSignal,
          });

          const reflectParsed = parseReActResponse(reflectResponse.content);

          if (reflectParsed.reflexion) {
            this.state.addReflexion(reflectParsed.reflexion);
            if (enableTrace) {
              console.log(`Reflexion: ${reflectParsed.reflexion}`);
            }
            if (onStep) {
              onStep({ type: 'reflexion', text: reflectParsed.reflexion });
            }
          }

          // Handle fix action from reflexion
          if (reflectParsed.action) {
            if (reflectParsed.action.tool === 'final_answer') {
              if (!usedTool) {
                console.warn('final_answer called before any other tool');
              }
              finalAnswer = reflectParsed.action.args;
              const obs = JSON.stringify(finalAnswer);
              this.state.addObservation(obs);
              if (enableTrace) {
                console.log(`Observation: ${obs}`);
              }
              if (onStep) {
                onStep({ type: 'observation', text: obs });
              }
              break;
            }

            // Execute fix action
            const tool = this.tools.get(reflectParsed.action.tool);
            let obs = '';
            try {
              if (!tool) {
                obs = `Unknown tool: ${reflectParsed.action.tool}`;
              } else {
                const result = await tool.execute(reflectParsed.action.args || {}, options.abortSignal);
                usedTool = true;
                obs = JSON.stringify(result);
              }
            } catch (error) {
              obs = error instanceof Error ? error.message : String(error);
            }

            if (reflectParsed.thought) {
              this.state.addThought(reflectParsed.thought);
            }
            this.state.addAction(reflectParsed.action);
            this.state.addObservation(obs);

            if (enableTrace) {
              if (reflectParsed.thought) console.log(`Thought: ${reflectParsed.thought}`);
              console.log(`Action: ${reflectParsed.action.tool}(${JSON.stringify(reflectParsed.action.args)})`);
              console.log(`Observation: ${obs}`);
            }

            if (onStep) {
              if (reflectParsed.thought) onStep({ type: 'thought', text: reflectParsed.thought });
              onStep(reflectParsed.action);
              onStep({ type: 'observation', text: obs });
            }
          } else if (reflectParsed.thought) {
            this.state.addThought(reflectParsed.thought);
            if (enableTrace) {
              console.log(`Thought: ${reflectParsed.thought}`);
            }
            if (onStep) {
              onStep({ type: 'thought', text: reflectParsed.thought });
            }
          }
        }
      }

      const result: ReActResult = {
        success: true,
        steps: this.state.getSteps(),
        finalAnswer,
      };

      if (onComplete) {
        onComplete(result);
      }

      return result;
    } catch (error) {
      const result: ReActResult = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        steps: this.state.getSteps(),
        finalAnswer,
      };

      if (onComplete) {
        onComplete(result);
      }

      return result;
    }
  }

  /**
   * Get the current state
   */
  getState(): ReActStateManager {
    return this.state;
  }

  /**
   * Reset the state
   */
  reset(): void {
    this.state.clear();
  }
} 