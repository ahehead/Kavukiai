export type TemplateType = "Prompt" | "WorkflowJSON" | "PNGWorkflow";

export type TemplateMeta = {
  id: string;
  title: string;
  genre: string;
  tags?: string[];
  type: TemplateType;
  // Renderer-resolvable URL to the asset (png/json/md). Use import.meta.url + new URL or ?url imports.
  src: string;
  // Short markdown description
  descriptionMd?: string;
};

export type TemplatesByGenre = Record<string, TemplateMeta[]>;

