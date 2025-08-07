import { type Static, Type } from "@sinclair/typebox";
import { Role } from "./openai/InputSchemas";
import {
  ResponseOutputMessage,
  type ResponseOutputRefusal,
  type ResponseOutputText,
} from "./openai/ResponseSchemas";

// チャットメッセージのコンテンツ
export const ChatMessageItemContent = Type.Union([
  Type.Object({
    type: Type.Literal("input_text"),
    text: Type.String(),
  }),
]);

export type ChatMessageItemContent = Static<typeof ChatMessageItemContent>;

export function isTextContent(
  content: ChatMessageItemContent | ResponseOutputText | ResponseOutputRefusal
) {
  return content.type === "input_text" || content.type === "output_text";
}

// 簡易チャットメッセージ
// contentが文字列
export const EasyChatMessage = Type.Object({
  id: Type.Optional(Type.String()),
  role: Role,
  content: Type.String(),
  type: Type.Literal("message"),
});

export type EasyChatMessage = Static<typeof EasyChatMessage>;

export function isEasyChatMessage(
  item: ChatMessageItem
): item is EasyChatMessage {
  return typeof item.content === "string";
}

// openaiのoutputのメッセージ、roleはassistantで特有のoutput
export const OutputMessage = ResponseOutputMessage;

export function isOutputMessage(
  item: ChatMessageItem
): item is Static<typeof OutputMessage> {
  return (
    item.role === "assistant" &&
    Array.isArray(item.content) &&
    item.content.some((c) => c.type === "output_text")
  );
}

// 通常のチャットメッセージ
// contentが配列
export const NormalChatMessage = Type.Object({
  id: Type.Optional(Type.String()),
  role: Role,
  content: Type.Array(ChatMessageItemContent),
  type: Type.Literal("message"),
});

export type NormalChatMessage = Static<typeof NormalChatMessage>;

export function isNormalChatMessage(
  item: ChatMessageItem
): item is NormalChatMessage {
  return Array.isArray(item.content);
}

// chat用type EasyChatMessage | NormalChatMessage | OutputMessage
export const ChatMessageItem = Type.Union([
  EasyChatMessage,
  NormalChatMessage,
  OutputMessage,
]);
export type ChatMessageItem = Static<typeof ChatMessageItem>;

// チャットメッセージのリスト
export const ChatMessageItemList = Type.Array(ChatMessageItem);
export type ChatMessageItemList = Static<typeof ChatMessageItemList>;

export function chatMessageToString(msg: ChatMessageItem): string {
  if (isEasyChatMessage(msg)) return msg.content;
  if (isNormalChatMessage(msg)) {
    return msg.content
      .filter(isTextContent)
      .map((c) => c.text)
      .join("\n");
  }
  return "";
}
