type ChatLike = ChatInput | string | Chat | ChatMessageInput | ChatHistoryData;

type ChatInput = Array<ChatMessageInput>;

interface ChatMessageInput {
    role?: "user" | "assistant" | "system";
    content?: string;
    images?: Array<FileHandle>;
}

class FileHandle {
    readonly filesNamespace: FilesNamespace;
    readonly identifier: string;
    readonly type: FileType;
    readonly sizeBytes: number;
    readonly name: string;
    constructor(filesNamespace: FilesNamespace, identifier: string, type: FileType, sizeBytes: number, name: string);
    private readonly parsedIdentifier;
    getFilePath(): Promise<string>;
    isImage(): boolean;
}

class FilesNamespace {
    private readonly validator;
    prepareImage(path: string): Promise<FileHandle>;
    prepareImageBase64(fileName: string, contentBase64: string): Promise<FileHandle>;
    prepareFile(path: string): Promise<FileHandle>;
    prepareFileBase64(fileName: string, contentBase64: string): Promise<FileHandle>;
    retrieve(query: string, files: Array<FileHandle>, opts?: RetrievalOpts): Promise<RetrievalResult>;
    parseDocument(fileHandle: FileHandle, opts?: ParseDocumentOpts): Promise<ParseDocumentResult>;
    getDocumentParsingLibrary(fileHandle: FileHandle): Promise<DocumentParsingLibraryIdentifier>;
}

type RetrievalOpts = RetrievalCallbacks & {
    chunkingMethod?: RetrievalChunkingMethod;
    limit?: number;
    embeddingModel?: EmbeddingDynamicHandle;
    databasePath?: string;
    signal?: AbortSignal;
};

interface RetrievalCallbacks {
    onFileProcessList?: (filesToProcess: Array<FileHandle>) => void;
    onFileProcessingStart?: (file: FileHandle, index: number, filesToProcess: Array<FileHandle>) => void;
    onFileProcessingEnd?: (file: FileHandle, index: number, filesToProcess: Array<FileHandle>) => void;
    onFileProcessingStepStart?: (file: FileHandle, step: RetrievalFileProcessingStep) => void;
    onFileProcessingStepProgress?: (file: FileHandle, step: RetrievalFileProcessingStep, progressInStep: number) => void;
    onFileProcessingStepEnd?: (file: FileHandle, step: RetrievalFileProcessingStep) => void;
    onSearchingStart?: () => void;
    onSearchingEnd?: () => void;
    verbose?: boolean | LogLevel;
}

type RetrievalFileProcessingStep = "loading" | "chunking" | "embedding";

type LogLevel = "debug" | "info" | "warn" | "error";

type RetrievalChunkingMethod = {
    type: "recursive-v1";
    chunkSize: number;
    chunkOverlap: number;
};

class EmbeddingDynamicHandle extends DynamicHandle<EmbeddingModelInstanceInfo> {
    embed(inputString: string): Promise<{
        embedding: Array<number>;
    }>;
    embed(inputStrings: Array<string>): Promise<Array<{
        embedding: Array<number>;
    }>>;
    getContextLength(): Promise<number>;
    getEvalBatchSize(): Promise<number>;
    tokenize(inputString: string): Promise<Array<number>>;
    tokenize(inputStrings: Array<string>): Promise<Array<Array<number>>>;
    countTokens(inputString: string): Promise<number>;
}

type EmbeddingModelInstanceInfo = {
    type: "embedding";
} & ModelInstanceInfoBase & EmbeddingModelAdditionalInfo & EmbeddingModelInstanceAdditionalInfo;

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

interface EmbeddingModelAdditionalInfo {
    maxContextLength: number;
}

interface EmbeddingModelInstanceAdditionalInfo {
    contextLength: number;
}

abstract class DynamicHandle<TModelInstanceInfo extends ModelInstanceInfoBase> {
    getModelInfo(): Promise<TModelInstanceInfo | undefined>;
    protected getLoadConfig(stack: string): Promise<KVConfig>;
}

interface KVConfig {
    fields: Array<KVConfigField>;
}

interface KVConfigField {
    key: string;
    value?: any;
}

interface RetrievalResult {
    entries: Array<RetrievalResultEntry>;
}

interface RetrievalResultEntry {
    content: string;
    score: number;
    source: FileHandle;
}

type ParseDocumentOpts = DocumentParsingOpts & {
    onParserLoaded?: (parser: DocumentParsingLibraryIdentifier) => void;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
};

type DocumentParsingOpts = {
    parserId?: DocumentParsingLibraryIdentifier;
};

type DocumentParsingLibraryIdentifier = {
    library: string;
    version: string;
};

interface ParseDocumentResult {
    content: string;
    parser: DocumentParsingLibraryIdentifier;
}

type FileType = "image" | "text/plain" | "application/pdf" | "application/word" | "text/other" | "unknown";

class Chat extends MaybeMutable<ChatHistoryData> {
    protected getClassName(): string;
    protected create(data: ChatHistoryData, mutable: boolean): this;
    protected cloneData(data: ChatHistoryData): ChatHistoryData;
    protected constructor(data: ChatHistoryData, mutable: boolean);
    static empty(): Chat;
    static from(initializer: ChatLike): Chat;
    append(role: ChatMessageRoleData, content: string, opts?: ChatAppendOpts): void;
    append(message: ChatMessageLike): void;
    withAppended(role: ChatMessageRoleData, content: string, opts?: ChatAppendOpts): Chat;
    withAppended(message: ChatMessageLike): Chat;
    getLength(): number;
    get length(): number;
    pop(): ChatMessage;
    getAllFiles(client: LMStudioClient): Array<FileHandle>;
    files(client: LMStudioClient): Generator<FileHandle>;
    hasFiles(): boolean;
    at(index: number): ChatMessage;
    getMessagesArray(): Array<ChatMessage>;
    map<TOutput>(mapper: (message: ChatMessage, index: number, array: Array<ChatMessage>) => TOutput): Array<TOutput>;
    flatMap<TOutput>(mapper: (message: ChatMessage, index: number, array: Array<ChatMessage>) => ReadonlyArray<TOutput> | TOutput): Array<TOutput>;
    [Symbol.iterator](): Generator<ChatMessage>;
    consumeFiles(client: LMStudioClient, predicate: (file: FileHandle) => boolean): FileHandle[];
    consumeFilesAsync(client: LMStudioClient, predicate: (file: FileHandle) => Promise<boolean>): Promise<FileHandle[]>;
    getSystemPrompt(): string;
    replaceSystemPrompt(content: string): void;
    filterInPlace(predicate: (message: ChatMessage) => boolean): void;
    toString(): string;
}

interface ChatHistoryData {
    messages: Array<ChatMessageData>;
}

type ChatMessageData = {
    role: "assistant";
    content: Array<ChatMessagePartTextData | ChatMessagePartFileData | ChatMessagePartToolCallRequestData>;
} | {
    role: "user";
    content: Array<ChatMessagePartTextData | ChatMessagePartFileData>;
} | {
    role: "system";
    content: Array<ChatMessagePartTextData | ChatMessagePartFileData>;
} | {
    role: "tool";
    content: Array<ChatMessagePartToolCallResultData>;
};

interface ChatMessagePartTextData {
    type: "text";
    text: string;
}

interface ChatMessagePartFileData {
    type: "file";
    name: string;
    identifier: string;
    sizeBytes: number;
    fileType: FileType;
}

interface ChatMessagePartToolCallRequestData {
    type: "toolCallRequest";
    toolCallRequest: ToolCallRequest;
}

type ToolCallRequest = FunctionToolCallRequest;

interface FunctionToolCallRequest {
    id?: string;
    type: "function";
    arguments?: Record<string, any>;
    name: string;
}

interface ChatMessagePartToolCallResultData extends ToolCallResult {
    type: "toolCallResult";
}

interface ToolCallResult {
    content: string;
    toolCallId?: string;
}

type ChatMessageRoleData = "assistant" | "user" | "system" | "tool";

interface ChatAppendOpts {
    images?: Array<FileHandle>;
}

type ChatMessageLike = ChatMessageInput | string | ChatMessage | ChatMessageData;

class ChatMessage extends MaybeMutable<ChatMessageData> {
    protected getClassName(): string;
    protected create(data: ChatMessageData, mutable: boolean): this;
    protected cloneData(data: ChatMessageData): ChatMessageData;
    protected constructor(data: ChatMessageData, mutable: boolean);
    static create(role: ChatMessageRoleData, content: string): ChatMessage;
    static from(initializer: ChatMessageLike): ChatMessage;
    getRole(): "user" | "assistant" | "system" | "tool";
    setRole(role: ChatMessageRoleData): void;
    private getFileParts;
    getText(): string;
    getToolCallResults(): Array<ToolCallResult>;
    getToolCallRequests(): Array<ToolCallRequest>;
    getFiles(client: LMStudioClient): FileHandle[];
    files(client: LMStudioClient): Generator<FileHandle>;
    consumeFiles(client: LMStudioClient, predicate: (file: FileHandle) => boolean): FileHandle[];
    consumeFilesAsync(client: LMStudioClient, predicate: (file: FileHandle) => Promise<boolean>): Promise<FileHandle[]>;
    hasFiles(): boolean;
    appendText(text: string): void;
    appendFile(file: FileHandle): void;
    replaceText(text: string): void;
    isSystemPrompt(): boolean;
    isUserMessage(): boolean;
    isAssistantMessage(): boolean;
    toString(): string;
}

class LMStudioClient {
    readonly clientIdentifier: string;
    readonly llm: LLMNamespace;
    readonly embedding: EmbeddingNamespace;
    readonly system: SystemNamespace;
    readonly diagnostics: DiagnosticsNamespace;
    readonly files: FilesNamespace;
    readonly repository: RepositoryNamespace;
    readonly plugins: PluginsNamespace;
    private isLocalhostWithGivenPortLMStudioServer;
    private guessBaseUrl;
    private createPort;
    private resolvingBaseUrl;
    private verboseErrorMessages;
    constructor(opts?: LMStudioClientConstructorOpts);
    [Symbol.asyncDispose](): Promise<void>;
}

class LLMNamespace extends ModelNamespace<LLMLoadModelConfig, LLMInstanceInfo, LLMInfo, LLMDynamicHandle, LLM> {
    createGeneratorHandle(pluginIdentifier: string): LLMGeneratorHandle;
}

interface LLMLoadModelConfig {
    gpu?: GPUSetting;
    gpuStrictVramCap?: boolean;
    offloadKVCacheToGpu?: boolean;
    contextLength?: number;
    ropeFrequencyBase?: number;
    ropeFrequencyScale?: number;
    evalBatchSize?: number;
    flashAttention?: boolean;
    keepModelInMemory?: boolean;
    seed?: number;
    useFp16ForKVCache?: boolean;
    tryMmap?: boolean;
    numExperts?: number;
    llamaKCacheQuantizationType?: LLMLlamaCacheQuantizationType | false;
    llamaVCacheQuantizationType?: LLMLlamaCacheQuantizationType | false;
}

