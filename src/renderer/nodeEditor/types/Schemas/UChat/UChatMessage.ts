// v0
import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { Timestamp } from "../openai/BaseSchemas";

/** まずは共通3ロールのみ（tool/developerはv1拡張で） */
export const UChatRole = Type.Union([
  Type.Literal("user"),
  Type.Literal("assistant"),
  Type.Literal("system"),
]);
export type UChatRole = Static<typeof UChatRole>;

/** 参照の持ち方は抽象化：URL / プラットフォームID / ローカルパス / 生データ */
export const UFileRef = Type.Union([
  Type.Object({ kind: Type.Literal("url"), url: Type.String() }),
  Type.Object({ kind: Type.Literal("id"), id: Type.String() }),
  Type.Object({ kind: Type.Literal("path"), path: Type.String() }),
  Type.Object({
    kind: Type.Literal("data"),
    data: Type.String(),
    encoding: Type.Union([Type.Literal("base64"), Type.Literal("utf8")]),
  }),
]);
export type UFileRef = Static<typeof UFileRef>;

/** UPart schema */
export const UPart = Type.Union([
  Type.Object({ type: Type.Literal("text"), text: Type.String() }),
  Type.Object({
    type: Type.Literal("image"),
    source: UFileRef,
    detail: Type.Optional(
      Type.Union([
        Type.Literal("low"),
        Type.Literal("high"),
        Type.Literal("auto"),
      ])
    ),
    mime: Type.Optional(Type.String()),
  }),
  Type.Object({
    type: Type.Literal("file"),
    source: UFileRef,
    name: Type.Optional(Type.String()),
    mime: Type.Optional(Type.String()),
  }),
]);
export type UPart = Static<typeof UPart>;

export const UPartArray = Type.Array(UPart);
export type UPartArray = Static<typeof UPartArray>;

/** UChatMessage schema */
export const UChatMessage = Type.Object({
  role: UChatRole,
  // 複数パートを順序保持で格納
  content: Type.Array(UPart),
  // 任意メタ
  id: Type.Optional(Type.String()),
  // 任意メタ
  model: Type.Optional(Type.String()),
  created_at: Type.Optional(Timestamp),
  tokensCount: Type.Optional(Type.Number()),
  tokensPerSecond: Type.Optional(Type.Number()),
});
export type UChatMessage = Static<typeof UChatMessage>;

/** UChat schema */
export const UChat = Type.Array(UChatMessage);
export type UChat = Static<typeof UChat>;

// OpenAI最小型（依存を避けるために必要分だけ再定義）
type EasyInputMessage = {
  role: "user" | "assistant" | "system" | "developer";
  content: string | ResponseInputMessageContentList;
  type?: "message";
};
type ResponseInputMessageContentList = ResponseInputContent[];
type ResponseInputContent =
  | { type: "input_text"; text: string }
  | {
      type: "input_image";
      detail: "low" | "high" | "auto";
      file_id?: string | null;
      image_url?: string | null;
    }
  | {
      type: "input_file";
      file_id?: string | null;
      file_data?: string;
      filename?: string;
    };

export interface OpenAIFileResolver {
  toImage(ref: UFileRef): {
    file_id?: string | null;
    image_url?: string | null;
  }; // 必要ならアップロードしてfile_idを返す
  toFile(
    ref: UFileRef,
    name?: string
  ): { file_id?: string | null; file_data?: string; filename?: string };
}

/** UChat => EasyInputMessage[] */
export function toOpenAIEasy(
  chat: UChat,
  file: OpenAIFileResolver
): EasyInputMessage[] {
  return chat.map<EasyInputMessage>((m) => {
    // 単一textのみなら string、そうでなければ配列
    if (m.content.length === 1 && m.content[0].type === "text") {
      return { role: m.role, content: m.content[0].text, type: "message" };
    }
    const content: ResponseInputMessageContentList =
      m.content.map<ResponseInputContent>((p) => {
        if (p.type === "text") return { type: "input_text", text: p.text };
        if (p.type === "image") {
          const img = file.toImage(p.source);
          return { type: "input_image", detail: p.detail ?? "auto", ...img };
        }
        // file
        const f = file.toFile(p.source, p.name);
        return { type: "input_file", ...f };
      });
    return { role: m.role, content, type: "message" };
  });
}

// LM Studio最小型（必要分のみ）
type ChatHistoryData = { messages: ChatMessageData[] };
type ChatMessageData =
  | { role: "assistant"; content: (TextPart | FilePart)[] }
  | { role: "user"; content: (TextPart | FilePart)[] }
  | { role: "system"; content: (TextPart | FilePart)[] };

type TextPart = { type: "text"; text: string };
type FilePart = {
  type: "file";
  name: string;
  identifier: string;
  sizeBytes?: number;
  fileType?: string;
};

export interface LMFileResolver {
  /** 画像/一般ファイルをLM Studioが扱える identifier に解決する（必要なら保存・コピー） */
  toFilePart(
    ref: UFileRef,
    hint?: { isImage?: boolean; name?: string }
  ): FilePart;
}

/** UChat => ChatHistoryData */
export function toLMHistory(
  chat: UChat,
  file: LMFileResolver
): ChatHistoryData {
  return {
    messages: chat.map<ChatMessageData>((m) => {
      const parts = m.content.map<TextPart | FilePart>((p) => {
        if (p.type === "text") return { type: "text", text: p.text };
        const isImage = p.type === "image";
        const nameHint = p.type === "file" ? p.name : undefined;
        return file.toFilePart(p.source, { isImage, name: nameHint });
      });
      return { role: m.role, content: parts } as ChatMessageData;
    }),
  };
}
