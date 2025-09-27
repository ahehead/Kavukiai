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

interface ResponseOutputRefusal {
    refusal: string;
    type: 'refusal';
}

interface ResponseFileSearchToolCall {
    id: string;
    queries: Array<string>;
    status: 'in_progress' | 'searching' | 'completed' | 'incomplete' | 'failed';
    type: 'file_search_call';
    results?: Array<ResponseFileSearchToolCall.Result> | null;
}

interface ResponseComputerToolCall {
    id: string;
    action: ResponseComputerToolCall.Click | ResponseComputerToolCall.DoubleClick | ResponseComputerToolCall.Drag | ResponseComputerToolCall.Keypress | ResponseComputerToolCall.Move | ResponseComputerToolCall.Screenshot | ResponseComputerToolCall.Scroll | ResponseComputerToolCall.Type | ResponseComputerToolCall.Wait;
    call_id: string;
    pending_safety_checks: Array<ResponseComputerToolCall.PendingSafetyCheck>;
    status: 'in_progress' | 'completed' | 'incomplete';
    type: 'computer_call';
}

interface ResponseFunctionWebSearch {
    id: string;
    status: 'in_progress' | 'searching' | 'completed' | 'failed';
    type: 'web_search_call';
}

interface ResponseFunctionToolCall {
    arguments: string;
    call_id: string;
    name: string;
    type: 'function_call';
    id?: string;
    status?: 'in_progress' | 'completed' | 'incomplete';
}

interface ResponseReasoningItem {
    id: string;
    summary: Array<ResponseReasoningItem.Summary>;
    type: 'reasoning';
    encrypted_content?: string | null;
    status?: 'in_progress' | 'completed' | 'incomplete';
}

interface ResponseCodeInterpreterToolCall {
    id: string;
    code: string;
    results: Array<ResponseCodeInterpreterToolCall.Logs | ResponseCodeInterpreterToolCall.Files>;
    status: 'in_progress' | 'interpreting' | 'completed';
    type: 'code_interpreter_call';
    container_id?: string;
}