type GPUSetting = {
    ratio?: LLMLlamaAccelerationOffloadRatio;
    mainGpu?: number;
    splitStrategy?: LLMSplitStrategy;
    disabledGpus?: number[];
};

type LLMLlamaAccelerationOffloadRatio = number | "max" | "off";

type LLMSplitStrategy = "evenly" | "favorMainGpu";

type LLMLlamaCacheQuantizationType = "f32" | "f16" | "q8_0" | "q4_0" | "q4_1" | "iq4_nl" | "q5_0" | "q5_1";

type LLMInstanceInfo = {
    type: "llm";
} & ModelInstanceInfoBase & LLMAdditionalInfo & LLMInstanceAdditionalInfo;

interface LLMAdditionalInfo {
    vision: boolean;
    trainedForToolUse: boolean;
    maxContextLength: number;
}

interface LLMInstanceAdditionalInfo {
    contextLength: number;
}

type LLMInfo = {
    type: "llm";
} & ModelInfoBase & LLMAdditionalInfo;

class LLMDynamicHandle extends DynamicHandle<LLMInstanceInfo> {
    private predictionConfigInputToKVConfig;
    private createZodParser;
    complete<TStructuredOutputType>(prompt: string, opts?: LLMPredictionOpts<TStructuredOutputType>): OngoingPrediction<TStructuredOutputType>;
    private resolveCompletionContext;
    respond<TStructuredOutputType>(chat: ChatLike, opts?: LLMRespondOpts<TStructuredOutputType>): OngoingPrediction<TStructuredOutputType>;
    act(chat: ChatLike, tools: Array<Tool>, opts?: LLMActionOpts): Promise<ActResult>;
    getContextLength(): Promise<number>;
    applyPromptTemplate(history: ChatLike, opts?: LLMApplyPromptTemplateOpts): Promise<string>;
    tokenize(inputString: string): Promise<Array<number>>;
    tokenize(inputStrings: Array<string>): Promise<Array<Array<number>>>;
    countTokens(inputString: string): Promise<number>;
    unstable_preloadDraftModel(draftModelKey: string): Promise<void>;
}

interface LLMPredictionOpts<TStructuredOutputType = unknown> extends LLMPredictionConfigInput<TStructuredOutputType> {
    onPromptProcessingProgress?: (progress: number) => void;
    onFirstToken?: () => void;
    onPredictionFragment?: (fragment: LLMPredictionFragment) => void;
    onToolCallRequestStart?: () => void;
    onToolCallRequestNameReceived?: (name: string) => void;
    onToolCallRequestArgumentFragmentGenerated?: (content: string) => void;
    onToolCallRequestEnd?: (info: {
        toolCallRequest: ToolCallRequest;
        rawContent: string | undefined;
    }) => void;
    onToolCallRequestFailure?: (error: ToolCallRequestError) => void;
    signal?: AbortSignal;
    preset?: string;
}

interface LLMPredictionFragment {
    content: string;
    tokensCount: number;
    containsDrafted: boolean;
    reasoningType: LLMPredictionFragmentReasoningType;
}

type LLMPredictionFragmentReasoningType = "none" | "reasoning" | "reasoningStartTag" | "reasoningEndTag";

class ToolCallRequestError extends Error {
    readonly rawContent: string | undefined;
    constructor(message: string, rawContent: string | undefined);
}

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

class OngoingPrediction<TStructuredOutputType = unknown> extends StreamablePromise<LLMPredictionFragment, unknown extends TStructuredOutputType ? PredictionResult : StructuredPredictionResult<TStructuredOutputType>> {
    private readonly onCancel;
    private readonly parser;
    private stats;
    private modelInfo;
    private loadModelConfig;
    private predictionConfig;
    protected collect(fragments: ReadonlyArray<LLMPredictionFragment>): Promise<any>;
    private constructor();
    result(): Promise<unknown extends TStructuredOutputType ? PredictionResult : StructuredPredictionResult<TStructuredOutputType>>;
    cancel(): Promise<void>;
}

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

interface BasePredictionResult {
    content: string;
    reasoningContent: string;
    nonReasoningContent: string;
}

class StructuredPredictionResult<TStructuredOutputType = unknown> extends PredictionResult {
    readonly parsed: TStructuredOutputType;
    constructor(content: string, reasoningContent: string, nonReasoningContent: string, stats: LLMPredictionStats, modelInfo: LLMInstanceInfo, roundIndex: number, loadConfig: KVConfig, predictionConfig: KVConfig, parsed: TStructuredOutputType);
}

abstract class StreamablePromise<TFragment, TFinal> implements Promise<TFinal>, AsyncIterable<TFragment> {
    protected abstract collect(fragments: ReadonlyArray<TFragment>): Promise<TFinal>;
    private promiseFinal;
    private resolveFinal;
    private rejectFinal;
    protected status: "pending" | "resolved" | "rejected";
    private buffer;
    private nextFragmentPromiseBundle;
    private hasIterator;
    protected finished(error?: any): void;
    protected push(fragment: TFragment): void;
    protected constructor();
    then<TResult1 = TFinal, TResult2 = never>(onfulfilled?: ((value: TFinal) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<TFinal | TResult>;
    finally(onfinally?: (() => void) | null | undefined): Promise<TFinal>;
    [Symbol.toStringTag]: string;
    private obtainNextFragmentPromiseBundle;
    [Symbol.asyncIterator](): AsyncIterator<TFragment, any, undefined>;
}

interface LLMRespondOpts<TStructuredOutputType = unknown> extends LLMPredictionOpts<TStructuredOutputType> {
    onMessage?: (message: ChatMessage) => void;
}

type Tool = FunctionTool | RawFunctionTool;

interface FunctionTool extends ToolBase {
    type: "function";
    parametersSchema: ZodSchema;
    checkParameters: (params: any) => void;
    implementation: (params: Record<string, unknown>, ctx: ToolCallContext) => any | Promise<any>;
}

abstract class ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    readonly _type: Output;
    readonly _output: Output;
    readonly _input: Input;
    readonly _def: Def;
    get description(): string | undefined;
    "~standard": StandardSchemaV1.Props<Input, Output>;
    abstract _parse(input: ParseInput): ParseReturnType<Output>;
    _getType(input: ParseInput): string;
    _getOrReturnCtx(input: ParseInput, ctx?: ParseContext | undefined): ParseContext;
    _processInputParams(input: ParseInput): {
        status: ParseStatus;
        ctx: ParseContext;
    };
    _parseSync(input: ParseInput): SyncParseReturnType<Output>;
    _parseAsync(input: ParseInput): AsyncParseReturnType<Output>;
    parse(data: unknown, params?: util.InexactPartial<ParseParams>): Output;
    safeParse(data: unknown, params?: util.InexactPartial<ParseParams>): SafeParseReturnType<Input, Output>;
    "~validate"(data: unknown): StandardSchemaV1.Result<Output> | Promise<StandardSchemaV1.Result<Output>>;
    parseAsync(data: unknown, params?: util.InexactPartial<ParseParams>): Promise<Output>;
    safeParseAsync(data: unknown, params?: util.InexactPartial<ParseParams>): Promise<SafeParseReturnType<Input, Output>>;
    spa: (data: unknown, params?: util.InexactPartial<ParseParams>) => Promise<SafeParseReturnType<Input, Output>>;
    refine<RefinedOutput extends Output>(check: (arg: Output) => arg is RefinedOutput, message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)): ZodEffects<this, RefinedOutput, Input>;
    refine(check: (arg: Output) => unknown | Promise<unknown>, message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)): ZodEffects<this, Output, Input>;
    refinement<RefinedOutput extends Output>(check: (arg: Output) => arg is RefinedOutput, refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)): ZodEffects<this, RefinedOutput, Input>;
    refinement(check: (arg: Output) => boolean, refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)): ZodEffects<this, Output, Input>;
    _refinement(refinement: RefinementEffect<Output>["refinement"]): ZodEffects<this, Output, Input>;
    superRefine<RefinedOutput extends Output>(refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput): ZodEffects<this, RefinedOutput, Input>;
    superRefine(refinement: (arg: Output, ctx: RefinementCtx) => void): ZodEffects<this, Output, Input>;
    superRefine(refinement: (arg: Output, ctx: RefinementCtx) => Promise<void>): ZodEffects<this, Output, Input>;
    constructor(def: Def);
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    nullish(): ZodOptional<ZodNullable<this>>;
    array(): ZodArray<this>;
    promise(): ZodPromise<this>;
    or<T extends ZodTypeAny>(option: T): ZodUnion<[
        this,
        T
    ]>;
    and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T>;
    transform<NewOut>(transform: (arg: Output, ctx: RefinementCtx) => NewOut | Promise<NewOut>): ZodEffects<this, NewOut>;
    default(def: util.noUndefined<Input>): ZodDefault<this>;
    default(def: () => util.noUndefined<Input>): ZodDefault<this>;
    brand<B extends string | number | symbol>(brand?: B): ZodBranded<this, B>;
    catch(def: Output): ZodCatch<this>;
    catch(def: (ctx: {
        error: ZodError;
        input: Input;
    }) => Output): ZodCatch<this>;
    describe(description: string): this;
    pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T>;
    readonly(): ZodReadonly<this>;
    isOptional(): boolean;
    isNullable(): boolean;
}

interface ZodTypeDef {
    errorMap?: ZodErrorMap | undefined;
    description?: string | undefined;
}

type ZodErrorMap = (issue: ZodIssueOptionalMessage, _ctx: ErrorMapCtx) => {
    message: string;
};

type ZodIssueOptionalMessage = ZodInvalidTypeIssue | ZodInvalidLiteralIssue | ZodUnrecognizedKeysIssue | ZodInvalidUnionIssue | ZodInvalidUnionDiscriminatorIssue | ZodInvalidEnumValueIssue | ZodInvalidArgumentsIssue | ZodInvalidReturnTypeIssue | ZodInvalidDateIssue | ZodInvalidStringIssue | ZodTooSmallIssue | ZodTooBigIssue | ZodInvalidIntersectionTypesIssue | ZodNotMultipleOfIssue | ZodNotFiniteIssue | ZodCustomIssue;

interface ZodInvalidTypeIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_type;
    expected: ZodParsedType;
    received: ZodParsedType;
}

type ZodParsedType = keyof typeof ZodParsedType;

type ZodIssueBase = {
    path: (string | number)[];
    message?: string | undefined;
};

interface ZodInvalidLiteralIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_literal;
    expected: unknown;
    received: unknown;
}

interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.unrecognized_keys;
    keys: string[];
}

interface ZodInvalidUnionIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_union;
    unionErrors: ZodError[];
}

class ZodError<T = any> extends Error {
    issues: ZodIssue[];
    get errors(): ZodIssue[];
    constructor(issues: ZodIssue[]);
    format(): ZodFormattedError<T>;
    format<U>(mapper: (issue: ZodIssue) => U): ZodFormattedError<T, U>;
    static create: (issues: ZodIssue[]) => ZodError<any>;
    static assert(value: unknown): asserts value is ZodError;
    toString(): string;
    get message(): string;
    get isEmpty(): boolean;
    addIssue: (sub: ZodIssue) => void;
    addIssues: (subs?: ZodIssue[]) => void;
    flatten(): typeToFlattenedError<T>;
    flatten<U>(mapper?: (issue: ZodIssue) => U): typeToFlattenedError<T, U>;
    get formErrors(): typeToFlattenedError<T, string>;
}

