import { ModelManager } from '../model';
import { ReActConfig, ReActResult, ReActTool, ActionStep } from './types';
import { ReActStateManager } from './state';
import { parseReActResponse } from './parser';
import { validateFinalAnswer } from './schemas';

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

      // Enforce final answer if not provided
      finalAnswer = await this.enforceFinalAnswer(finalAnswer, systemPrompt, options);

      // Validate final answer structure
      try {
        finalAnswer = validateFinalAnswer(finalAnswer);
      } catch (error) {
        throw new Error(`Final answer validation failed: ${error instanceof Error ? error.message : String(error)}`);
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
   * Enforce final answer if not provided by the model
   */
  private async enforceFinalAnswer(
    currentFinalAnswer: any,
    systemPrompt: string,
    options: {
      model?: string;
      abortSignal?: AbortSignal;
    }
  ): Promise<any> {
    // If we already have a final answer, return it
    if (currentFinalAnswer !== undefined) {
      return currentFinalAnswer;
    }

    console.warn('ReAct loop completed without final_answer tool call. Forcing final answer generation.');
    
    // Create a final answer request
    const finalMessages = this.state.toMessages(systemPrompt);
    finalMessages.push({ 
      role: 'user', 
      content: 'You must provide a final answer now using the final_answer tool. Summarize your findings and provide a conclusive response.'
    });

    try {
      const finalResponse = await this.modelManager.chat(finalMessages, {
        model: options.model,
        abortSignal: options.abortSignal,
      });

      const finalParsed = parseReActResponse(finalResponse.content);
      
      if (finalParsed.action && finalParsed.action.tool === 'final_answer') {
        const finalAnswer = finalParsed.action.args;
        this.state.addThought(finalParsed.thought || 'Providing final answer');
        this.state.addAction(finalParsed.action);
        this.state.addObservation(JSON.stringify(finalAnswer));
        return finalAnswer;
      } else {
        // Fallback: create a final answer from the most relevant tool execution result
        const steps = this.state.getSteps();
        const observations = steps.filter(s => s.type === 'observation');
        
        // Try to find the most recent meaningful tool execution result (not action text)
        let answerContent = 'Task completed';
        
        // Look for observations that contain actual results (not action descriptions)
        for (let i = observations.length - 1; i >= 0; i--) {
          const obs = observations[i];
          if (obs.text && !obs.text.startsWith('Action:') && !obs.text.startsWith('{\"answer\":')) {
            try {
              // If observation is JSON, try to extract meaningful content
              const parsed = JSON.parse(obs.text);
              if (typeof parsed === 'string') {
                // If it's a UUID or similar string result, format it nicely
                if (parsed.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                  answerContent = `The generated UUID is: ${parsed}`;
                } else {
                  answerContent = parsed;
                }
                break;
              } else if (parsed && typeof parsed === 'object') {
                answerContent = JSON.stringify(parsed);
                break;
              }
            } catch {
              // If not JSON, use the text directly if it looks meaningful
              if (obs.text.length > 10 && !obs.text.includes('Unknown tool')) {
                answerContent = obs.text;
                break;
              }
            }
          }
        }
        
        // If no meaningful observation found, use the final response
        if (answerContent === 'Task completed' && finalResponse.content) {
          answerContent = finalResponse.content;
        }
        
        const finalAnswer = { answer: answerContent };
        this.state.addThought('Providing final answer based on previous results');
        
        // Create proper ActionStep for final_answer
        const finalAnswerAction: ActionStep = {
          type: 'action',
          mode: 'json',
          tool: 'final_answer',
          args: finalAnswer,
          text: JSON.stringify({ tool: 'final_answer', args: finalAnswer })
        };
        this.state.addAction(finalAnswerAction);
        this.state.addObservation(JSON.stringify(finalAnswer));
        return finalAnswer;
      }
    } catch (error) {
      console.warn('Failed to force final answer:', error);
      return { answer: 'Task completed but final answer generation failed' };
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