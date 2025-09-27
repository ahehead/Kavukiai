class PredictionResult implements BasePredictionResult {
    readonly content: string;
    readonly reasoningContent: string;
    readonly nonReasoningContent: string;
    readonly stats: LLMPredictionStats;
    readonly modelInfo: LLMInstanceInfo;
    readonly roundIndex: number;
    readonly loadConfig: KVConfig;
    readonly predictionConfig: KVConfig;
    constructor(content: string, reasoningContent: string, nonReasoningContent: string, stats: LLMPredictionStats, modelInfo: LLMInstanceInfo, roundIndex: number, loadConfig: KVConfig, predictionConfig: KVConfig);
}

interface LLMPredictionStats {
    stopReason: LLMPredictionStopReason;
    tokensPerSecond?: number;
    numGpuLayers?: number;
    timeToFirstTokenSec?: number;
    promptTokensCount?: number;
    predictedTokensCount?: number;
    totalTokensCount?: number;
    usedDraftModelKey?: string;
    totalDraftTokensCount?: number;
    acceptedDraftTokensCount?: number;
    rejectedDraftTokensCount?: number;
    ignoredDraftTokensCount?: number;
}

type LLMPredictionStopReason = "userStopped" | "modelUnloaded" | "failed" | "eosFound" | "stopStringFound" | "toolCalls" | "maxPredictedTokensReached" | "contextLengthReached";

type LLMInstanceInfo = {
    type: "llm";
} & ModelInstanceInfoBase & LLMAdditionalInfo & LLMInstanceAdditionalInfo;

interface ModelInstanceInfoBase extends ModelInfoBase {
    identifier: string;
    instanceReference: string;
}

interface ModelInfoBase {
    modelKey: string;
    format: ModelCompatibilityType;
    displayName: string;
    path: string;
    sizeBytes: number;
    paramsString?: string;
    architecture?: string;
}

type ModelCompatibilityType = "gguf" | "safetensors" | "onnx" | "ggml" | "mlx_placeholder" | "torch_safetensors";

interface LLMAdditionalInfo {
    vision: boolean;
    trainedForToolUse: boolean;
    maxContextLength: number;
}

interface LLMInstanceAdditionalInfo {
    contextLength: number;
}

interface KVConfig {
    fields: Array<KVConfigField>;
}

interface KVConfigField {
    key: string;
    value?: any;
}

interface BasePredictionResult {
    content: string;
    reasoningContent: string;
    nonReasoningContent: string;
}