type ZodIssue = ZodIssueOptionalMessage & {
    fatal?: boolean | undefined;
    message: string;
};

type ZodFormattedError<T, U = string> = {
    _errors: U[];
} & recursiveZodFormattedError<NonNullable<T>>;

type recursiveZodFormattedError<T> = T extends [
    any,
    ...any[]
] ? {
    [K in keyof T]?: ZodFormattedError<T[K]>;
} : T extends any[] ? {
    [k: number]: ZodFormattedError<T[number]>;
} : T extends object ? {
    [K in keyof T]?: ZodFormattedError<T[K]>;
} : unknown;

type typeToFlattenedError<T, U = string> = {
    formErrors: U[];
    fieldErrors: {
        [P in allKeys<T>]?: U[];
    };
};

type allKeys<T> = T extends any ? keyof T : never;

interface ZodInvalidUnionDiscriminatorIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_union_discriminator;
    options: Primitive[];
}

type Primitive = string | number | symbol | bigint | boolean | null | undefined;

interface ZodInvalidEnumValueIssue extends ZodIssueBase {
    received: string | number;
    code: typeof ZodIssueCode.invalid_enum_value;
    options: (string | number)[];
}

interface ZodInvalidArgumentsIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_arguments;
    argumentsError: ZodError;
}

interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_return_type;
    returnTypeError: ZodError;
}

interface ZodInvalidDateIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_date;
}

interface ZodInvalidStringIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_string;
    validation: StringValidation;
}

type StringValidation = "email" | "url" | "emoji" | "uuid" | "nanoid" | "regex" | "cuid" | "cuid2" | "ulid" | "datetime" | "date" | "time" | "duration" | "ip" | "cidr" | "base64" | "jwt" | "base64url" | {
    includes: string;
    position?: number | undefined;
} | {
    startsWith: string;
} | {
    endsWith: string;
};

interface ZodTooSmallIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_small;
    minimum: number | bigint;
    inclusive: boolean;
    exact?: boolean;
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
}

interface ZodTooBigIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.too_big;
    maximum: number | bigint;
    inclusive: boolean;
    exact?: boolean;
    type: "array" | "string" | "number" | "set" | "date" | "bigint";
}

interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.invalid_intersection_types;
}

interface ZodNotMultipleOfIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.not_multiple_of;
    multipleOf: number | bigint;
}

interface ZodNotFiniteIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.not_finite;
}

interface ZodCustomIssue extends ZodIssueBase {
    code: typeof ZodIssueCode.custom;
    params?: {
        [k: string]: any;
    };
}

type ErrorMapCtx = {
    defaultError: string;
    data: any;
};

type StandardSchemaV1<Input = unknown, Output = Input> = {
    readonly "~standard": StandardSchemaV1.Props<Input, Output>;
};

type ParseInput = {
    data: any;
    path: (string | number)[];
    parent: ParseContext;
};

interface ParseContext {
    readonly common: {
        readonly issues: ZodIssue[];
        readonly contextualErrorMap?: ZodErrorMap | undefined;
        readonly async: boolean;
    };
    readonly path: ParsePath;
    readonly schemaErrorMap?: ZodErrorMap | undefined;
    readonly parent: ParseContext | null;
    readonly data: any;
    readonly parsedType: ZodParsedType;
}

type ParsePath = ParsePathComponent[];

type ParsePathComponent = string | number;

type ParseReturnType<T> = SyncParseReturnType<T> | AsyncParseReturnType<T>;

type SyncParseReturnType<T = any> = OK<T> | DIRTY<T> | INVALID;

type OK<T> = {
    status: "valid";
    value: T;
};

type DIRTY<T> = {
    status: "dirty";
    value: T;
};

type INVALID = {
    status: "aborted";
};

type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;

class ParseStatus {
    value: "aborted" | "dirty" | "valid";
    dirty(): void;
    abort(): void;
    static mergeArray(status: ParseStatus, results: SyncParseReturnType<any>[]): SyncParseReturnType;
    static mergeObjectAsync(status: ParseStatus, pairs: {
        key: ParseReturnType<any>;
        value: ParseReturnType<any>;
    }[]): Promise<SyncParseReturnType<any>>;
    static mergeObjectSync(status: ParseStatus, pairs: {
        key: SyncParseReturnType<any>;
        value: SyncParseReturnType<any>;
        alwaysSet?: boolean;
    }[]): SyncParseReturnType;
}

type ParseParams = {
    path: (string | number)[];
    errorMap: ZodErrorMap;
    async: boolean;
};

type SafeParseReturnType<Input, Output> = SafeParseSuccess<Output> | SafeParseError<Input>;

type SafeParseSuccess<Output> = {
    success: true;
    data: Output;
    error?: never;
};

type SafeParseError<Input> = {
    success: false;
    error: ZodError<Input>;
    data?: never;
};

type CustomErrorParams = Partial<util.Omit<ZodCustomIssue, "code">>;

class ZodEffects<T extends ZodTypeAny, Output = output<T>, Input = input<T>> extends ZodType<Output, ZodEffectsDef<T>, Input> {
    innerType(): T;
    sourceType(): T;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <I extends ZodTypeAny>(schema: I, effect: Effect<I["_output"]>, params?: RawCreateParams) => ZodEffects<I, I["_output"]>;
    static createWithPreprocess: <I extends ZodTypeAny>(preprocess: (arg: unknown, ctx: RefinementCtx) => unknown, schema: I, params?: RawCreateParams) => ZodEffects<I, I["_output"], unknown>;
}

type ZodTypeAny = ZodType<any, any, any>;

type output<T extends ZodType<any, any, any>> = T["_output"];

type input<T extends ZodType<any, any, any>> = T["_input"];

interface ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    schema: T;
    typeName: ZodFirstPartyTypeKind.ZodEffects;
    effect: Effect<any>;
}

enum ZodFirstPartyTypeKind {
    ZodString = "ZodString",
    ZodNumber = "ZodNumber",
    ZodNaN = "ZodNaN",
    ZodBigInt = "ZodBigInt",
    ZodBoolean = "ZodBoolean",
    ZodDate = "ZodDate",
    ZodSymbol = "ZodSymbol",
    ZodUndefined = "ZodUndefined",
    ZodNull = "ZodNull",
    ZodAny = "ZodAny",
    ZodUnknown = "ZodUnknown",
    ZodNever = "ZodNever",
    ZodVoid = "ZodVoid",
    ZodArray = "ZodArray",
    ZodObject = "ZodObject",
    ZodUnion = "ZodUnion",
    ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
    ZodIntersection = "ZodIntersection",
    ZodTuple = "ZodTuple",
    ZodRecord = "ZodRecord",
    ZodMap = "ZodMap",
    ZodSet = "ZodSet",
    ZodFunction = "ZodFunction",
    ZodLazy = "ZodLazy",
    ZodLiteral = "ZodLiteral",
    ZodEnum = "ZodEnum",
    ZodEffects = "ZodEffects",
    ZodNativeEnum = "ZodNativeEnum",
    ZodOptional = "ZodOptional",
    ZodNullable = "ZodNullable",
    ZodDefault = "ZodDefault",
    ZodCatch = "ZodCatch",
    ZodPromise = "ZodPromise",
    ZodBranded = "ZodBranded",
    ZodPipeline = "ZodPipeline",
    ZodReadonly = "ZodReadonly"
}

type Effect<T> = RefinementEffect<T> | TransformEffect<T> | PreprocessEffect<T>;

type RefinementEffect<T> = {
    type: "refinement";
    refinement: (arg: T, ctx: RefinementCtx) => any;
};

interface RefinementCtx {
    addIssue: (arg: IssueData) => void;
    path: (string | number)[];
}

type IssueData = stripPath<ZodIssueOptionalMessage> & {
    path?: (string | number)[];
    fatal?: boolean | undefined;
};

type stripPath<T extends object> = T extends any ? util.OmitKeys<T, "path"> : never;

type TransformEffect<T> = {
    type: "transform";
    transform: (arg: T, ctx: RefinementCtx) => any;
};

type PreprocessEffect<T> = {
    type: "preprocess";
    transform: (arg: T, ctx: RefinementCtx) => any;
};

type RawCreateParams = {
    errorMap?: ZodErrorMap | undefined;
    invalid_type_error?: string | undefined;
    required_error?: string | undefined;
    message?: string | undefined;
    description?: string | undefined;
} | undefined;

class ZodOptional<T extends ZodTypeAny> extends ZodType<T["_output"] | undefined, ZodOptionalDef<T>, T["_input"] | undefined> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    unwrap(): T;
    static create: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodOptional<Inner>;
}

interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    typeName: ZodFirstPartyTypeKind.ZodOptional;
}

class ZodNullable<T extends ZodTypeAny> extends ZodType<T["_output"] | null, ZodNullableDef<T>, T["_input"] | null> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    unwrap(): T;
    static create: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodNullable<Inner>;
}

interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    typeName: ZodFirstPartyTypeKind.ZodNullable;
}

class ZodArray<T extends ZodTypeAny, Cardinality extends ArrayCardinality = "many"> extends ZodType<arrayOutputType<T, Cardinality>, ZodArrayDef<T>, Cardinality extends "atleastone" ? [
    T["_input"],
    ...T["_input"][]
] : T["_input"][]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get element(): T;
    min(minLength: number, message?: errorUtil.ErrMessage): this;
    max(maxLength: number, message?: errorUtil.ErrMessage): this;
    length(len: number, message?: errorUtil.ErrMessage): this;
    nonempty(message?: errorUtil.ErrMessage): ZodArray<T, "atleastone">;
    static create: <El extends ZodTypeAny>(schema: El, params?: RawCreateParams) => ZodArray<El>;
}

type ArrayCardinality = "many" | "atleastone";

type arrayOutputType<T extends ZodTypeAny, Cardinality extends ArrayCardinality = "many"> = Cardinality extends "atleastone" ? [
    T["_output"],
    ...T["_output"][]
] : T["_output"][];

interface ZodArrayDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    type: T;
    typeName: ZodFirstPartyTypeKind.ZodArray;
    exactLength: {
        value: number;
        message?: string | undefined;
    } | null;
    minLength: {
        value: number;
        message?: string | undefined;
    } | null;
    maxLength: {
        value: number;
        message?: string | undefined;
    } | null;
}

class ZodPromise<T extends ZodTypeAny> extends ZodType<Promise<T["_output"]>, ZodPromiseDef<T>, Promise<T["_input"]>> {
    unwrap(): T;
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <Inner extends ZodTypeAny>(schema: Inner, params?: RawCreateParams) => ZodPromise<Inner>;
}

interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    type: T;
    typeName: ZodFirstPartyTypeKind.ZodPromise;
}

