import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { LLMAdditionalInfo, ModelInfoBase } from "./ModelSchemas";

/** Represents the reason why a prediction stopped. */
export const LLMPredictionStopReasonSchema = Type.Union(
  [
    Type.Literal("userStopped"),
    Type.Literal("modelUnloaded"),
    Type.Literal("failed"),
    Type.Literal("eosFound"),
    Type.Literal("stopStringFound"),
    Type.Literal("toolCalls"),
    Type.Literal("maxPredictedTokensReached"),
    Type.Literal("contextLengthReached"),
  ],
  { description: "Stop reason enum" }
);
export type LLMPredictionStopReason = Static<
  typeof LLMPredictionStopReasonSchema
>;

/** Statistics about an LLM prediction. */
export const LLMPredictionStatsSchema = Type.Object(
  {
    stopReason: LLMPredictionStopReasonSchema,
    tokensPerSecond: Type.Optional(
      Type.Number({ description: "Average tokens predicted per second" })
    ),
    numGpuLayers: Type.Optional(
      Type.Number({ description: "Number of GPU layers used" })
    ),
    timeToFirstTokenSec: Type.Optional(
      Type.Number({ description: "Time to first token in seconds" })
    ),
    promptTokensCount: Type.Optional(Type.Number()),
    predictedTokensCount: Type.Optional(Type.Number()),
    totalTokensCount: Type.Optional(Type.Number()),
    usedDraftModelKey: Type.Optional(Type.String()),
    totalDraftTokensCount: Type.Optional(Type.Number()),
    acceptedDraftTokensCount: Type.Optional(Type.Number()),
    rejectedDraftTokensCount: Type.Optional(Type.Number()),
    ignoredDraftTokensCount: Type.Optional(Type.Number()),
  },
  { description: "LLM prediction statistics" }
);
export type LLMPredictionStats = Static<typeof LLMPredictionStatsSchema>;

/** Types of LLM prompt templates. */
export const LLMPromptTemplateTypeSchema = Type.Union([
  Type.Literal("manual"),
  Type.Literal("jinja"),
]);
export type LLMPromptTemplateType = Static<typeof LLMPromptTemplateTypeSchema>;

/** Represents a prompt template for LLM. */
export const LLMPromptTemplateSchema = Type.Object(
  {
    type: LLMPromptTemplateTypeSchema,
    manualPromptTemplate: Type.Optional(Type.Unknown()),
    jinjaPromptTemplate: Type.Optional(Type.Unknown()),
    stopStrings: Type.Array(Type.String(), {
      description: "Additional stop strings for the template",
    }),
  },
  { description: "LLM prompt template" }
);
export type LLMPromptTemplate = Static<typeof LLMPromptTemplateSchema>;

/** Base model instance information. */
export const ModelInstanceInfoBaseSchema = Type.Intersect([
  ModelInfoBase,
  Type.Object({
    identifier: Type.String(),
    instanceReference: Type.String(),
  }),
]);
export type ModelInstanceInfoBase = Static<typeof ModelInstanceInfoBaseSchema>;

/** Additional LLM instance information. */
export const LLMInstanceAdditionalInfoSchema = Type.Object({
  contextLength: Type.Number(),
});
export type LLMInstanceAdditionalInfo = Static<
  typeof LLMInstanceAdditionalInfoSchema
>;

/** Info of a loaded LLM instance. */
export const LLMInstanceInfoSchema = Type.Intersect(
  [
    Type.Object({
      type: Type.Literal("llm"),
    }),
    ModelInstanceInfoBaseSchema,
    LLMAdditionalInfo,
    LLMInstanceAdditionalInfoSchema,
  ],
  { description: "Loaded LLM instance information" }
);
export type LLMInstanceInfo = Static<typeof LLMInstanceInfoSchema>;

/** Represents the result of an LLM prediction. */
export const PredictionResultSchema = Type.Object(
  {
    content: Type.String({ description: "Newly generated text" }),
    reasoningContent: Type.String({
      description: "Reasoning parts of generated text",
    }),
    nonReasoningContent: Type.String({
      description: "Non-reasoning parts of generated text",
    }),
    stats: LLMPredictionStatsSchema,
    modelInfo: LLMInstanceInfoSchema,
    roundIndex: Type.Number({ description: "Round index of prediction" }),
    loadConfig: Type.Unknown({
      description: "Deprecated raw config used to load model",
    }),
    predictionConfig: Type.Unknown({
      description: "Deprecated raw config used during prediction",
    }),
  },
  { description: "LLM prediction result" }
);
export type PredictionResult = Static<typeof PredictionResultSchema>;
