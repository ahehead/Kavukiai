import { Type, type Static } from "@sinclair/typebox";
import * as Base from "./BaseSchemas";
import { ResponseInputItem } from "./InputSchemas";
import { ServiceTier } from "./ResponseSchemas";

// Text response format schemas
export const TextFormat = Type.Object(
  { type: Type.Literal("text") },
  { description: "The type of response format being defined. Always `text`." }
);
export type TextFormat = Static<typeof TextFormat>;

export const JsonObjectFormat = Type.Object(
  { type: Type.Literal("json_object") },
  { description: "JSON object response format. Older JSON mode." }
);
export type JsonObjectFormat = Static<typeof JsonObjectFormat>;

export const JsonSchemaFormat = Type.Object(
  {
    type: Type.Literal("json_schema"),
    name: Type.String({
      description:
        "The name of the response format. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.",
    }),
    schema: Type.Record(Type.String(), Type.Unknown(), {
      description:
        "The schema for the response format, described as a JSON Schema object.",
    }),
    description: Type.Optional(Type.String()),
    strict: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
  },
  {
    description:
      "JSON Schema response format. Used to generate structured JSON responses. Learn more about Structured Outputs at https://platform.openai.com/docs/guides/structured-outputs.",
  }
);
export type JsonSchemaFormat = Static<typeof JsonSchemaFormat>;

export const ResponseFormatTextConfig = Type.Union(
  [TextFormat, JsonObjectFormat, JsonSchemaFormat],
  {
    description:
      "Configuration for text response format. Can be plain text or structured JSON.",
  }
);
export type ResponseFormatTextConfig = Static<typeof ResponseFormatTextConfig>;

export const ResponseTextConfig = Type.Object(
  { format: Type.Optional(ResponseFormatTextConfig) },
  {
    description:
      "Configuration options for a text response from the model. Can be plain text or structured JSON data.",
  }
);
export type ResponseTextConfig = Static<typeof ResponseTextConfig>;

// Includable fields for create/retrieve
export const ResponseIncludable = Type.Union(
  [
    Type.Literal("file_search_call.results"),
    Type.Literal("message.input_image.image_url"),
    Type.Literal("computer_call_output.output.image_url"),
    Type.Literal("reasoning.encrypted_content"),
  ],
  { description: "Additional output data to include" }
);
export type ResponseIncludable = Static<typeof ResponseIncludable>;

// Base params for create
export const ResponseCreateParamsBase = Type.Object(
  {
    input: Type.Union([Type.String(), Type.Array(ResponseInputItem)]),
    model: Type.String(),
    background: Type.Optional(Base.BooleanOrNull),
    include: Type.Optional(Type.Array(ResponseIncludable)),
    instructions: Type.Optional(Base.NullableString),
    max_output_tokens: Type.Optional(Base.NullableNumber),
    metadata: Type.Optional(Type.Unknown()),
    parallel_tool_calls: Type.Optional(Base.BooleanOrNull),
    previous_response_id: Type.Optional(Base.NullableString),
    reasoning: Type.Optional(Type.Unknown()),
    service_tier: Type.Optional(ServiceTier),
    store: Type.Optional(Base.BooleanOrNull),
    stream: Type.Optional(Type.Boolean()),
    temperature: Type.Optional(Base.NullableNumber),
    text: Type.Optional(ResponseTextConfig),
    tool_choice: Type.Optional(Type.Unknown()),
    tools: Type.Optional(Type.Array(Type.Unknown())),
    top_p: Type.Optional(Base.NullableNumber),
    truncation: Type.Optional(
      Type.Union([Type.Literal("auto"), Type.Literal("disabled")])
    ),
    user: Type.Optional(Type.String()),
  },
  { description: "Base parameters for creating a response" }
);
export type ResponseCreateParamsBase = Static<typeof ResponseCreateParamsBase>;

// Non-streaming create params
export const ResponseCreateParamsNonStreaming = Type.Intersect(
  [
    ResponseCreateParamsBase,
    Type.Object({
      stream: Type.Optional(Type.Union([Type.Literal(false), Type.Null()])),
    }),
  ],
  { description: "Non-streaming create parameters" }
);
export type ResponseCreateParamsNonStreaming = Static<
  typeof ResponseCreateParamsNonStreaming
>;

// Streaming create params
export const ResponseCreateParamsStreaming = Type.Intersect(
  [ResponseCreateParamsBase, Type.Object({ stream: Type.Literal(true) })],
  { description: "Streaming create parameters" }
);
export type ResponseCreateParamsStreaming = Static<
  typeof ResponseCreateParamsStreaming
>;

// Union of create params
export const ResponseCreateParams = Type.Union(
  [ResponseCreateParamsNonStreaming, ResponseCreateParamsStreaming],
  { description: "Parameters for creating a response" }
);
export type ResponseCreateParams = Static<typeof ResponseCreateParams>;

// Base params for retrieve
export const ResponseRetrieveParamsBase = Type.Object(
  {
    include: Type.Optional(Type.Array(ResponseIncludable)),
    starting_after: Type.Optional(Type.Number()),
    stream: Type.Optional(Type.Boolean()),
  },
  { description: "Base parameters for retrieving a response" }
);
export type ResponseRetrieveParamsBase = Static<
  typeof ResponseRetrieveParamsBase
>;

// Non-streaming retrieve params
export const ResponseRetrieveParamsNonStreaming = Type.Intersect(
  [
    ResponseRetrieveParamsBase,
    Type.Object({
      stream: Type.Optional(Type.Union([Type.Literal(false), Type.Null()])),
    }),
  ],
  { description: "Non-streaming retrieve parameters" }
);
export type ResponseRetrieveParamsNonStreaming = Static<
  typeof ResponseRetrieveParamsNonStreaming
>;

// Streaming retrieve params
export const ResponseRetrieveParamsStreaming = Type.Intersect(
  [ResponseRetrieveParamsBase, Type.Object({ stream: Type.Literal(true) })],
  { description: "Streaming retrieve parameters" }
);
export type ResponseRetrieveParamsStreaming = Static<
  typeof ResponseRetrieveParamsStreaming
>;

// Union of retrieve params
export const ResponseRetrieveParams = Type.Union(
  [ResponseRetrieveParamsNonStreaming, ResponseRetrieveParamsStreaming],
  { description: "Parameters for retrieving a response" }
);
export type ResponseRetrieveParams = Static<typeof ResponseRetrieveParams>;

export const ResponseSmallSchemas = {
  TextFormat,
  JsonObjectFormat,
  JsonSchemaFormat,
  ResponseFormatTextConfig,
  ResponseTextConfig,
} as const;
export type ResponseSmallSchemaKey = keyof typeof ResponseSmallSchemas;