class ZodUnion<T extends ZodUnionOptions> extends ZodType<T[number]["_output"], ZodUnionDef<T>, T[number]["_input"]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    get options(): T;
    static create: <Options extends Readonly<[
        ZodTypeAny,
        ZodTypeAny,
        ...ZodTypeAny[]
    ]>>(types: Options, params?: RawCreateParams) => ZodUnion<Options>;
}

type ZodUnionOptions = Readonly<[
    ZodTypeAny,
    ...ZodTypeAny[]
]>;

interface ZodUnionDef<T extends ZodUnionOptions = Readonly<[
    ZodTypeAny,
    ZodTypeAny,
    ...ZodTypeAny[]
]>> extends ZodTypeDef {
    options: T;
    typeName: ZodFirstPartyTypeKind.ZodUnion;
}

class ZodIntersection<T extends ZodTypeAny, U extends ZodTypeAny> extends ZodType<T["_output"] & U["_output"], ZodIntersectionDef<T, U>, T["_input"] & U["_input"]> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <TSchema extends ZodTypeAny, USchema extends ZodTypeAny>(left: TSchema, right: USchema, params?: RawCreateParams) => ZodIntersection<TSchema, USchema>;
}

interface ZodIntersectionDef<T extends ZodTypeAny = ZodTypeAny, U extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    left: T;
    right: U;
    typeName: ZodFirstPartyTypeKind.ZodIntersection;
}

class ZodDefault<T extends ZodTypeAny> extends ZodType<util.noUndefined<T["_output"]>, ZodDefaultDef<T>, T["_input"] | undefined> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    removeDefault(): T;
    static create: <Inner extends ZodTypeAny>(type: Inner, params: RawCreateParams & {
        default: Inner["_input"] | (() => util.noUndefined<Inner["_input"]>);
    }) => ZodDefault<Inner>;
}

interface ZodDefaultDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    defaultValue: () => util.noUndefined<T["_input"]>;
    typeName: ZodFirstPartyTypeKind.ZodDefault;
}

class ZodBranded<T extends ZodTypeAny, B extends string | number | symbol> extends ZodType<T["_output"] & BRAND<B>, ZodBrandedDef<T>, T["_input"]> {
    _parse(input: ParseInput): ParseReturnType<any>;
    unwrap(): T;
}

type BRAND<T extends string | number | symbol> = {
    [BRAND]: {
        [k in T]: true;
    };
};

interface ZodBrandedDef<T extends ZodTypeAny> extends ZodTypeDef {
    type: T;
    typeName: ZodFirstPartyTypeKind.ZodBranded;
}

class ZodCatch<T extends ZodTypeAny> extends ZodType<T["_output"], ZodCatchDef<T>, unknown> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    removeCatch(): T;
    static create: <Inner extends ZodTypeAny>(type: Inner, params: RawCreateParams & {
        catch: Inner["_output"] | (() => Inner["_output"]);
    }) => ZodCatch<Inner>;
}

interface ZodCatchDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    catchValue: (ctx: {
        error: ZodError;
        input: unknown;
    }) => T["_input"];
    typeName: ZodFirstPartyTypeKind.ZodCatch;
}

class ZodPipeline<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodType<B["_output"], ZodPipelineDef<A, B>, A["_input"]> {
    _parse(input: ParseInput): ParseReturnType<any>;
    static create<ASchema extends ZodTypeAny, BSchema extends ZodTypeAny>(a: ASchema, b: BSchema): ZodPipeline<ASchema, BSchema>;
}

interface ZodPipelineDef<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodTypeDef {
    in: A;
    out: B;
    typeName: ZodFirstPartyTypeKind.ZodPipeline;
}

class ZodReadonly<T extends ZodTypeAny> extends ZodType<MakeReadonly<T["_output"]>, ZodReadonlyDef<T>, MakeReadonly<T["_input"]>> {
    _parse(input: ParseInput): ParseReturnType<this["_output"]>;
    static create: <Inner extends ZodTypeAny>(type: Inner, params?: RawCreateParams) => ZodReadonly<Inner>;
    unwrap(): T;
}

type MakeReadonly<T> = T extends Map<infer K, infer V> ? ReadonlyMap<K, V> : T extends Set<infer V> ? ReadonlySet<V> : T extends [
    infer Head,
    ...infer Tail
] ? readonly [
    Head,
    ...Tail
] : T extends Array<infer V> ? ReadonlyArray<V> : T extends BuiltIn ? T : Readonly<T>;

type BuiltIn = (((...args: any[]) => any) | (new (...args: any[]) => any)) | {
    readonly [Symbol.toStringTag]: string;
} | Date | Error | Generator | Promise<unknown> | RegExp;

interface ZodReadonlyDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    typeName: ZodFirstPartyTypeKind.ZodReadonly;
}

interface ToolCallContext {
    status: (text: string) => void;
    warn: (text: string) => void;
    signal: AbortSignal;
    callId: number;
}

interface ToolBase {
    name: string;
    description: string;
}

interface RawFunctionTool extends ToolBase {
    type: "rawFunction";
    parametersJsonSchema: any;
    checkParameters: (params: any) => void;
    implementation: (params: Record<string, unknown>, ctx: ToolCallContext) => any | Promise<any>;
}

type LLMActionOpts<TStructuredOutputType = unknown> = LLMPredictionConfigInput<TStructuredOutputType> & LLMActBaseOpts<PredictionResult> & {
    preset?: string;
};

interface LLMActBaseOpts<TPredictionResult> {
    onFirstToken?: (roundIndex: number) => void;
    onPredictionFragment?: (fragment: LLMPredictionFragmentWithRoundIndex) => void;
    onMessage?: (message: ChatMessage) => void;
    onRoundStart?: (roundIndex: number) => void;
    onRoundEnd?: (roundIndex: number) => void;
    onPredictionCompleted?: (predictionResult: TPredictionResult) => void;
    onPromptProcessingProgress?: (roundIndex: number, progress: number) => void;
    onToolCallRequestStart?: (roundIndex: number, callId: number) => void;
    onToolCallRequestNameReceived?: (roundIndex: number, callId: number, name: string) => void;
    onToolCallRequestArgumentFragmentGenerated?: (roundIndex: number, callId: number, content: string) => void;
    onToolCallRequestEnd?: (roundIndex: number, callId: number, info: {
        isQueued: boolean;
        toolCallRequest: ToolCallRequest;
        rawContent: string | undefined;
    }) => void;
    onToolCallRequestFailure?: (roundIndex: number, callId: number, error: ToolCallRequestError) => void;
    onToolCallRequestDequeued?: (roundIndex: number, callId: number) => void;
    handleInvalidToolRequest?: (error: ToolCallRequestError, request: ToolCallRequest | undefined) => any | Promise<any>;
    maxPredictionRounds?: number;
    signal?: AbortSignal;
    allowParallelToolExecution?: boolean;
}

type LLMPredictionFragmentWithRoundIndex = LLMPredictionFragment & {
    roundIndex: number;
};

class ActResult {
    readonly rounds: number;
    readonly totalExecutionTimeSeconds: number;
    constructor(rounds: number, totalExecutionTimeSeconds: number);
}

interface LLMApplyPromptTemplateOpts {
    omitBosToken?: boolean;
    omitEosToken?: boolean;
    toolDefinitions?: Array<LLMTool>;
}

class LLM extends LLMDynamicHandle implements SpecificModel {
    readonly identifier: string;
    readonly path: string;
    readonly modelKey: string;
    readonly format: ModelCompatibilityType;
    readonly displayName: string;
    readonly sizeBytes: number;
    readonly vision: boolean;
    readonly trainedForToolUse: boolean;
    unload(): Promise<void>;
    getModelInfo(): Promise<LLMInstanceInfo>;
}

interface SpecificModel extends DynamicHandle<ModelInstanceInfoBase> {
    readonly identifier: string;
    readonly path: string;
    unload(): Promise<void>;
}

class LLMGeneratorHandle {
    respond(chat: ChatLike, opts?: LLMGeneratorPredictionOpts): OngoingGeneratorPrediction;
    act(chat: ChatLike, tools: Array<Tool>, opts?: LLMGeneratorActOpts): Promise<ActResult>;
}

interface LLMGeneratorPredictionOpts {
    onFirstToken?: () => void;
    onPredictionFragment?: (fragment: LLMPredictionFragment) => void;
    onMessage?: (message: ChatMessage) => void;
    signal?: AbortSignal;
    pluginConfig?: KVConfig;
    workingDirectory?: string;
}

class OngoingGeneratorPrediction extends StreamablePromise<LLMPredictionFragment, GeneratorPredictionResult> {
    private readonly pluginIdentifier;
    private readonly onCancel;
    protected collect(fragments: ReadonlyArray<LLMPredictionFragment>): Promise<GeneratorPredictionResult>;
    private constructor();
    result(): Promise<GeneratorPredictionResult>;
    cancel(): Promise<void>;
}

class GeneratorPredictionResult implements BasePredictionResult {
    readonly content: string;
    readonly reasoningContent: string;
    readonly nonReasoningContent: string;
    readonly pluginIdentifier: string;
    constructor(content: string, reasoningContent: string, nonReasoningContent: string, pluginIdentifier: string);
}

type LLMGeneratorActOpts = LLMActBaseOpts<GeneratorPredictionResult> & {
    pluginConfig?: KVConfig;
    workingDirectory?: string;
};

abstract class ModelNamespace<TLoadModelConfig, TModelInstanceInfo extends ModelInstanceInfoBase, TModelInfo extends ModelInfoBase, TDynamicHandle extends DynamicHandle<TModelInstanceInfo>, TSpecificModel> {
    load(modelKey: string, opts?: BaseLoadModelOpts<TLoadModelConfig>): Promise<TSpecificModel>;
    unload(identifier: string): Promise<void>;
    listLoaded(): Promise<Array<TSpecificModel>>;
    private getAny;
    createDynamicHandle(query: ModelQuery): TDynamicHandle;
    createDynamicHandle(identifier: string): TDynamicHandle;
    createDynamicHandleFromInstanceReference(instanceReference: string): TDynamicHandle;
    model(modelKey: string, opts?: BaseLoadModelOpts<TLoadModelConfig>): Promise<TSpecificModel>;
    model(): Promise<TSpecificModel>;
}

interface BaseLoadModelOpts<TLoadModelConfig> {
    identifier?: string;
    config?: TLoadModelConfig;
    signal?: AbortSignal;
    ttl?: number;
    verbose?: boolean | LogLevel;
    onProgress?: (progress: number) => void;
}

interface ModelQuery {
    domain?: ModelDomainType;
    identifier?: string;
    path?: string;
    vision?: boolean;
}

type ModelDomainType = "llm" | "embedding" | "imageGen" | "transcription" | "tts";

class EmbeddingNamespace extends ModelNamespace<EmbeddingLoadModelConfig, EmbeddingModelInstanceInfo, EmbeddingModelInfo, EmbeddingDynamicHandle, EmbeddingModel> {
}

interface EmbeddingLoadModelConfig {
    gpu?: GPUSetting;
    contextLength?: number;
    ropeFrequencyBase?: number;
    ropeFrequencyScale?: number;
    keepModelInMemory?: boolean;
    tryMmap?: boolean;
}

