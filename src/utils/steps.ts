export interface TaskStep {
  type: 'task';
  text: string;
}

export interface ThoughtStep {
  type: 'thought';
  text: string;
}

export interface JsonAction {
  type: 'action';
  mode: 'json';
  tool: string;
  args: Record<string, unknown>;
}

export interface CodeAction {
  type: 'action';
  mode: 'code';
  code: string;
}

export type ActionStep = JsonAction | CodeAction;

export interface ObservationStep {
  type: 'observation';
  text: string;
}

export interface ReflexionStep {
  type: 'reflexion';
  text: string;
}

export interface ToolResultStep {
  type: 'tool_result';
  tool: string;
  output: string;
}

export type ScratchStep =
  | TaskStep
  | ThoughtStep
  | ActionStep
  | ObservationStep
  | ReflexionStep
  | ToolResultStep;
