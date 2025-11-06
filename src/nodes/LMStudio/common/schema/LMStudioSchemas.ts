import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";

/**
 * TODO: Add documentation
 *
 * @public
 */
export const LLMLlamaCacheQuantizationType = Type.Union(
  [
    Type.Literal("f32"),
    Type.Literal("f16"),
    Type.Literal("q8_0"),
    Type.Literal("q4_0"),
    Type.Literal("q4_1"),
    Type.Literal("iq4_nl"),
    Type.Literal("q5_0"),
    Type.Literal("q5_1"),
  ],
  { description: "TODO: Add documentation" }
);
export type LLMLlamaCacheQuantizationType = Static<
  typeof LLMLlamaCacheQuantizationType
>;

/**
 * @public
 */
export const LLMLoadModelConfig = Type.Object(
  {
    gpu: Type.Optional(
      Type.Any({
        description:
          "How to distribute the work to your GPUs. See GPUSetting for more information.",
      })
    ),
    gpuStrictVramCap: Type.Optional(
      Type.Boolean({
        description:
          "If set to true, detected system limits for VRAM will be strictly enforced.",
      })
    ),
    offloadKVCacheToGpu: Type.Optional(
      Type.Boolean({
        description:
          "If set to true, KV cache will be offloaded to GPU memory if available.",
      })
    ),
    contextLength: Type.Optional(
      Type.Number({
        description: "The size of the context length in number of tokens.",
      })
    ),
    ropeFrequencyBase: Type.Optional(
      Type.Number({
        description:
          "Custom base frequency for rotary positional embeddings (RoPE).",
      })
    ),
    ropeFrequencyScale: Type.Optional(
      Type.Number({ description: "Scaling factor for RoPE frequency." })
    ),
    evalBatchSize: Type.Optional(
      Type.Number({
        description:
          "Number of input tokens to process together in a single batch during evaluation.",
      })
    ),
    flashAttention: Type.Optional(
      Type.Boolean({
        description:
          "Enables Flash Attention for optimized attention computation.",
      })
    ),
    keepModelInMemory: Type.Optional(
      Type.Boolean({
        description:
          "When enabled, prevents the model from being swapped out of system memory.",
      })
    ),
    seed: Type.Optional(
      Type.Number({
        description:
          "Random seed value for model initialization to ensure reproducible outputs.",
      })
    ),
    useFp16ForKVCache: Type.Optional(
      Type.Boolean({
        description:
          "When enabled, stores the key-value cache in half-precision (FP16) format.",
      })
    ),
    tryMmap: Type.Optional(
      Type.Boolean({
        description:
          "Attempts to use memory-mapped (mmap) file access when loading the model.",
      })
    ),
    numExperts: Type.Optional(
      Type.Number({
        description:
          "Specifies the number of experts to use for models with Mixture of Experts (MoE) architecture.",
      })
    ),
    llamaKCacheQuantizationType: Type.Optional(
      Type.Union(
        [
          Type.Literal(false),
          Type.Literal("f32"),
          Type.Literal("f16"),
          Type.Literal("q8_0"),
          Type.Literal("q4_0"),
          Type.Literal("q4_1"),
          Type.Literal("iq4_nl"),
          Type.Literal("q5_0"),
          Type.Literal("q5_1"),
        ],
        { description: "Quantization type for the Llama model's key cache." }
      )
    ),
    llamaVCacheQuantizationType: Type.Optional(
      Type.Union(
        [
          Type.Literal(false),
          Type.Literal("f32"),
          Type.Literal("f16"),
          Type.Literal("q8_0"),
          Type.Literal("q4_0"),
          Type.Literal("q4_1"),
          Type.Literal("iq4_nl"),
          Type.Literal("q5_0"),
          Type.Literal("q5_1"),
        ],
        { description: "Quantization type for the Llama model's value cache." }
      )
    ),
  },
  { description: "Configuration for loading LLM models." }
);
export type LLMLoadModelConfig = Static<typeof LLMLoadModelConfig>;
/**
 * @public
 * Options for loading a model.
 */
export const BaseLoadModelOpts = Type.Object(
  {
    identifier: Type.Optional(
      Type.String({
        description: "The identifier to use for the loaded model.",
      })
    ),
    config: Type.Optional(LLMLoadModelConfig),
    signal: Type.Optional(
      Type.Any({ description: "An AbortSignal to cancel the model loading." })
    ),
    ttl: Type.Optional(
      Type.Number({ description: "Idle time to live (TTL) in seconds." })
    ),
    verbose: Type.Optional(
      Type.Union(
        [
          Type.Boolean(),
          Type.Literal("debug"),
          Type.Literal("info"),
          Type.Literal("warn"),
          Type.Literal("error"),
        ],
        { description: "Controls the logging of model loading progress." }
      )
    ),
    onProgress: Type.Optional(
      Type.Any({
        description:
          "A function that is called with the progress of the model loading.",
      })
    ),
  },
  { description: "Options for loading a model." }
);

export type BaseLoadModelOpts = Static<typeof BaseLoadModelOpts>;

/**
 * @public
 */
export const LLMManualPromptTemplate = Type.Object(
  {
    beforeSystem: Type.String({
      description: "String to be prepended to the system prompt.",
    }),
    afterSystem: Type.String({
      description: "String to be appended to the system prompt.",
    }),
    beforeUser: Type.String({
      description: "String to be prepended to a user message.",
    }),
    afterUser: Type.String({
      description: "String to be appended to a user message.",
    }),
    beforeAssistant: Type.String({
      description: "String to be prepended to an assistant message.",
    }),
    afterAssistant: Type.String({
      description: "String to be appended to an assistant message.",
    }),
  },
  { description: "Manual prompt template for LLM interactions." }
);
export type LLMManualPromptTemplate = Static<typeof LLMManualPromptTemplate>;