type EmbeddingModelInfo = {
    type: "embedding";
} & ModelInfoBase & EmbeddingModelAdditionalInfo;

class EmbeddingModel extends EmbeddingDynamicHandle implements SpecificModel {
    readonly identifier: string;
    readonly path: string;
    readonly modelKey: string;
    readonly format: ModelCompatibilityType;
    readonly displayName: string;
    readonly sizeBytes: number;
    unload(): Promise<void>;
    getModelInfo(): Promise<EmbeddingModelInstanceInfo>;
}

class SystemNamespace {
    private readonly systemPort;
    private readonly validator;
    listDownloadedModels(): Promise<Array<ModelInfo>>;
    listDownloadedModels(domain: "llm"): Promise<Array<LLMInfo>>;
    listDownloadedModels(domain: "embedding"): Promise<Array<EmbeddingModelInfo>>;
    whenDisconnected(): Promise<void>;
    notify(notification: BackendNotification): Promise<void>;
    getLMStudioVersion(): Promise<{
        version: string;
        build: number;
    }>;
    unstable_setExperimentFlag(flag: string, value: boolean): Promise<void>;
    unstable_getExperimentFlags(): Promise<Array<string>>;
}

type ModelInfo = LLMInfo | EmbeddingModelInfo;

interface BackendNotification {
    title: string;
    description?: string;
    noAutoDismiss?: boolean;
}

class DiagnosticsNamespace {
    private readonly diagnosticsPort;
    private readonly validator;
    unstable_streamLogs(listener: (logEvent: DiagnosticsLogEvent) => void): () => void;
}

type DiagnosticsLogEvent = {
    timestamp: number;
    data: DiagnosticsLogEventData;
};

type DiagnosticsLogEventData = {
    type: "llm.prediction.input";
    modelPath: string;
    modelIdentifier: string;
    input: string;
};

class RepositoryNamespace {
    private readonly repositoryPort;
    private readonly validator;
    searchModels(opts: ModelSearchOpts): Promise<Array<ModelSearchResultEntry>>;
    installPluginDependencies(pluginFolder: string): Promise<void>;
    downloadArtifact(opts: DownloadArtifactOpts): Promise<void>;
    pushArtifact(opts: PushArtifactOpts): Promise<void>;
    getLocalArtifactFileList(path: string): Promise<LocalArtifactFileList>;
    ensureAuthenticated(opts: EnsureAuthenticatedOpts): Promise<void>;
    loginWithPreAuthenticatedKeys(opts: LoginWithPreAuthenticatedKeysOpts): Promise<LoginWithPreAuthenticatedKeysResult>;
    private readonly downloadPlanFinalizationRegistry;
    createArtifactDownloadPlanner(opts: CreateArtifactDownloadPlannerOpts): ArtifactDownloadPlanner;
}

interface ModelSearchOpts {
    searchTerm?: string;
    limit?: number;
    compatibilityTypes?: Array<ModelCompatibilityType>;
}

class ModelSearchResultEntry {
    private readonly logger;
    private readonly data;
    readonly name: string;
    isExactMatch(): boolean;
    isStaffPick(): boolean;
    getDownloadOptions(): Promise<Array<ModelSearchResultDownloadOption>>;
}

class ModelSearchResultDownloadOption {
    private readonly logger;
    private readonly data;
    readonly quantization?: string;
    readonly name: string;
    readonly sizeBytes: number;
    readonly fitEstimation?: ModelSearchResultDownloadOptionFitEstimation;
    readonly indexedModelIdentifier: string;
    isRecommended(): boolean;
    download(opts?: DownloadOpts): Promise<string>;
}

type ModelSearchResultDownloadOptionFitEstimation = "fullGPUOffload" | "partialGPUOffload" | "fitWithoutGPU" | "willNotFit";

interface DownloadOpts {
    onProgress?: (update: DownloadProgressUpdate) => void;
    onStartFinalizing?: () => void;
    signal?: AbortSignal;
}

interface DownloadProgressUpdate {
    downloadedBytes: number;
    totalBytes: number;
    speedBytesPerSecond: number;
}

interface DownloadArtifactOpts {
    owner: string;
    name: string;
    revisionNumber: number;
    path: string;
    onProgress?: (update: DownloadProgressUpdate) => void;
    onStartFinalizing?: () => void;
    signal?: AbortSignal;
}

interface PushArtifactOpts {
    path: string;
    description?: string;
    makePrivate?: boolean;
    writeRevision?: boolean;
    overrides?: any;
    onMessage?: (message: string) => void;
}

interface LocalArtifactFileList {
    files: Array<LocalArtifactFileEntry>;
    usedIgnoreFile: string | null;
}

interface LocalArtifactFileEntry {
    relativePath: string;
    sizeBytes: number;
}

interface EnsureAuthenticatedOpts {
    onAuthenticationUrl: (url: string) => void;
}

interface LoginWithPreAuthenticatedKeysOpts {
    keyId: string;
    publicKey: string;
    privateKey: string;
}

interface LoginWithPreAuthenticatedKeysResult {
    userName: string;
}

interface CreateArtifactDownloadPlannerOpts {
    owner: string;
    name: string;
    onPlanUpdated?: (plan: ArtifactDownloadPlan) => void;
}

interface ArtifactDownloadPlan {
    nodes: Array<ArtifactDownloadPlanNode>;
    downloadSizeBytes: number;
}

type ArtifactDownloadPlanNode = {
    type: "artifact";
    owner: string;
    name: string;
    state: ArtifactDownloadPlanNodeState;
    artifactType?: ArtifactType;
    sizeBytes?: number;
    dependencyNodes: Array<number>;
} | {
    type: "model";
    state: ArtifactDownloadPlanNodeState;
    resolvedSources?: number;
    totalSources?: number;
    alreadyOwned?: ArtifactDownloadPlanModelInfo;
    selected?: ArtifactDownloadPlanModelInfo;
};

type ArtifactDownloadPlanNodeState = "pending" | "fetching" | "satisfied" | "completed";

type ArtifactType = "plugin" | "preset" | "model";

type ArtifactDownloadPlanModelInfo = {
    displayName: string;
    sizeBytes: number;
    quantName?: string;
    compatibilityType: ModelCompatibilityType;
};

class ArtifactDownloadPlanner {
    readonly owner: string;
    readonly name: string;
    private readonly onPlanUpdated;
    private readonly validator;
    private readonly onDisposed;
    private readyDeferredPromise;
    private readonly logger;
    private isReadyBoolean;
    private planValue;
    private currentDownload;
    private errorReceivedBeforeDownloadStart;
    [Symbol.dispose](): void;
    isReady(): boolean;
    untilReady(): Promise<void>;
    getPlan(): ArtifactDownloadPlan;
    download(opts: ArtifactDownloadPlannerDownloadOpts): Promise<void>;
}

interface ArtifactDownloadPlannerDownloadOpts {
    onStartFinalizing?: () => void;
    onProgress?: (update: DownloadProgressUpdate) => void;
    signal?: AbortSignal;
}

class PluginsNamespace {
    private readonly client;
    private readonly validator;
    private readonly rootLogger;
    registerDevelopmentPlugin(opts: RegisterDevelopmentPluginOpts): Promise<RegisterDevelopmentPluginResult>;
    reindexPlugins(): Promise<void>;
    getSelfRegistrationHost(): PluginSelfRegistrationHost;
}

interface RegisterDevelopmentPluginOpts {
    manifest: PluginManifest;
}

interface PluginManifest extends ArtifactManifestBase {
    type: "plugin";
    runner: PluginRunnerType;
}

type PluginRunnerType = "ecmascript" | "node" | "mcpBridge";

interface ArtifactManifestBase {
    owner: string;
    name: string;
    revision?: number;
    dependencies?: Array<ArtifactDependency>;
    tags?: Array<string>;
}

type ArtifactDependency = ArtifactModelDependency | ArtifactArtifactDependency;

interface ArtifactModelDependency extends ArtifactDependencyBase {
    type: "model";
    modelKeys: Array<string>;
    sources: Array<ModelDownloadSource>;
}

type ModelDownloadSource = HuggingFaceModelDownloadSource;

type HuggingFaceModelDownloadSource = {
    type: "huggingface";
    user: string;
    repo: string;
};

interface ArtifactDependencyBase {
    purpose: ArtifactDependencyPurpose;
}

type ArtifactDependencyPurpose = "baseModel" | "draftModel" | "custom";

interface ArtifactArtifactDependency extends ArtifactDependencyBase {
    type: "artifact";
    owner: string;
    name: string;
}

interface RegisterDevelopmentPluginResult {
    clientIdentifier: string;
    clientPasskey: string;
    unregister: () => Promise<void>;
}

class PluginSelfRegistrationHost {
    private readonly port;
    private readonly client;
    private readonly rootLogger;
    private readonly validator;
    constructor(port: PluginsPort, client: LMStudioClient, rootLogger: LoggerInterface, validator: Validator);
    setPromptPreprocessor(promptPreprocessor: PromptPreprocessor): void;
    setPredictionLoopHandler(predictionLoopHandler: PredictionLoopHandler): void;
    setConfigSchematics(configSchematics: ConfigSchematics<any>): Promise<void>;
    setGlobalConfigSchematics(globalConfigSchematics: ConfigSchematics<any>): Promise<void>;
    setToolsProvider(toolsProvider: ToolsProvider): void;
    setGenerator(generator: Generator_2): void;
    initCompleted(): Promise<void>;
}

type PluginsPort = InferClientPort<typeof createPluginsBackendInterface>;

type InferClientPort<TBackendInterfaceOrCreator> = TBackendInterfaceOrCreator extends BackendInterface<infer _TContext, infer TRpcEndpoints, infer TChannelEndpoints, infer TSignalEndpoints, infer TWritableSignalEndpoints> ? ClientPort<TRpcEndpoints, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints> : TBackendInterfaceOrCreator extends (...ars: Array<any>) => BackendInterface<infer _TContext, infer TRpcEndpoints, infer TChannelEndpoints, infer TSignalEndpoints, infer TWritableSignalEndpoints> ? ClientPort<TRpcEndpoints, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints> : never;

