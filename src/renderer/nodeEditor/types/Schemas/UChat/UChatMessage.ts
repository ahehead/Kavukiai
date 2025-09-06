// v0
import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import type { LMStudioChatPortEvent } from "../LMStudioChatPortEventOrNull";
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

/**
 * LMStudio の finish イベントから UChatMessage を生成
 * 必要な最小項目のみをマッピング（content/text, modelKey, tokens stats）
 */
export function createUChatMessageFromLMStudioFinishEvent(
  evt: Extract<LMStudioChatPortEvent, { type: "finish" }>
): UChatMessage {
  const { result } = evt;
  return {
    role: "assistant",
    content: [{ type: "text", text: result.content }],
    model: result.modelInfo.modelKey,
    tokensCount: result.status.predictedTokensCount,
    tokensPerSecond: result.status.tokensPerSecond,
  };
}

/** UChatMessage からテキスト部分のみを抽出 */
export const extractTextContent = (msg: UChatMessage): string => {
  return msg.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
};
