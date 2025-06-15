import { Type, type Static } from "@sinclair/typebox";
import * as Base from "./BaseSchemas";

// Text input
export const ResponseInputText = Type.Object(
  {
    text: Type.String({ description: "The text input to the model" }),
    type: Type.Literal("input_text"),
  },
  { description: "A text input to the model" }
);
export type ResponseInputText = Static<typeof ResponseInputText>;

// Image input
export const ResponseInputImage = Type.Object(
  {
    detail: Type.Union([
      Type.Literal("low"),
      Type.Literal("high"),
      Type.Literal("auto"),
    ]),
    type: Type.Literal("input_image"),
    file_id: Type.Optional(Type.String()),
    image_url: Type.Optional(Type.String()),
  },
  { description: "An image input to the model" }
);
export type ResponseInputImage = Static<typeof ResponseInputImage>;

// File input
export const ResponseInputFile = Type.Object(
  {
    type: Type.Literal("input_file"),
    file_data: Type.Optional(Type.String()),
    file_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    filename: Type.Optional(Type.String()),
  },
  { description: "A file input to the model" }
);
export type ResponseInputFile = Static<typeof ResponseInputFile>;

// Audio input
export const ResponseInputAudio = Type.Object(
  {
    data: Type.String({ description: "Base64-encoded audio data" }),
    format: Type.Union([Type.Literal("mp3"), Type.Literal("wav")]),
    type: Type.Literal("input_audio"),
  },
  { description: "An audio input to the model" }
);
export type ResponseInputAudio = Static<typeof ResponseInputAudio>;

// Input content union
export const ResponseInputContent = Type.Union(
  [ResponseInputText, ResponseInputImage, ResponseInputFile],
  { description: "Text, image, or file input content" }
);
export type ResponseInputContent = Static<typeof ResponseInputContent>;

// Message content list
export const ResponseInputMessageContentList = Type.Array(
  ResponseInputContent,
  { description: "List of content items in a message input" }
);
export type ResponseInputMessageContentList = Static<
  typeof ResponseInputMessageContentList
>;

// Message item
export const ResponseInputMessageItem = Type.Object(
  {
    id: Base.ID,
    content: ResponseInputMessageContentList,
    role: Type.Union([
      Type.Literal("user"),
      Type.Literal("assistant"),
      Type.Literal("system"),
      Type.Literal("developer"),
    ]),
    status: Type.Optional(
      Type.Union([
        Type.Literal("in_progress"),
        Type.Literal("completed"),
        Type.Literal("incomplete"),
      ])
    ),
    type: Type.Literal("message"),
  },
  { description: "A message input to the model" }
);
export type ResponseInputMessageItem = Static<typeof ResponseInputMessageItem>;

// Extended chat message with metadata
export const ChatMessageItem = Type.Intersect(
  [
    ResponseInputMessageItem,
    Type.Object({
      model: Type.Optional(Type.String()),
      created_at: Type.Optional(Base.Timestamp),
      tokens: Type.Optional(Type.Number()),
      token_speed: Type.Optional(Type.Number()),
    }),
  ],
  { description: "A chat message item with extra metadata" }
);
export type ChatMessageItem = Static<typeof ChatMessageItem>;

// Input item union
export const ResponseInputItem = Type.Union(
  [
    ResponseInputAudio,
    ResponseInputText,
    ResponseInputImage,
    ResponseInputFile,
    ResponseInputMessageItem,
  ],
  { description: "An input item to the model" }
);
export type ResponseInputItem = Static<typeof ResponseInputItem>;

// Overall input
export const ResponseInput = Type.Array(ResponseInputItem, {
  description: "Array of input items",
});
export type ResponseInput = Static<typeof ResponseInput>;
