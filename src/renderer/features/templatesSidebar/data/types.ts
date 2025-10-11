import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export type TemplateType = "Prompt" | "PNGWorkflow";

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

export const TemplateDragPayloadSchema = Type.Object({
  templateId: Type.String(),
  templateType: Type.Union([
    Type.Literal("Prompt"),
    Type.Literal("PNGWorkflow"),
  ] as const),
  prompt: Type.Optional(
    Type.Object({
      language: Type.Union([Type.Literal("ja"), Type.Literal("en")] as const),
      content: Type.String(),
    })
  ),
});

export function parseTemplateDragPayload(
  data: string
): TemplateDragPayload | null {
  try {
    return Value.Parse(TemplateDragPayloadSchema, JSON.parse(data));
  } catch (error) {
    console.error("Failed to parse template drag payload:", error);
    return null;
  }
}