// Shared config for running predictions on an LLM
export const LLMPredictionConfigInput = Type.Object(
  {
    maxTokens: Type.Optional(
      Type.Union([Type.Number(), Type.Literal(false)], {
        description: "Max number of tokens to predict or false for unlimited.",
      })
    ),
    temperature: Type.Optional(
      Type.Number({ description: "Sampling temperature between 0 and 1." })
    ),
    stopStrings: Type.Optional(
      Type.Array(Type.String(), {
        description: "Strings that cause prediction to stop.",
      })
    ),
    toolCallStopStrings: Type.Optional(
      Type.Array(Type.String(), { description: "Tool call stop strings." })
    ),
    contextOverflowPolicy: Type.Optional(
      Type.Union(
        [
          Type.Literal("stopAtLimit"),
          Type.Literal("truncateMiddle"),
          Type.Literal("rollingWindow"),
        ],
        { description: "Behavior when context window is exceeded." }
      )
    ),
  },
  { description: "Shared config for running predictions on an LLM." }
);
export type LLMPredictionConfigInput = Static<typeof LLMPredictionConfigInput>;

// Prediction config with optional structured setting
export const LLMPredictionConfig = Type.Intersect(
  [
    Type.Omit(LLMPredictionConfigInput, ["structured"]),
    Type.Object({
      structured: Type.Optional(
        Type.Any({
          description: "Structured prediction setting or parse function.",
        })
      ),
    }),
  ],
  { description: "Options for LLM prediction including structured setting." }
);
export type LLMPredictionConfig = Static<typeof LLMPredictionConfig>;

/**
 * Type of reasoning for a prediction fragment.
 *
 * @public
 */
export const LLMPredictionFragmentReasoningType = Type.Union(
  [
    Type.Literal("none"),
    Type.Literal("reasoning"),
    Type.Literal("reasoningStartTag"),
    Type.Literal("reasoningEndTag"),
  ],
  { description: "Type of reasoning for prediction fragment." }
);
export type LLMPredictionFragmentReasoningType = Static<
  typeof LLMPredictionFragmentReasoningType
>;

/**
 * Represents a fragment of a prediction from an LLM. Note that a fragment may contain multiple tokens.
 *
 * @public
 */
export const LLMPredictionFragment = Type.Object(
  {
    content: Type.String({ description: "Content of the fragment." }),
    tokensCount: Type.Number({ description: "Number of tokens in fragment." }),
    containsDrafted: Type.Boolean({
      description: "Whether fragment contains drafted tokens.",
    }),
    reasoningType: LLMPredictionFragmentReasoningType,
  },
  { description: "A fragment of an LLM prediction." }
);
export type LLMPredictionFragment = Static<typeof LLMPredictionFragment>;

/**
 * Options for creating a prediction fragment
 *
 * @public
 */
export const LLMPredictionFragmentInputOpts = Type.Object(
  {
    tokenCount: Type.Optional(
      Type.Number({ description: "How many tokens this fragment contains." })
    ),
    containsDrafted: Type.Optional(
      Type.Boolean({ description: "Whether fragment contains drafted tokens." })
    ),
    reasoningType: Type.Optional(LLMPredictionFragmentReasoningType),
  },
  { description: "Options for creating a prediction fragment." }
);
export type LLMPredictionFragmentInputOpts = Static<
  typeof LLMPredictionFragmentInputOpts
>;

/**
 * @public
 */
export const ChatHistoryData = Type.Object(
  {
    messages: Type.Array(Type.Any({ description: "ChatMessageData" })),
  },
  { description: "Chat history data." }
);
export type ChatHistoryData = Static<typeof ChatHistoryData>;

/**
 * This type provides an easy way of specifying a chat history.
 *
 * Example:
 *
 * ```ts
 * const chat = Chat.from([
 *   { role: "user", content: "Hello" },
 *   { role: "assistant", content: "Hi" },
 *   { role: "user", content: "How are you?" },
 * ]);
 * ```
 *
 * @public
 */
export const ChatInput = Type.Array(
  Type.Any({ description: "ChatMessageInput" })
);
export type ChatInput = Static<typeof ChatInput>;

/**
 * @public
 */
export const ChatMessageData = Type.Union(
  [
    Type.Object({
      role: Type.Literal("assistant"),
      content: Type.Array(
        Type.Any({
          description:
            "ChatMessagePartTextData | ChatMessagePartFileData | ChatMessagePartToolCallRequestData",
        })
      ),
    }),
    Type.Object({
      role: Type.Literal("user"),
      content: Type.Array(
        Type.Any({
          description: "ChatMessagePartTextData | ChatMessagePartFileData",
        })
      ),
    }),
    Type.Object({
      role: Type.Literal("system"),
      content: Type.Array(
        Type.Any({
          description: "ChatMessagePartTextData | ChatMessagePartFileData",
        })
      ),
    }),
    Type.Object({
      role: Type.Literal("tool"),
      content: Type.Array(
        Type.Any({ description: "ChatMessagePartToolCallResultData" })
      ),
    }),
  ],
  { description: "Represents a single message in the history." }
);
export type ChatMessageData = Static<typeof ChatMessageData>;

/**
 * This type provides an easy way of specifying a single chat message.
 *
 * @public
 */
export const ChatMessageInput = Type.Object(
  {
    role: Type.Optional(
      Type.Union([
        Type.Literal("user"),
        Type.Literal("assistant"),
        Type.Literal("system"),
      ])
    ),
    content: Type.Optional(Type.String()),
    images: Type.Optional(Type.Array(Type.Any({ description: "FileHandle" }))),
  },
  { description: "Specifies a chat message input." }
);
export type ChatMessageInput = Static<typeof ChatMessageInput>;
