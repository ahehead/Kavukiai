import stringTemplatePng from "../../../../resources/public/templates/String/string_templete.png?url";
import type { TemplateMeta, TemplatesByGenre } from "./types";

// NOTE: Add your bundled assets here. Example of importing URLs with Vite:
//   import examplePng from "../../assets/templates/example/example.png?url";
// For now, keep empty or use placeholders. Only PNGWorkflow supports "新規作成" at this time.

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "string-template-01",
    title: "String Template",
    genre: "String",
    tags: ["format", "pattern"],
    type: "PNGWorkflow",
    src: stringTemplatePng,
    descriptionMd: "テンプレートフォーマットパターン",
  },
];

export function groupByGenre(list: TemplateMeta[]): TemplatesByGenre {
  return list.reduce<TemplatesByGenre>((acc, t) => {
    acc[t.genre] ||= [];
    acc[t.genre].push(t);
    return acc;
  }, {});
}

export function getTemplateById(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