class BackendInterface<TContext = never, TRpcEndpoints extends RpcEndpointsSpecBase = {}, TChannelEndpoints extends ChannelEndpointsSpecBase = {}, TSignalEndpoints extends SignalEndpointsSpecBase = {}, TWritableSignalEndpoints extends WritableSignalEndpointsSpecBase = {}> {
    private unhandledEndpoints;
    private existingEndpointNames;
    private rpcEndpoints;
    private channelEndpoints;
    private signalEndpoints;
    private writableSignalEndpoints;
    constructor();
    withContextType<TContextType>(): BackendInterface<TContextType, TRpcEndpoints, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints>;
    private assertEndpointNameNotExists;
    addRpcEndpoint<TEndpointName extends string, TParametersZod extends ZodType, TReturnsZod extends ZodType>(endpointName: TEndpointName, { parameter, returns, serialization, }: {
        parameter: TParametersZod;
        returns: TReturnsZod;
        serialization?: SerializationType;
    }): BackendInterface<TContext, TRpcEndpoints & {
        [endpointName in TEndpointName]: {
            parameter: z.infer<TParametersZod>;
            returns: z.infer<TReturnsZod>;
        };
    }, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints>;
    addChannelEndpoint<TEndpointName extends string, TCreationParameterZod extends ZodType, TToServerPacketZod extends ZodType, TToClientPacketZod extends ZodType>(endpointName: TEndpointName, { creationParameter, toServerPacket, toClientPacket, serialization, }: {
        creationParameter: TCreationParameterZod;
        toServerPacket: TToServerPacketZod;
        toClientPacket: TToClientPacketZod;
        serialization?: SerializationType;
    }): BackendInterface<TContext, TRpcEndpoints, TChannelEndpoints & {
        [endpointName in TEndpointName]: {
            creationParameter: z.infer<TCreationParameterZod>;
            toServerPacket: z.infer<TToServerPacketZod>;
            toClientPacket: z.infer<TToClientPacketZod>;
        };
    }, TSignalEndpoints, TWritableSignalEndpoints>;
    addSignalEndpoint<TEndpointName extends string, TCreationParameterZod extends ZodType, TSignalDataZod extends ZodType>(endpointName: TEndpointName, { creationParameter, signalData, serialization, }: {
        creationParameter: TCreationParameterZod;
        signalData: TSignalDataZod;
        serialization?: SerializationType;
    }): BackendInterface<TContext, TRpcEndpoints, TChannelEndpoints, TSignalEndpoints & {
        [endpointName in TEndpointName]: {
            creationParameter: z.infer<TCreationParameterZod>;
            signalData: z.infer<TSignalDataZod>;
        };
    }, TWritableSignalEndpoints>;
    addWritableSignalEndpoint<TEndpointName extends string, TCreationParameterZod extends ZodType, TSignalDataZod extends ZodType>(endpointName: TEndpointName, { creationParameter, signalData, serialization, }: {
        creationParameter: TCreationParameterZod;
        signalData: TSignalDataZod;
        serialization?: SerializationType;
    }): BackendInterface<TContext, TRpcEndpoints, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints & {
        [endpointName in TEndpointName]: {
            creationParameter: z.infer<TCreationParameterZod>;
            signalData: z.infer<TSignalDataZod>;
        };
    }>;
    handleRpcEndpoint<TEndpointName extends keyof TRpcEndpoints & string>(endpointName: TEndpointName, handler: RpcEndpointHandler<TContext, TRpcEndpoints[TEndpointName]["parameter"], TRpcEndpoints[TEndpointName]["returns"]>): void;
    handleChannelEndpoint<TEndpointName extends keyof TChannelEndpoints & string>(endpointName: TEndpointName, handler: ChannelEndpointHandler<TContext, TChannelEndpoints[TEndpointName]["creationParameter"], TChannelEndpoints[TEndpointName]["toServerPacket"], TChannelEndpoints[TEndpointName]["toClientPacket"]>): void;
    handleSignalEndpoint<TEndpointName extends keyof TSignalEndpoints & string>(endpointName: TEndpointName, handler: SignalEndpointHandler<TContext, TSignalEndpoints[TEndpointName]["creationParameter"], TSignalEndpoints[TEndpointName]["signalData"]>): void;
    handleWritableSignalEndpoint<TEndpointName extends keyof TWritableSignalEndpoints & string>(endpointName: TEndpointName, handler: WritableSignalEndpointHandler<TContext, TWritableSignalEndpoints[TEndpointName]["creationParameter"], TWritableSignalEndpoints[TEndpointName]["signalData"]>): void;
    assertAllEndpointsHandled(): void;
    getRpcEndpoint(endpointName: string): RpcEndpoint | undefined;
    getAllRpcEndpoints(): RpcEndpoint[];
    getChannelEndpoint(endpointName: string): ChannelEndpoint | undefined;
    getAllChannelEndpoints(): ChannelEndpoint[];
    getSignalEndpoint(endpointName: string): SignalEndpoint | undefined;
    getAllSignalEndpoints(): SignalEndpoint[];
    getWritableSignalEndpoint(endpointName: string): WritableSignalEndpoint | undefined;
    getAllWritableSignalEndpoints(): WritableSignalEndpoint[];
}

type RpcEndpointsSpecBase = {
    [endpointName: string]: RpcEndpointSpecBase;
};

interface RpcEndpointSpecBase {
    parameter: any;
    returns: any;
}

type ChannelEndpointsSpecBase = {
    [endpointName: string]: ChannelEndpointSpecBase;
};

interface ChannelEndpointSpecBase {
    creationParameter: any;
    toServerPacket: any;
    toClientPacket: any;
}

type SignalEndpointsSpecBase = {
    [endpointName: string]: SignalEndpointSpecBase;
};

interface SignalEndpointSpecBase {
    creationParameter: any;
    signalData: any;
}

type WritableSignalEndpointsSpecBase = {
    [endpointName: string]: WritableSignalEndpointSpecBase;
};

interface WritableSignalEndpointSpecBase {
    creationParameter: any;
    signalData: any;
}

type SerializationType = "raw" | "superjson";

type RpcEndpointHandler<TContext = any, TParameter = any, TReturns = any> = (ctx: TContext, parameter: TParameter) => TReturns | Promise<TReturns>;

type ChannelEndpointHandler<TContext = any, TCreationParameter = any, TToServerPacket = any, TToClientPacket = any> = (ctx: TContext, creationParameter: TCreationParameter, channel: Channel<TToServerPacket, TToClientPacket>) => Promise<void>;

class Channel<TIncomingPacket, TOutgoingPacket> {
    private readonly innerSend;
    readonly onMessage: BufferedEvent<TIncomingPacket>;
    private readonly emitOnMessage;
    readonly onError: BufferedEvent<any>;
    private readonly emitOnError;
    readonly onClose: BufferedEvent<void>;
    private readonly emitOnClose;
    readonly connectionStatus: Signal<ConnectionStatus>;
    readonly setConnectionStatus: (status: ConnectionStatus) => void;
    private nextAckId;
    private readonly waitingForAck;
    private constructor();
    private rejectAllWaitingForAck;
    private receivedACK;
    private receivedMessage;
    private errored;
    private closed;
    static create<TIncomingPacket, TOutgoingPacket>(innerSend: (packet: TOutgoingPacket, ackId?: number) => void): {
        channel: Channel<TIncomingPacket, TOutgoingPacket>;
        receivedAck: (ackId: number) => void;
        receivedMessage: (packet: TIncomingPacket) => void;
        errored: (error: any) => void;
        closed: () => void;
    };
    send(packet: TOutgoingPacket): void;
    sendAndWaitForACK(packet: TOutgoingPacket): Promise<void>;
}

class BufferedEvent<TData> extends Subscribable<TData> {
    private subscriber;
    private queued;
    private isNotifying;
    static create<TData>(): readonly [
        BufferedEvent<TData>,
        (data: TData) => void
    ];
    private constructor();
    private emit;
    private notifier;
    subscribe(listener: Listener<TData>): () => void;
    flow(): Event_2<TData>;
}

type Listener<TData> = (data: TData) => void;

class Event_2<TData> extends Subscribable<TData> {
    private subscribers;
    private onSubscribed;
    private onUnsubscribed;
    protected constructor();
    protected emit(data: TData): void;
    static create<TData>(): readonly [
        Event_2<TData>,
        (data: TData) => void
    ];
    subscribe(listener: Listener_2<TData>): () => void;
    batch({ minIdleTimeMs, maxBatchTimeMs, }: EventBatchingOpts): Event_2<Array<TData>>;
}

type Listener_2<TData> = (data: TData) => void;

interface EventBatchingOpts {
    minIdleTimeMs?: number;
    maxBatchTimeMs?: number;
}

abstract class Subscribable<TData> {
    abstract subscribe(listener: (data: TData) => void): () => void;
    subscribeWithCleaner(cleaner: Cleaner, listener: (data: TData) => void): void;
    subscribeOnce(listener: (data: TData) => void): () => void;
    subscribeOnceWithCleaner(cleaner: Cleaner, listener: (data: TData) => void): void;
    derive<TOutput>(deriver: (data: StripNotAvailable<TData>) => StripNotAvailable<TOutput>, outputEqualsPredicate?: (a: TOutput, b: TOutput) => boolean): typeof Subscribable extends {
        get(): TData;
    } ? TOutput extends NotAvailable ? LazySignal<TOutput | NotAvailable> : LazySignal<TOutput> : LazySignal<TOutput | NotAvailable>;
}

class Cleaner {
    private eagerCleaned;
    private readonly disposed;
    private readonly cleanups;
    register(fn: () => void): void;
    private runCleanersInternal;
    [Symbol.dispose](): void;
    eagerClean(): void;
}

type StripNotAvailable<T> = T extends NotAvailable ? never : T;

type NotAvailable = typeof LazySignal.NOT_AVAILABLE;

class LazySignal<TData> extends Subscribable<TData> implements SignalLike<TData> {
    private readonly subscribeUpstream;
    static readonly NOT_AVAILABLE: unique symbol;
    private readonly signal;
    private readonly setValue;
    private dataIsStale;
    private upstreamUnsubscribe;
    private subscribersCount;
    private isSubscribedToUpstream;
    private readonly updateReceivedEvent;
    private readonly emitUpdateReceivedEvent;
    private readonly updateReceivedSynchronousCallbacks;
    static create<TData>(initialValue: TData, subscribeUpstream: SubscribeUpstream<TData>, equalsPredicate?: (a: TData, b: TData) => boolean): LazySignal<TData>;
    static createWithoutInitialValue<TData>(subscribeUpstream: SubscribeUpstream<TData>, equalsPredicate?: (a: TData, b: TData) => boolean): LazySignal<TData | NotAvailable>;
    static deriveFrom<TSource extends Array<unknown>, TData>(sourceSignals: {
        [TKey in keyof TSource]: SignalLike<TSource[TKey]>;
    }, deriver: (...sourceValues: {
        [TKey in keyof TSource]: StripNotAvailable<TSource[TKey]>;
    }) => TData, outputEqualsPredicate?: (a: TData, b: TData) => boolean): LazySignal<TSource extends Array<infer RElement> ? RElement extends NotAvailable ? TData | NotAvailable : TData : never>;
    static asyncDeriveFrom<TSource extends Array<unknown>, TData>(strategy: AsyncDeriveFromStrategy, sourceSignals: {
        [TKey in keyof TSource]: SignalLike<TSource[TKey]>;
    }, deriver: (...sourceValues: {
        [TKey in keyof TSource]: StripNotAvailable<TSource[TKey]>;
    }) => Promise<TData>, outputEqualsPredicate?: (a: TData, b: TData) => boolean): LazySignal<TData | NotAvailable>;
    protected constructor(initialValue: TData, subscribeUpstream: SubscribeUpstream<TData>, equalsPredicate?: (a: TData, b: TData) => boolean);
    isStale(): boolean;
    private subscribeToUpstream;
    private unsubscribeFromUpstream;
    get(): TData;
    pull(): Promise<StripNotAvailable<TData>>;
    runOnNextFreshData(callback: (value: StripNotAvailable<TData>) => void): void;
    ensureAvailable(): Promise<LazySignal<StripNotAvailable<TData>>>;
    subscribe(subscriber: Subscriber<TData>): () => void;
    subscribeFull(subscriber: SignalFullSubscriber<TData>): () => void;
    passiveSubscribe(subscriber: Subscriber<TData>): () => void;
    passiveSubscribeFull(subscriber: SignalFullSubscriber<TData>): () => void;
    until(predicate: (data: StripNotAvailable<TData>) => boolean): Promise<StripNotAvailable<TData>>;
}

