memo

汎用的なchatの型定義を考えたいのだけど、
open aiはResponseInputItem[]がchatの型定義で

```
type ResponseInputItem = EasyInputMessage | ResponseInputItem.Message | ResponseOutputMessage | ResponseFileSearchToolCall | ResponseComputerToolCall | ResponseInputItem.ComputerCallOutput | ResponseFunctionWebSearch | ResponseFunctionToolCall | ResponseInputItem.FunctionCallOutput | ResponseReasoningItem | ResponseInputItem.ImageGenerationCall | ResponseCodeInterpreterToolCall | ResponseInputItem.LocalShellCall | ResponseInputItem.LocalShellCallOutput | ResponseInputItem.McpListTools | ResponseInputItem.McpApprovalRequest | ResponseInputItem.McpApprovalResponse | ResponseInputItem.McpCall | ResponseInputItem.ItemReference;

interface EasyInputMessage {
    content: string | ResponseInputMessageContentList;
    role: 'user' | 'assistant' | 'system' | 'developer';
    type?: 'message';
}

type ResponseInputMessageContentList = Array<ResponseInputContent>;

type ResponseInputContent = ResponseInputText | ResponseInputImage | ResponseInputFile;

interface ResponseInputText {
    text: string;
    type: 'input_text';
}

interface ResponseInputImage {
    detail: 'low' | 'high' | 'auto';
    type: 'input_image';
    file_id?: string | null;
    image_url?: string | null;
}

interface ResponseInputFile {
    type: 'input_file';
    file_data?: string;
    file_id?: string | null;
    filename?: string;
}

interface ResponseOutputMessage {
    id: string;
    content: Array<ResponseOutputText | ResponseOutputRefusal>;
    role: 'assistant';
    status: 'in_progress' | 'completed' | 'incomplete';
    type: 'message';
}

interface ResponseOutputText {
    annotations: Array<ResponseOutputText.FileCitation | ResponseOutputText.URLCitation | ResponseOutputText.FilePath>;
    text: string;
    type: 'output_text';
    logprobs?: Array<ResponseOutputText.Logprob>;
}
...
```

LMStudioはChatLikeがchatの型定義になっている。

```
type ChatLike = ChatInput | string | Chat | ChatMessageInput | ChatHistoryData;

type ChatInput = Array<ChatMessageInput>;

interface ChatMessageInput {
    role?: "user" | "assistant" | "system";
    content?: string;
    images?: Array<FileHandle>;
}

...

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

...

```

両方に対応した型にして、変換できるようにするのが最終目標なんだけど、たぶんめちゃくちゃ難しいから、外部ライブラリか、一番基礎的な型のみにするのがいいと思う。
つまりEasyInputMessage[]とChatHistoryData に対応した型のListを、chat用とりあえずの汎用型にしたい。どういう定義がいいかな
