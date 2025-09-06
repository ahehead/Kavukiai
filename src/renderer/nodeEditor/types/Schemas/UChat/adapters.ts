// adapters.ts
// UChat から各外部サービス向け形式への変換（adapter）を集約
// - OpenAI (toOpenAIEasy)
// - LM Studio (toLMHistory)
// 依存: UChat / UFileRef スキーマ

import type { UChat, UFileRef } from "./UChatMessage";

// ---------------- OpenAI Adapter ----------------
// OpenAI最小型（依存を避けるために必要分だけ再定義）
// 外部へ export するのは変換関数と FileResolver IF のみ

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

type EasyInputMessage = {
  role: "user" | "assistant" | "system" | "developer";
  content: string | ResponseInputMessageContentList;
  type?: "message";
};

export interface OpenAIFileResolver {
  /** 画像参照を OpenAI image 入力形式へ。必要ならアップロードして file_id を返す */
  toImage(ref: UFileRef): {
    file_id?: string | null;
    image_url?: string | null;
  };
  /** 一般ファイル参照を OpenAI file 入力形式へ。必要ならアップロードして file_id を返す */
  toFile(
    ref: UFileRef,
    name?: string
  ): { file_id?: string | null; file_data?: string; filename?: string };
}

/**
 * UChat => OpenAI (responses API 互換の簡略) メッセージ配列
 * - 単一 text のみなら content は string
 * - 複数パート/非 text を含む場合は配列形式
 */
export function toOpenAIEasy(
  chat: UChat,
  file: OpenAIFileResolver
): EasyInputMessage[] {
  return chat.map<EasyInputMessage>((m) => {
    if (m.content.length === 1 && m.content[0].type === "text") {
      return { role: m.role, content: m.content[0].text, type: "message" };
    }
    const content: ResponseInputMessageContentList = m.content.map(
      (p): ResponseInputContent => {
        if (p.type === "text") return { type: "input_text", text: p.text };
        if (p.type === "image") {
          const img = file.toImage(p.source);
          return { type: "input_image", detail: p.detail ?? "auto", ...img };
        }
        // file
        const f = file.toFile(p.source, p.name);
        return { type: "input_file", ...f };
      }
    );
    return { role: m.role, content, type: "message" };
  });
}

// ---------------- LM Studio Adapter ----------------
// LM Studio最小型（必要分のみ）

interface ChatHistoryData {
  messages: ChatMessageData[];
}

type ChatMessageData =
  | { role: "assistant"; content: (TextPart | FilePart)[] }
  | { role: "user"; content: (TextPart | FilePart)[] }
  | { role: "system"; content: (TextPart | FilePart)[] };

interface TextPart {
  type: "text";
  text: string;
}

interface FilePart {
  type: "file";
  name: string;
  identifier: string;
  sizeBytes?: number;
  fileType?: string;
}

export interface LMFileResolver {
  /** 画像/一般ファイルを LM Studio が扱える identifier に解決（必要なら保存・コピー） */
  toFilePart(
    ref: UFileRef,
    hint?: { isImage?: boolean; name?: string }
  ): FilePart;
}

/** UChat => LM Studio ChatHistoryData */
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

// 追加の adapter が増えたらここへ統合していく
