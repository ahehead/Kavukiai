import comfyuiTemplate from "src/resources/public/templates/ComfyUI/ComfyUI_Template.png?url";
import lmstudioTemplate from "src/resources/public/templates/LMStudio/LM_Studio_template.png?url";
import eroImagerEN from "src/resources/public/templates/Prompt/ero_imager_en.md?raw";
import eroImagerJA from "src/resources/public/templates/Prompt/ero_imager_ja.md?raw";
import eroWriterEN from "src/resources/public/templates/Prompt/ero_writer_template.en.md?raw";
import eroWriterJA from "src/resources/public/templates/Prompt/ero_writer_template.md?raw";
import stringTemplatePng from "src/resources/public/templates/String/String_Template.png?url";
import stringJoinPng from "src/resources/public/templates/String/string_join.png?url";
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
    descriptionMd:
      "{{ }} というプレースホルダーを使って文字列を置き換えることができる。",
  },
  {
    id: "string-join-01",
    title: "String Join",
    genre: "String",
    tags: ["array", "join", "separator"],
    type: "PNGWorkflow",
    src: stringJoinPng,
    descriptionMd: "文字列の配列から、連結した文字列を作成する。",
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
    id: "nsfw-porn-novel-writer",
    title: "nsfw porn novel writer Template",
    genre: "Prompt",
    tags: ["prompt", "novel", "nsfw"],
    type: "Prompt",
    prompt: {
      ja: eroWriterJA,
      en: eroWriterEN,
    },
    descriptionMd:
      "小説生成プロンプト。参照元: [goalseek_ad](https://github.com/kgmkm/goalseek_ad/blob/main/init_writer.txt)",
  },
  {
    id: "nsfw-porn-novel-image",
    title: "nsfw porn novel image Template",
    genre: "Prompt",
    tags: ["prompt", "novel", "nsfw"],
    type: "Prompt",
    prompt: {
      ja: eroImagerJA,
      en: eroImagerEN,
    },
    descriptionMd:
      "プロンプト生成プロンプト。参照元: [goalseek_ad](https://github.com/kgmkm/goalseek_ad/blob/main/init_imager.txt)",
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
