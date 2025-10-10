export type TemplateType = "Prompt" | "WorkflowJSON" | "PNGWorkflow";

// Multi-language (ja/en) prompt content.
export type PromptContent = {
  ja: string;
  en: string;
};

// Discriminated union so Prompt variant holds multi-lang content while others keep a single src string.
export type TemplateMeta =
  | {
      id: string;
      title: string;
      genre: string;
      tags?: string[];
      type: "Prompt";
      prompt: PromptContent; // multi-language body
      descriptionMd?: string; // markdown description (can include escaped placeholders)
    }
  | {
      id: string;
      title: string;
      genre: string;
      tags?: string[];
      type: Exclude<TemplateType, "Prompt">;
      // Renderer-resolvable URL to the asset (png/json). Use import.meta.url + new URL or ?url imports.
      src: string;
      descriptionMd?: string;
    };

export type TemplatesByGenre = Record<string, TemplateMeta[]>;

export type TemplateDragPayload = {
  templateId: string;
  templateType: TemplateType;
  prompt?: {
    language: keyof PromptContent;
    content: string;
  };
};