type SubscribeUpstream<TData> = (setDownstream: Setter<TData>, errorListener: (error: any) => void) => () => void;

interface Setter<TData> {
    (value: StripNotAvailable<TData>, tags?: Array<WriteTag>): void;
    withProducer(producer: (draft: TData) => void, tags?: Array<WriteTag>): void;
    withUpdater(updater: (oldValue: TData) => StripNotAvailable<TData>, tags?: Array<WriteTag>): void;
    withPatchUpdater(updater: (oldValue: TData) => readonly [
        newValue: StripNotAvailable<TData>,
        patches: Array<Patch>
    ], tags?: Array<WriteTag>): void;
    withPatches(patches: Array<Patch>, tags?: Array<WriteTag>): void;
    withValueAndPatches(newValue: StripNotAvailable<TData>, patches: Array<Patch>, tags?: Array<WriteTag>): void;
}

type WriteTag = string;

interface SignalLike<TValue> extends Subscribable<TValue> {
    get(): TValue;
    subscribe(subscriber: Subscriber<TValue>): () => void;
    subscribeFull(subscriber: SignalFullSubscriber<TValue>): () => void;
    pull(): Promise<StripNotAvailable<TValue>> | StripNotAvailable<TValue>;
}

type Subscriber<TValue> = (value: TValue) => void;

type SignalFullSubscriber<TValue> = (value: TValue, patches: Array<Patch>, tags: Array<WriteTag>) => void;

type AsyncDeriveFromStrategy = "eager";

class Signal<TValue> extends Subscribable<TValue> implements SignalLike<TValue> {
    private value;
    private equalsPredicate;
    static create<TValue>(value: TValue, equalsPredicate?: (a: TValue, b: TValue) => boolean): readonly [
        Signal<TValue>,
        Setter<TValue>
    ];
    static createReadonly<TValue>(value: TValue): Signal<TValue>;
    protected constructor(value: TValue, equalsPredicate: (a: TValue, b: TValue) => boolean);
    private subscribers;
    get(): TValue;
    pull(): StripNotAvailable<TValue>;
    private queuedUpdaters;
    private isEmitting;
    private notifyFull;
    private notifyAll;
    private notifyAndUpdateIfChanged;
    private isReplaceRoot;
    private update;
    subscribe(callback: Subscriber<TValue>): () => void;
    subscribeAndNow(callback: Subscriber<TValue>): () => void;
    subscribeFull(callback: SignalFullSubscriber<TValue>): () => void;
    until(predicate: (data: TValue) => boolean): Promise<TValue>;
}

enum ConnectionStatus {
    Connected = "CONNECTED",
    Errored = "ERRORED",
    Closed = "CLOSED"
}

type SignalEndpointHandler<TContext = any, TCreationParameter = any, TData = any> = (ctx: TContext, creationParameter: TCreationParameter) => SignalLike<TData> | Promise<SignalLike<TData>> | SignalLike<TData | NotAvailable> | Promise<SignalLike<TData | NotAvailable>>;

type WritableSignalEndpointHandler<TContext = any, TCreationParameter = any, TData = any> = (ctx: TContext, creationParameter: TCreationParameter) => readonly [
    signal: SignalLike<TData>,
    setter: Setter<TData>
] | Promise<readonly [
    signal: SignalLike<TData>,
    setter: Setter<TData>
]> | readonly [
    signal: SignalLike<TData | NotAvailable>,
    setter: Setter<TData>
] | Promise<readonly [
    signal: SignalLike<TData | NotAvailable>,
    setter: Setter<TData>
]>;

interface RpcEndpoint {
    name: string;
    parameter: z.ZodType;
    returns: z.ZodType;
    serialization: SerializationType;
    handler: RpcEndpointHandler | null;
}

interface ChannelEndpoint {
    name: string;
    creationParameter: z.ZodType;
    toServerPacket: z.ZodType;
    toClientPacket: z.ZodType;
    serialization: SerializationType;
    handler: ChannelEndpointHandler | null;
}

interface SignalEndpoint {
    name: string;
    creationParameter: z.ZodType;
    signalData: z.ZodType;
    serialization: SerializationType;
    handler: SignalEndpointHandler | null;
}

interface WritableSignalEndpoint {
    name: string;
    creationParameter: z.ZodType;
    signalData: z.ZodType;
    serialization: SerializationType;
    handler: WritableSignalEndpointHandler | null;
}

class ClientPort<TRpcEndpoints extends RpcEndpointsSpecBase, TChannelEndpoints extends ChannelEndpointsSpecBase, TSignalEndpoints extends SignalEndpointsSpecBase, TWritableSignalEndpoints extends WritableSignalEndpointsSpecBase> {
    readonly backendInterface: BackendInterface<unknown, TRpcEndpoints, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints>;
    private readonly transport;
    private readonly logger;
    private openChannels;
    private ongoingRpcs;
    private openSignalSubscriptions;
    private openWritableSignalSubscriptions;
    private openCommunicationsCount;
    private nextChannelId;
    private nextSubscribeId;
    private nextWritableSubscribeId;
    private producedCommunicationWarningsCount;
    private errorDeserializer;
    private verboseErrorMessage;
    constructor(backendInterface: BackendInterface<unknown, TRpcEndpoints, TChannelEndpoints, TSignalEndpoints, TWritableSignalEndpoints>, factory: ClientTransportFactory, { parentLogger, errorDeserializer, verboseErrorMessage, }?: {
        parentLogger?: LoggerInterface;
        errorDeserializer?: (serialized: SerializedLMSExtendedError, directCause: string, stack?: string) => Error;
        verboseErrorMessage?: boolean;
    });
    private communicationWarning;
    private updateOpenCommunicationsCount;
    private receivedChannelSend;
    private receivedChannelAck;
    private receivedChannelClose;
    private receivedChannelError;
    private receivedRpcResult;
    private receivedRpcError;
    private receivedSignalUpdate;
    private receivedSignalError;
    private receivedWritableSignalUpdate;
    private receivedWritableSignalError;
    private receivedCommunicationWarning;
    private receivedKeepAliveAck;
    private receivedMessage;
    private errored;
    callRpc<TEndpointName extends keyof TRpcEndpoints & string>(endpointName: TEndpointName, param: TRpcEndpoints[TEndpointName]["parameter"], { stack }?: {
        stack?: string;
    }): Promise<TRpcEndpoints[TEndpointName]["returns"]>;
    createChannel<TEndpointName extends keyof TChannelEndpoints & string>(endpointName: TEndpointName, param: TChannelEndpoints[TEndpointName]["creationParameter"], onMessage?: (message: TChannelEndpoints[TEndpointName]["toClientPacket"]) => void, { stack }?: {
        stack?: string;
    }): Channel<TChannelEndpoints[TEndpointName]["toClientPacket"], TChannelEndpoints[TEndpointName]["toServerPacket"]>;
    createSignal<TEndpointName extends keyof TSignalEndpoints & string>(endpointName: TEndpointName, param: TSignalEndpoints[TEndpointName]["creationParameter"], { stack }?: {
        stack?: string;
    }): LazySignal<TSignalEndpoints[TEndpointName]["signalData"] | NotAvailable>;
    createWritableSignal<TEndpointName extends keyof TWritableSignalEndpoints & string>(endpointName: TEndpointName, param: TWritableSignalEndpoints[TEndpointName]["creationParameter"], { stack }?: {
        stack?: string;
    }): [
        signal: OWLSignal<TWritableSignalEndpoints[TEndpointName]["signalData"] | NotAvailable>,
        setter: Setter<TWritableSignalEndpoints[TEndpointName]["signalData"]>
    ];
    [Symbol.asyncDispose](): Promise<void>;
}

type ClientTransportFactory = (receivedMessage: (message: ServerToClientMessage) => void, errored: (error: any) => void, parentLogger: LoggerInterface) => ClientTransport;

type ServerToClientMessage = z.infer<typeof serverToClientMessageSchema>;

interface LoggerInterface {
    info(...messages: Array<unknown>): void;
    error(...messages: Array<unknown>): void;
    warn(...messages: Array<unknown>): void;
    debug(...messages: Array<unknown>): void;
}

abstract class ClientTransport extends Transport<ServerToClientMessage, ClientToServerMessage> {
    protected parseIncomingMessage(message: any): ServerToClientMessage;
    send(message: ClientToServerMessage): void;
    onHavingOneOrMoreOpenCommunication(): void;
    onHavingNoOpenCommunication(): void;
}

type ClientToServerMessage = z.infer<typeof clientToServerMessageSchema>;

abstract class Transport<TIncoming, TOutgoing> {
    protected abstract parseIncomingMessage(message: any): TIncoming;
    protected abstract sendViaTransport(message: TOutgoing): void;
    abstract send(message: TOutgoing): void;
    protected disposed: boolean;
    [Symbol.asyncDispose](): Promise<void>;
}

type SerializedLMSExtendedError = z.infer<typeof serializedLMSExtendedErrorSchema>;

class OWLSignal<TData> extends Subscribable<TData> implements SignalLike<TData> {
    private readonly writeUpstream;
    static readonly NOT_AVAILABLE: NotAvailable;
    private readonly innerSignal;
    private readonly outerSignal;
    private readonly setOuterSignal;
    private isWriteLoopRunning;
    private isSubscriptionHandledByWriteLoop;
    private queuedUpdates;
    private writeErrorEvent;
    private emitWriteErrorEvent;
    private applyOptimisticUpdates;
    private updateOptimisticValue;
    private constructor();
    static create<TData>(initialValue: TData, subscribeUpstream: SubscribeUpstream<TData>, writeUpstream: (data: StripNotAvailable<TData>, patches: Array<Patch>, tags: Array<WriteTag>) => boolean, equalsPredicate?: (a: TData, b: TData) => boolean): readonly [
        OWLSignal<TData>,
        Setter<StripNotAvailable<TData>>,
        (tags: Array<WriteTag>, error: any) => void
    ];
    static createWithoutInitialValue<TData>(subscribeUpstream: SubscribeUpstream<TData | NotAvailable>, writeUpstream: (data: StripNotAvailable<TData>, patches: Array<Patch>, tags: Array<WriteTag>) => boolean, equalsPredicate?: (a: TData, b: TData) => boolean): readonly [
        OWLSignal<typeof LazySignal.NOT_AVAILABLE | TData>,
        Setter<StripNotAvailable<TData>>,
        (tags: Array<WriteTag>, error: any) => void
    ];
    private update;
    private ensureWriteLoop;
    private writeLoop;
    isStale(): boolean;
    get(): TData;
    getPessimistic(): TData;
    pull({ optimistic }?: {
        optimistic?: boolean;
    }): Promise<StripNotAvailable<TData>>;
    private currentEnsureAvailablePromise;
    ensureAvailable(): Promise<OWLSignal<StripNotAvailable<TData>>>;
    subscribe(subscriber: Subscriber<TData>): () => void;
    subscribeFull(subscriber: SignalFullSubscriber<TData>): () => void;
}

