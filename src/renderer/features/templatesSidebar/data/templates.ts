import comfyuiTemplate from "src/resources/public/templates/ComfyUI/ComfyUI_Template.png?url";
import lmstudio_comfyui_template from "src/resources/public/templates/Hybrid/LM_Studio_And_ComfyUI_Template.png?url";
import jsonSchemaParseTemplatePng from "src/resources/public/templates/JsonSchema/JSON_Schema_Parse_Template.png?url";
import lmstudioTemplate from "src/resources/public/templates/LMStudio/LM_Studio_Template.png?url";
import adoultImagerEN from "src/resources/public/templates/Prompt/ero_imager_en.md?raw";
import adoultImagerJA from "src/resources/public/templates/Prompt/ero_imager_ja.md?raw";
import adultEditorEN from "src/resources/public/templates/Prompt/goalseek_adult_editor.en.md?raw";
import adultEditorJA from "src/resources/public/templates/Prompt/goalseek_adult_editor.ja.md?raw";
import adultWriterEN from "src/resources/public/templates/Prompt/goalseek_adult_writer.en.md?raw";
import adultWriterJA from "src/resources/public/templates/Prompt/goalseek_adult_writer.ja.md?raw";
import imageChatEN from "src/resources/public/templates/Prompt/image_chat.en.md?raw";
import imageChatJA from "src/resources/public/templates/Prompt/image_chat.ja.md?raw";
import interactiveGameEN from "src/resources/public/templates/Prompt/interactive_game.en.md?raw";
import interactiveGameJA from "src/resources/public/templates/Prompt/interactive_game.ja.md?raw";
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
    id: "json-schema-parse",
    title: "JSON Schema Parse Template",
    genre: "JSON Schema",
    tags: ["json", "schema", "parse"],
    type: "PNGWorkflow",
    src: jsonSchemaParseTemplatePng,
    descriptionMd:
      "JSON Schema を使ってテキストから構造化データを抽出するワークフロー。",
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
    descriptionMd: "ComfyUI のワークフローを書き換えるテンプレート",
  },
  {
    id: "lmstudio-comfyui-hybrid",
    title: "LM Studio + ComfyUI Hybrid Template",
    genre: "Hybrid",
    tags: ["lmstudio", "comfyui", "local", "llm", "image", "workflow"],
    type: "PNGWorkflow",
    src: lmstudio_comfyui_template,
    descriptionMd:
      "LM Studio と ComfyUI を組み合わせたテンプレート。LM Studio でテキスト生成を行い、その出力を ComfyUI に渡して画像生成を行う。",
  },
  {
    id: "nsfw-porn-novel-editor",
    title: "nefw porn novel editor Template",
    genre: "Prompt",
    tags: ["prompt", "novel", "nsfw"],
    type: "Prompt",
    prompt: {
      ja: adultEditorJA,
      en: adultEditorEN,
    },
    descriptionMd:
      "小説編集者プロンプト。参照元: [goalseek_ad](https://github.com/kgmkm/goalseek_ad/tree/main)",
  },
  {
    id: "nsfw-porn-novel-writer",
    title: "nsfw porn novel writer Template",
    genre: "Prompt",
    tags: ["prompt", "novel", "nsfw"],
    type: "Prompt",
    prompt: {
      ja: adultWriterJA,
      en: adultWriterEN,
    },
    descriptionMd:
      "小説生成プロンプト。参照元: [goalseek_ad](https://github.com/kgmkm/goalseek_ad/tree/main)",
  },
  {
    id: "nsfw-porn-novel-image",
    title: "nsfw porn novel image Template",
    genre: "Prompt",
    tags: ["prompt", "novel", "nsfw"],
    type: "Prompt",
    prompt: {
      ja: adoultImagerJA,
      en: adoultImagerEN,
    },
    descriptionMd:
      "画像生成プロンプトの作成。参照元: [goalseek_ad](https://github.com/kgmkm/goalseek_ad/tree/main)",
  },
  {
    id: "image-chat-prompt",
    title: "Image Chat Prompt",
    genre: "Prompt",
    tags: ["prompt", "chat", "nsfw"],
    type: "Prompt",
    prompt: {
      ja: imageChatJA,
      en: imageChatEN,
    },
    descriptionMd:
      "イメージプレイチャット用プロンプト。参照元: [robo-robo](https://note.com/robo_robo_9/n/nef5345f312d7)",
  },
  {
    id: "interactive-text-adventure-game",
    title: "Interactive Text Adventure Game",
    genre: "Prompt",
    tags: ["prompt", "game"],
    type: "Prompt",
    prompt: {
      ja: interactiveGameJA,
      en: interactiveGameEN,
    },
    descriptionMd:
      "インタラクティブなテキストアドベンチャーゲーム用プロンプト。参照元: [ぬるぽらぼ](https://note.com/nullpolab/n/n738c84e2110e)",
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
