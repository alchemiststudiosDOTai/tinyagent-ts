// prompt_engine.ts (cleaned — new branch wins)
// -----------------------------------------------------
// Lightweight prompt‑template engine with file‑based loading support.
// • Ships with default templates (markdown files + hard‑coded greeting)
// • Lets callers override / extend in code or via markdown files & folders
// • Designed for QA‑agent workflows, no external dependencies beyond Node fs/path

import fs from 'fs';
import path from 'path';

export type TemplateData = Record<string, unknown>;
export type TemplateFn = (data?: TemplateData) => string;
export type TemplateRegistry = Record<string, TemplateFn>;

// -----------------------------------------------------
// Helper: load every .md file in a directory as a template
// -----------------------------------------------------
function compileTemplate(content: string): TemplateFn {
  return (data: TemplateData = {}): string =>
    content.replace(/{{\s*(\w+)\s*}}/g, (_, k) =>
      k in data ? String(data[k]) : ''
    );
}

function loadTemplatesFromDir(dir: string): TemplateRegistry {
  const templates: TemplateRegistry = {};
  if (!fs.existsSync(dir)) return templates;

  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith('.md')) continue;
    const key = path.basename(fileName, '.md');
    const content = fs.readFileSync(path.join(dir, fileName), 'utf-8');
    templates[key] = compileTemplate(content);
  }
  return templates;
}

// Core system prompt directory (relative to this file)
// Check multiple possible locations to support both development and npm package environments
function findPromptsDir() {
  const possiblePaths = [
    // Source code structure
    path.join(__dirname, 'core', 'prompts', 'system'),
    // npm package structure when including src/core/prompts
    path.join(__dirname, '..', 'src', 'core', 'prompts', 'system'),
    // Fallback for other possible structures
    path.join(process.cwd(), 'node_modules', 'tinyagent-ts', 'src', 'core', 'prompts', 'system')
  ];
  
  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  
  // Log an error but don't throw yet - we'll throw when a template is actually requested
  console.error('Warning: Could not find prompt templates directory. Agent may not function correctly.');
  return possiblePaths[0]; // Return the first path as a fallback
}

const systemPromptDir = findPromptsDir();

// -----------------------------------------------------
// Built‑in template registry (markdown + hardcoded)
// -----------------------------------------------------
export const defaultTemplates: TemplateRegistry = {
  ...loadTemplatesFromDir(systemPromptDir),
  greeting: ({ user = 'friend' } = {}): string =>
    `👋 Hey ${user}, how can I help?`,
};

// -----------------------------------------------------
// PromptEngine class
// -----------------------------------------------------
export class PromptEngine {
  private templates: TemplateRegistry;

  constructor(
    overrides: Partial<TemplateRegistry> = {},
    fileOverrides: Record<string, string> = {}
  ) {
    // User overrides win, but defaultTemplates stay untouched
    this.templates = { ...defaultTemplates } as TemplateRegistry;
    // Apply any overrides that are defined
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        this.templates[key] = value;
      }
    });
    this.applyFileOverrides(fileOverrides);
  }

  /** Render a template by key */
  render(name: string, data?: TemplateData): string {
    const tpl = this.templates[name];
    if (!tpl) throw new Error(`Prompt template “${name}” not found`);
    return tpl(data);
  }

  /** Register brand‑new template (fails if key exists) */
  register(name: string, template: TemplateFn): void {
    if (name in this.templates)
      throw new Error('already exists — use overwrite()');
    this.templates[name] = template;
  }

  /** Overwrite existing or create new template unconditionally */
  overwrite(name: string, template: TemplateFn): void {
    this.templates[name] = template;
  }

  // -------------------------------------------------
  // File helpers (Markdown‑driven workflows)
  // -------------------------------------------------

  /** Register template from a markdown file (fails if key exists) */
  registerFromFile(name: string, filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    this.register(name, compileTemplate(content));
  }

  /** Load every .md file in dir as new templates (fails on duplicates) */
  loadDir(dir: string): void {
    const loaded = loadTemplatesFromDir(dir);
    for (const [k, v] of Object.entries(loaded)) {
      if (k in this.templates)
        throw new Error(`Template ${k} already exists — use overwrite()`);
      this.templates[k] = v;
    }
  }

  /** Overwrite (or create) template from file */
  overwriteFromFile(name: string, filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    this.overwrite(name, compileTemplate(content));
  }

  /** Apply multiple file overrides at once */
  applyFileOverrides(map: Record<string, string>): void {
    for (const [name, file] of Object.entries(map)) {
      const content = fs.readFileSync(file, 'utf-8');
      this.overwrite(name, compileTemplate(content));
    }
  }
}

// -----------------------------------------------------
// Usage example (delete or wrap in tests)
// -----------------------------------------------------
/*
const engine = new PromptEngine();
console.log(engine.render("greeting", { user: "Fabian" }));
engine.registerFromFile("intro", path.join(__dirname, "prompts", "intro.md"));
console.log(engine.render("intro"));
*/
