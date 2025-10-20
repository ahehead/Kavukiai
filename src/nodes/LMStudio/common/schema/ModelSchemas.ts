import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";

// The format of the model.
export const ModelCompatibilityType = Type.Union(
  [
    Type.Literal("gguf"),
    Type.Literal("safetensors"),
    Type.Literal("onnx"),
    Type.Literal("ggml"),
    Type.Literal("mlx_placeholder"),
    Type.Literal("torch_safetensors"),
  ],
  { description: "The format of the model." }
);
export type ModelCompatibilityType = Static<typeof ModelCompatibilityType>;

// Represents info of a model that is downloaded and sits on the disk. This is the base type shared by all models of different domains.
export const ModelInfoBase = Type.Object(
  {
    modelKey: Type.String({
      description: "The key of the model. Use to load the model.",
    }),
    format: ModelCompatibilityType,
    displayName: Type.String({
      description: "Machine generated name of the model.",
    }),
    path: Type.String({ description: "The relative path of the model." }),
    sizeBytes: Type.Number({ description: "The size of the model in bytes." }),
    paramsString: Type.Optional(
      Type.String({
        description:
          "A string that represents the number of params in the model. May not always be available.",
      })
    ),
    architecture: Type.Optional(
      Type.String({ description: "The architecture of the model." })
    ),
  },
  {
    description:
      "Represents info of a model that is downloaded and sits on the disk. This is the base type shared by all models of different domains.",
  }
);
export type ModelInfoBase = Static<typeof ModelInfoBase>;

// LLM specific information.
export const LLMAdditionalInfo = Type.Object(
  {
    vision: Type.Boolean({
      description:
        "Whether this model is vision-enabled (i.e. supports image input).",
    }),
    trainedForToolUse: Type.Boolean({
      description: "Whether this model is trained natively for tool use.",
    }),
    maxContextLength: Type.Number({
      description: "Maximum context length of the model.",
    }),
  },
  { description: "LLM specific information." }
);
export type LLMAdditionalInfo = Static<typeof LLMAdditionalInfo>;

// Info of an LLM (flattened). Originally was an Intersect of:
//   { type: 'llm' } & ModelInfoBase & LLMAdditionalInfo
// TypeBox v0.34 系で Intersect を含む複合スキーマ同士の Type.Extends が
// 自己比較でも false を返すケースがあったためフラット化。
export const LLMInfo = Type.Object(
  {
    // discriminator
    type: Type.Literal("llm"),
    // ---- ModelInfoBase fields ----
    modelKey: Type.String({
      description: "The key of the model. Use to load the model.",
    }),
    format: ModelCompatibilityType,
    displayName: Type.String({
      description: "Machine generated name of the model.",
    }),
    path: Type.String({ description: "The relative path of the model." }),
    sizeBytes: Type.Number({
      description: "The size of the model in bytes.",
    }),
    paramsString: Type.Optional(
      Type.String({
        description:
          "A string that represents the number of params in the model. May not always be available.",
      })
    ),
    architecture: Type.Optional(
      Type.String({ description: "The architecture of the model." })
    ),
    // ---- LLMAdditionalInfo fields ----
    vision: Type.Boolean({
      description:
        "Whether this model is vision-enabled (i.e. supports image input).",
    }),
    trainedForToolUse: Type.Boolean({
      description: "Whether this model is trained natively for tool use.",
    }),
    maxContextLength: Type.Number({
      description: "Maximum context length of the model.",
    }),
  },
  {
    description:
      "Info of an LLM (flattened from Intersect to improve Type.Extends stability).",
  }
);
export type LLMInfo = Static<typeof LLMInfo>;

// Embedding model specific information.
export const EmbeddingModelAdditionalInfo = Type.Object(
  {
    maxContextLength: Type.Number({
      description: "The maximum context length supported by the model.",
    }),
  },
  { description: "Embedding model specific information." }
);
export type EmbeddingModelAdditionalInfo = Static<
  typeof EmbeddingModelAdditionalInfo
>;

// Info of an embedding model (flattened). 同様に Intersect を避ける。
export const EmbeddingModelInfo = Type.Object(
  {
    type: Type.Literal("embedding"),
    // ---- ModelInfoBase fields ----
    modelKey: Type.String({
      description: "The key of the model. Use to load the model.",
    }),
    format: ModelCompatibilityType,
    displayName: Type.String({
      description: "Machine generated name of the model.",
    }),
    path: Type.String({ description: "The relative path of the model." }),
    sizeBytes: Type.Number({
      description: "The size of the model in bytes.",
    }),
    paramsString: Type.Optional(
      Type.String({
        description:
          "A string that represents the number of params in the model. May not always be available.",
      })
    ),
    architecture: Type.Optional(
      Type.String({ description: "The architecture of the model." })
    ),
    // ---- EmbeddingModelAdditionalInfo fields ----
    maxContextLength: Type.Number({
      description: "The maximum context length supported by the model.",
    }),
  },
  {
    description:
      "Info of an embedding model (flattened from Intersect to improve Type.Extends stability).",
  }
);
export type EmbeddingModelInfo = Static<typeof EmbeddingModelInfo>;

// Information about a model.
export const ModelInfo = Type.Union([LLMInfo, EmbeddingModelInfo], {
  description: "Information about a model.",
});
export type ModelInfo = Static<typeof ModelInfo>;

export const ModelInfoArray = Type.Array(ModelInfo);
export type ModelInfoArray = Static<typeof ModelInfoArray>;

// ModelInfo | null schema for optional selection
export const ModelInfoOrNull = Type.Union([ModelInfo, Type.Null()], {
  description: "Model info or null when not selected.",
});
export type ModelInfoOrNull = Static<typeof ModelInfoOrNull>;

// Accept either a raw modelKey string or a full ModelInfo object
export const ModelKeyOrModelInfoOrNull = Type.Union([
  Type.String(),
  ModelInfo,
  Type.Null(),
]);

export type ModelKeyOrModelInfoOrNull = Static<
  typeof ModelKeyOrModelInfoOrNull
>;
