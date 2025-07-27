import { type Static, Type } from "@sinclair/typebox";
import { Timestamp } from "./openai/BaseSchemas";
import type { ResponseInput } from "./openai/InputSchemas";
import { Role } from "./openai/InputSchemas";

// Chatメッセージの追加情報
// モデル名、作成日時、トークン数、トークン/秒
export const ChatMessageExtraData = Type.Object({
  model: Type.Optional(Type.String()),
  created_at: Type.Optional(Timestamp),
  tokensCount: Type.Optional(Type.Number()),
  tokensPerSecond: Type.Optional(Type.Number()),
});

export type ChatMessageExtraData = Static<typeof ChatMessageExtraData>;

// チャットメッセージのコンテンツ
export const ChatMessageItemContent = Type.Union([
  Type.Object({
    type: Type.Literal("input_text"),
    text: Type.String(),
  }),
]);

export type ChatMessageItemContent = Static<typeof ChatMessageItemContent>;
export function isInputTextContent(
  content: ChatMessageItemContent
): content is { type: "input_text"; text: string } {
  return content.type === "input_text";
}

// 簡易チャットメッセージ
// contentが文字列
export const EasyChatMessage = Type.Intersect([
  Type.Object({
    id: Type.Optional(Type.String()),
    role: Role,
    content: Type.String(),
    type: Type.Literal("message"),
  }),
  ChatMessageExtraData,
]);

export type EasyChatMessage = Static<typeof EasyChatMessage>;
export function isEasyChatMessage(
  item: ChatMessageItem
): item is EasyChatMessage {
  return typeof item.content === "string";
}

// 通常のチャットメッセージ
// contentが配列
export const NormalChatMessage = Type.Intersect([
  Type.Object({
    id: Type.Optional(Type.String()),
    role: Role,
    content: Type.Array(ChatMessageItemContent),
    type: Type.Literal("message"),
  }),
  ChatMessageExtraData,
]);

export type NormalChatMessage = Static<typeof NormalChatMessage>;
export function isNormalChatMessage(
  item: ChatMessageItem
): item is NormalChatMessage {
  return Array.isArray(item.content);
}

// chat用type EasyChatMessage | NormalChatMessage
export const ChatMessageItem = Type.Union([EasyChatMessage, NormalChatMessage]);
export type ChatMessageItem = Static<typeof ChatMessageItem>;

// チャットメッセージのリスト
export const ChatMessageItemList = Type.Array(ChatMessageItem);
export type ChatMessageItemList = Static<typeof ChatMessageItemList>;

// openaiのResponseInputに変換する関数
export function chatMessagesToResponseInput(
  messages: ChatMessageItemList
): ResponseInput {
  return messages.map(
    ({ model, created_at, tokensCount, tokensPerSecond, ...rest }) => rest
  );
}