class Validator {
    private readonly attachStack;
    constructor({ attachStack }?: ValidatorConstructorOpts);
    static prettyPrintZod(rootObjectName: string, error: ZodError): string;
    validateOrThrow<T>(lead: string, rootObjectName: string, schema: z.Schema<T>, value: unknown, stack?: string): T;
    validateMultipleOrThrow<T extends Array<unknown>>(leadProducer: (erroredValues: Set<number>) => string, rootObjectNames: Array<string>, schemas: Array<z.Schema<unknown>>, values: T, stack?: string): T;
    validateMethodParamOrThrow<T>(className: string, methodName: string, paramName: string, schema: z.Schema<T>, value: unknown, stack?: string): T;
    validateMethodParamsOrThrow<T extends Array<unknown>>(className: string, methodName: string, paramNames: Array<string>, schemas: Array<z.Schema<unknown>>, values: T, stack?: string): T;
    validateConstructorParamOrThrow<T>(className: string, paramName: string, schema: z.Schema<T>, value: unknown, stack?: string): T;
    validateConstructorParamsOrThrow<T extends Array<unknown>>(className: string, paramNames: Array<string>, schemas: Array<z.Schema<unknown>>, values: T, stack?: string): T;
}

interface ValidatorConstructorOpts {
    attachStack?: boolean;
}

type PromptPreprocessor = (ctl: PromptPreprocessorController, userMessage: ChatMessage) => Promise<string | ChatMessage>;

type PromptPreprocessorController = Omit<ProcessingController, "createContentBlock" | "setSenderName">;

class ProcessingController extends BaseController {
    private sendUpdate;
    pullHistory(): Promise<Chat>;
    createStatus(initialState: StatusStepState): PredictionProcessStatusController;
    addCitations(retrievalResult: RetrievalResult): void;
    addCitations(entries: Array<RetrievalResultEntry>): void;
    createCitationBlock(citedText: string, source: CreateCitationBlockOpts): PredictionProcessCitationBlockController;
    createContentBlock({ roleOverride, includeInContext, style, prefix, suffix, }?: CreateContentBlockOpts): PredictionProcessContentBlockController;
    debug(...messages: Array<any>): void;
    getPredictionConfig(): LLMPredictionConfig;
    readonly model: Readonly<{
        getOrLoad: () => Promise<LLM>;
    }>;
    setSenderName(name: string): Promise<void>;
    guardAbort(): void;
    hasStatus(): Promise<boolean>;
    needsNaming(): Promise<boolean>;
    suggestName(name: string): Promise<void>;
    requestConfirmToolCall({ callId, pluginIdentifier, name, parameters, }: RequestConfirmToolCallOpts): Promise<RequestConfirmToolCallResult>;
    createToolStatus(callId: number, initialStatus: ToolStatusStepStateStatus): PredictionProcessToolStatusController;
}

interface StatusStepState {
    status: StatusStepStatus;
    text: string;
}

type StatusStepStatus = "waiting" | "loading" | "done" | "error" | "canceled";

class PredictionProcessStatusController {
    private readonly id;
    private readonly indentation;
    private lastSubStatus;
    private lastState;
    setText(text: string): void;
    setState(state: StatusStepState): void;
    remove(): void;
    private getNestedLastSubStatusBlockId;
    addSubStatus(initialState: StatusStepState): PredictionProcessStatusController;
}

interface CreateCitationBlockOpts {
    fileName: string;
    fileIdentifier: string;
    pageNumber?: number | [
        start: number,
        end: number
    ];
    lineNumber?: number | [
        start: number,
        end: number
    ];
}

class PredictionProcessCitationBlockController {
    private readonly id;
}

interface CreateContentBlockOpts {
    roleOverride?: "user" | "assistant" | "system" | "tool";
    includeInContext?: boolean;
    style?: ContentBlockStyle;
    prefix?: string;
    suffix?: string;
}

type ContentBlockStyle = {
    type: "default";
} | {
    type: "customLabel";
    label: string;
    color?: ColorPalette;
} | {
    type: "thinking";
    ended?: boolean;
    title?: string;
};

type ColorPalette = "red" | "green" | "blue" | "yellow" | "orange" | "purple" | "default";

class PredictionProcessContentBlockController {
    private readonly id;
    private readonly role;
    appendText(text: string, { tokensCount, fromDraftModel }?: ContentBlockAppendTextOpts): void;
    appendToolRequest({ callId, toolCallRequestId, name, parameters, pluginIdentifier, }: ContentBlockAppendToolRequestOpts): void;
    replaceToolRequest({ callId, toolCallRequestId, name, parameters, pluginIdentifier, }: ContentBlockReplaceToolRequestOpts): void;
    appendToolResult({ callId, toolCallRequestId, content, }: ContentBlockAppendToolResultOpts): void;
    replaceText(text: string): void;
    setStyle(style: ContentBlockStyle): void;
    setPrefix(prefix: string): void;
    setSuffix(suffix: string): void;
    attachGenInfo(genInfo: LLMGenInfo): void;
    pipeFrom(prediction: OngoingPrediction): Promise<PredictionResult>;
}

interface ContentBlockAppendTextOpts {
    tokensCount?: number;
    fromDraftModel?: boolean;
}

interface ContentBlockAppendToolRequestOpts {
    callId: number;
    toolCallRequestId?: string;
    name: string;
    parameters: Record<string, any>;
    pluginIdentifier?: string;
}

interface ContentBlockReplaceToolRequestOpts {
    callId: number;
    toolCallRequestId?: string;
    name: string;
    parameters: Record<string, any>;
    pluginIdentifier?: string;
}

interface ContentBlockAppendToolResultOpts {
    callId: number;
    toolCallRequestId?: string;
    content: string;
}

interface LLMGenInfo {
    indexedModelIdentifier: string;
    identifier: string;
    loadModelConfig: KVConfig;
    predictionConfig: KVConfig;
    stats: LLMPredictionStats;
}

type LLMPredictionConfig = Omit<LLMPredictionConfigInput<any>, "structured"> & {
    structured?: LLMStructuredPredictionSetting;
};

interface RequestConfirmToolCallOpts {
    callId: number;
    pluginIdentifier?: string;
    name: string;
    parameters: Record<string, any>;
}

type RequestConfirmToolCallResult = {
    type: "allow";
    toolArgsOverride?: Record<string, any>;
} | {
    type: "deny";
    denyReason?: string;
};

type ToolStatusStepStateStatus = {
    type: "generatingToolCall";
    name?: string;
    pluginIdentifier?: string;
    argumentsString?: string;
} | {
    type: "toolCallGenerationFailed";
    error: string;
    rawContent?: string;
} | {
    type: "toolCallQueued";
} | {
    type: "confirmingToolCall";
} | {
    type: "toolCallDenied";
    denyReason?: string;
} | {
    type: "callingTool";
} | {
    type: "toolCallFailed";
    error: string;
} | {
    type: "toolCallSucceeded";
    timeMs: number;
};

class PredictionProcessToolStatusController {
    private readonly id;
    private status;
    private customStatus;
    private customWarnings;
    private updateState;
    setCustomStatusText(status: string): void;
    addWarning(warning: string): void;
    setStatus(status: ToolStatusStepStateStatus): void;
    appendArgumentFragment(content: string): void;
}

abstract class BaseController {
    readonly client: LMStudioClient;
    readonly abortSignal: AbortSignal;
    private readonly pluginConfig;
    private readonly globalPluginConfig;
    private readonly workingDirectoryPath;
    constructor(client: LMStudioClient, abortSignal: AbortSignal, pluginConfig: KVConfig, globalPluginConfig: KVConfig, workingDirectoryPath: string | null);
    getWorkingDirectory(): string;
    getPluginConfig<TVirtualConfigSchematics extends VirtualConfigSchematics>(configSchematics: ConfigSchematics<TVirtualConfigSchematics>): ParsedConfig<TVirtualConfigSchematics>;
    getGlobalPluginConfig<TVirtualConfigSchematics extends VirtualConfigSchematics>(globalConfigSchematics: ConfigSchematics<TVirtualConfigSchematics>): ParsedConfig<TVirtualConfigSchematics>;
    onAborted(callback: () => void): void;
}

type VirtualConfigSchematics = {
    [key: string]: {
        key: string;
        type: any;
        valueTypeKey: string;
    };
};

interface ConfigSchematics<TVirtualConfigSchematics extends VirtualConfigSchematics> {
    [configSchematicsBrand]?: TVirtualConfigSchematics;
}

interface ParsedConfig<TVirtualConfigSchematics extends VirtualConfigSchematics> {
    [configSchematicsBrand]?: TVirtualConfigSchematics;
    get<TKey extends keyof TVirtualConfigSchematics & string>(key: TKey): TVirtualConfigSchematics[TKey]["type"];
}

type PredictionLoopHandler = (ctl: PredictionLoopHandlerController) => Promise<void>;

type PredictionLoopHandlerController = Omit<ProcessingController, never>;

type ToolsProvider = (ctl: ToolsProviderController) => Promise<Array<Tool>>;

class ToolsProviderController extends BaseController {
}

type Generator_2 = (ctl: GeneratorController, history: Chat) => Promise<void>;

class GeneratorController extends BaseController {
    private readonly toolDefinitions;
    private readonly connector;
    private readonly validator;
    getToolDefinitions(): Array<LLMTool>;
    fragmentGenerated(content: string, opts?: LLMPredictionFragmentInputOpts): void;
    toolCallGenerationStarted(): void;
    toolCallGenerationNameReceived(toolName: string): void;
    toolCallGenerationArgumentFragmentGenerated(content: string): void;
    toolCallGenerationEnded(toolCallRequest: ToolCallRequest): void;
    toolCallGenerationFailed(error: Error): void;
}

interface LLMPredictionFragmentInputOpts {
    tokenCount?: number;
    containsDrafted?: boolean;
    reasoningType?: LLMPredictionFragmentReasoningType;
}

interface LMStudioClientConstructorOpts {
    logger?: LoggerInterface;
    baseUrl?: string;
    verboseErrorMessages?: boolean;
    clientIdentifier?: string;
    clientPasskey?: string;
}

abstract class MaybeMutable<Data> {
    protected readonly data: Data;
    protected readonly mutable: boolean;
    protected constructor(data: Data, mutable: boolean);
    protected abstract getClassName(): string;
    protected abstract create(data: Data, mutable: boolean): this;
    protected abstract cloneData(data: Data): Data;
    asMutableCopy(): this;
    asImmutableCopy(): this;
    protected guardMutable(): void;
}

namespace global {
interface AbortSignal {
}
}