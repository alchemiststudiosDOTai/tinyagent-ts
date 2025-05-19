export type TemplateData = Record<string, unknown>;
export type TemplateFn = (data?: TemplateData) => string;

export const defaultTemplates: Record<string, TemplateFn> = {
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
   * Overwrite or create a template unconditionally.
   */
  overwrite(name: string, template: TemplateFn): void {
    this.templates[name] = template;
  }
}
