type LLMPredictionConfig = Omit<LLMPredictionConfigInput<any>, "structured"> & {
    structured?: LLMStructuredPredictionSetting;
};

interface LLMPredictionConfigInput<TStructuredOutputType = unknown> {
    maxTokens?: number | false;
    temperature?: number;
    stopStrings?: Array<string>;
    toolCallStopStrings?: Array<string>;
    contextOverflowPolicy?: LLMContextOverflowPolicy;
    structured?: {
        parse: (input: any) => TStructuredOutputType;
    } | LLMStructuredPredictionSetting;
    rawTools?: LLMToolUseSetting;
    topKSampling?: number;
    repeatPenalty?: number | false;
    minPSampling?: number | false;
    topPSampling?: number | false;
    xtcProbability?: number | false;
    xtcThreshold?: number | false;
    logProbs?: number | false;
    cpuThreads?: number;
    promptTemplate?: LLMPromptTemplate;
    draftModel?: string;
    speculativeDecodingNumDraftTokensExact?: number;
    speculativeDecodingMinDraftLengthToConsider?: number;
    speculativeDecodingMinContinueDraftingProbability?: number;
    reasoningParsing?: LLMReasoningParsing;
    raw?: KVConfig;
}

type LLMContextOverflowPolicy = "stopAtLimit" | "truncateMiddle" | "rollingWindow";

type LLMStructuredPredictionSetting = {
    type: LLMStructuredPredictionType;
    jsonSchema?: any;
    gbnfGrammar?: string;
};

type LLMStructuredPredictionType = "none" | "json" | "gbnf";

type LLMToolUseSetting = {
    type: "none";
} | {
    type: "toolArray";
    tools?: LLMTool[];
    force?: boolean;
};

type LLMTool = {
    type: "function";
    function: {
        name: string;
        description?: string;
        parameters?: LLMToolParameters;
    };
};

type LLMToolParameters = {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
};

interface LLMPromptTemplate {
    type: LLMPromptTemplateType;
    manualPromptTemplate?: LLMManualPromptTemplate;
    jinjaPromptTemplate?: LLMJinjaPromptTemplate;
    stopStrings: Array<string>;
}

type LLMPromptTemplateType = "manual" | "jinja";

interface LLMManualPromptTemplate {
    beforeSystem: string;
    afterSystem: string;
    beforeUser: string;
    afterUser: string;
    beforeAssistant: string;
    afterAssistant: string;
}

interface LLMJinjaPromptTemplate {
    template: string;
}

interface LLMReasoningParsing {
    enabled: boolean;
    startString: string;
    endString: string;
}

interface KVConfig {
    fields: Array<KVConfigField>;
}

interface KVConfigField {
    key: string;
    value?: any;
}