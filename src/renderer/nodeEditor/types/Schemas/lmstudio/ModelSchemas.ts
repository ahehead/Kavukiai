import { Type } from '@sinclair/typebox'
import type { Static } from '@sinclair/typebox'

// The format of the model.
export const ModelCompatibilityType = Type.Union(
  [
    Type.Literal('gguf'),
    Type.Literal('safetensors'),
    Type.Literal('onnx'),
    Type.Literal('ggml'),
    Type.Literal('mlx_placeholder'),
    Type.Literal('torch_safetensors'),
  ],
  { description: 'The format of the model.' }
)
export type ModelCompatibilityType = Static<typeof ModelCompatibilityType>

// Represents info of a model that is downloaded and sits on the disk. This is the base type shared by all models of different domains.
export const ModelInfoBase = Type.Object(
  {
    modelKey: Type.String({
      description: 'The key of the model. Use to load the model.',
    }),
    format: ModelCompatibilityType,
    displayName: Type.String({
      description: 'Machine generated name of the model.',
    }),
    path: Type.String({ description: 'The relative path of the model.' }),
    sizeBytes: Type.Number({ description: 'The size of the model in bytes.' }),
    paramsString: Type.Optional(
      Type.String({
        description:
          'A string that represents the number of params in the model. May not always be available.',
      })
    ),
    architecture: Type.Optional(
      Type.String({ description: 'The architecture of the model.' })
    ),
  },
  {
    description:
      'Represents info of a model that is downloaded and sits on the disk. This is the base type shared by all models of different domains.',
  }
)
export type ModelInfoBase = Static<typeof ModelInfoBase>

// LLM specific information.
export const LLMAdditionalInfo = Type.Object(
  {
    vision: Type.Boolean({
      description:
        'Whether this model is vision-enabled (i.e. supports image input).',
    }),
    trainedForToolUse: Type.Boolean({
      description: 'Whether this model is trained natively for tool use.',
    }),
    maxContextLength: Type.Number({
      description: 'Maximum context length of the model.',
    }),
  },
  { description: 'LLM specific information.' }
)
export type LLMAdditionalInfo = Static<typeof LLMAdditionalInfo>

// Info of an LLM. It is a combination of ModelInfoBase and LLMAdditionalInfo.
export const LLMInfo = Type.Intersect(
  [
    Type.Object({ type: Type.Literal('llm') }),
    ModelInfoBase,
    LLMAdditionalInfo,
  ],
  {
    description:
      'Info of an LLM. It is a combination of ModelInfoBase and LLMAdditionalInfo.',
  }
)
export type LLMInfo = Static<typeof LLMInfo>

// Embedding model specific information.
export const EmbeddingModelAdditionalInfo = Type.Object(
  {
    maxContextLength: Type.Number({
      description: 'The maximum context length supported by the model.',
    }),
  },
  { description: 'Embedding model specific information.' }
)
export type EmbeddingModelAdditionalInfo = Static<
  typeof EmbeddingModelAdditionalInfo
>

// Info of an embedding model. It is a combination of ModelInfoBase and EmbeddingModelAdditionalInfo.
export const EmbeddingModelInfo = Type.Intersect(
  [
    Type.Object({ type: Type.Literal('embedding') }),
    ModelInfoBase,
    EmbeddingModelAdditionalInfo,
  ],
  {
    description:
      'Info of an embedding model. It is a combination of ModelInfoBase and EmbeddingModelAdditionalInfo.',
  }
)
export type EmbeddingModelInfo = Static<typeof EmbeddingModelInfo>

// Information about a model.
export const ModelInfo = Type.Union([LLMInfo, EmbeddingModelInfo], {
  description: 'Information about a model.',
})
export type ModelInfo = Static<typeof ModelInfo>

export const ModelInfoArray = Type.Array(ModelInfo)
export type ModelInfoArray = Static<typeof ModelInfoArray>

export const StringArray = Type.Array(Type.String(), {
  description: 'Array of strings',
})
export type StringArray = Static<typeof StringArray>
