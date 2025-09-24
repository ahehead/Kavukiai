import comfyuiTemplate from "src/resources/public/templates/ComfyUI/ComfyUI_Template.png?url";
import lmstudioTemplate from "src/resources/public/templates/LMStudio/LMStudio_template.png?url";
import basicSystemPromptEn from "../../../../resources/public/templates/Prompt/system_basic.en.md?raw";
import basicSystemPromptJa from "../../../../resources/public/templates/Prompt/system_basic.md?raw";
import stringJoinPng from "../../../../resources/public/templates/String/string_join.png?url";
import stringTemplatePng from "../../../../resources/public/templates/String/template_replace_string.png?url";
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
    descriptionMd: "プロンプトに値を埋め込むときのパターン",
  },
  {
    id: "string-join-01",
    title: "String Join",
    genre: "String",
    tags: ["array", "join", "separator"],
    type: "PNGWorkflow",
    src: stringJoinPng,
    descriptionMd: "配列の文字列を区切り文字で連結するパターン",
  },
  {
    id: "lmstudio-template",
    title: "LM Studio Template",
    genre: "LM Studio",
    tags: ["lmstudio", "local", "llm"],
    type: "PNGWorkflow",
    src: lmstudioTemplate,
    descriptionMd: "LM Studio を使うテンプレート",
  },
  {
    id: "comfyui-template",
    title: "ComfyUI Template",
    genre: "ComfyUI",
    tags: ["comfyui", "image", "workflow"],
    type: "PNGWorkflow",
    src: comfyuiTemplate,
    descriptionMd: "ComfyUI を使うテンプレート",
  },
  {
    id: "prompt-system-basic",
    title: "Basic System Prompt",
    genre: "Prompt",
    tags: ["prompt", "system", "base"],
    type: "Prompt",
    // Multi-language prompt content.
    prompt: {
      ja: basicSystemPromptJa,
      en: basicSystemPromptEn,
    },
    descriptionMd: `汎用システムプロンプトの基本形。{{domain}} や {{style}} を差し替えて利用します。`,
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
