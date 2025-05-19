import fs from "fs";
import path from "path";

export type TemplateData = Record<string, unknown>;
export type TemplateFn = (data?: TemplateData) => string;

function loadTemplatesFromDir(dir: string): Record<string, TemplateFn> {
  const result: Record<string, TemplateFn> = {};
  if (!fs.existsSync(dir)) return result;
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".md")) {
      const key = path.basename(file, ".md");
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      result[key] = () => content;
    }
  }
  return result;
}

const systemPromptDir = path.join(__dirname, "core", "prompts", "system");

export const defaultTemplates: Record<string, TemplateFn> = {
  ...loadTemplatesFromDir(systemPromptDir),
  greeting: (data?: TemplateData): string => {
    const user = data?.user ?? "friend";
    return `\u{1F44B} Hey ${user}, how can I help?`;
  },
};

/**
 * Simple string template engine used by the examples.
 * Built-in templates can be overridden or extended.
 */
export class PromptEngine {
  private templates: Record<string, TemplateFn>;

  constructor(overrides: Record<string, TemplateFn> = {}) {
    // Merge without mutating the defaultTemplates constant
    this.templates = { ...defaultTemplates, ...overrides };
  }

  /**
   * Render a template by name using the provided variables.
   * @throws Error when the key does not exist.
   */
  render(name: string, data?: TemplateData): string {
    const tpl = this.templates[name];
    if (!tpl) {
      throw new Error(`Prompt template ${name} not found`);
    }
    return tpl(data);
  }

  /**
   * Register a brand new template. Fails if the key already exists.
   */
  register(name: string, template: TemplateFn): void {
    if (name in this.templates) {
      throw new Error("already exists — use overwrite()");
    }
    this.templates[name] = template;
  }

  /**
   * Register a template from a markdown file.
   */
  registerFromFile(name: string, filePath: string): void {
    const content = fs.readFileSync(filePath, "utf-8");
    this.register(name, () => content);
  }

  /**
   * Load all markdown files in a directory as templates.
   */
  loadDir(dir: string): void {
    Object.entries(loadTemplatesFromDir(dir)).forEach(([k, v]) => {
      if (k in this.templates) {
        throw new Error(`Template ${k} already exists — use overwrite()`);
      }
      this.templates[k] = v;
    });
  }

  /**
   * Overwrite or create a template unconditionally.
   */
  overwrite(name: string, template: TemplateFn): void {
    this.templates[name] = template;
  }

  overwriteFromFile(name: string, filePath: string): void {
    const content = fs.readFileSync(filePath, "utf-8");
    this.templates[name] = () => content;
  }
}
