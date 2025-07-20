import { type Static, Type } from "@sinclair/typebox";
import * as Base from "./BaseSchemas";

// Text input
export const ResponseInputText = Type.Object(
  {
    text: Type.String({ description: "The text input to the model" }),
    type: Type.Literal("input_text"),
  },
  { description: "A text input to the model" }
);
export type ResponseInputText = Static<typeof ResponseInputText>;

// Image input
export const ResponseInputImage = Type.Object(
  {
    detail: Type.Union([
      Type.Literal("low"),
      Type.Literal("high"),
      Type.Literal("auto"),
    ]),
    type: Type.Literal("input_image"),
    file_id: Type.Optional(Type.String()),
    image_url: Type.Optional(Type.String()),
  },
  { description: "An image input to the model" }
);
export type ResponseInputImage = Static<typeof ResponseInputImage>;

// File input
export const ResponseInputFile = Type.Object(
  {
    type: Type.Literal("input_file"),
    file_data: Type.Optional(Type.String()),
    file_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    filename: Type.Optional(Type.String()),
  },
  { description: "A file input to the model" }
);
export type ResponseInputFile = Static<typeof ResponseInputFile>;

// Audio input
export const ResponseInputAudio = Type.Object(
  {
    data: Type.String({ description: "Base64-encoded audio data" }),
    format: Type.Union([Type.Literal("mp3"), Type.Literal("wav")]),
    type: Type.Literal("input_audio"),
  },
  { description: "An audio input to the model" }
);
export type ResponseInputAudio = Static<typeof ResponseInputAudio>;

// Input content union
export const ResponseInputContent = Type.Union(
  [ResponseInputText, ResponseInputImage, ResponseInputFile],
  { description: "Text, image, or file input content" }
);
export type ResponseInputContent = Static<typeof ResponseInputContent>;

// Message content list
export const ResponseInputMessageContentList = Type.Array(
  ResponseInputContent,
  { description: "List of content items in a message input" }
);
export type ResponseInputMessageContentList = Static<
  typeof ResponseInputMessageContentList
>;

export const Role = Type.Union([
  Type.Literal("user"),
  Type.Literal("assistant"),
  Type.Literal("system"),
  Type.Literal("developer"),
]);
export type Role = Static<typeof Role>;

// Message item
export const ResponseInputMessageItem = Type.Object(
  {
    id: Type.Optional(Base.ID),
    content: ResponseInputMessageContentList,
    role: Role,
    status: Type.Optional(
      Type.Union([
        Type.Literal("in_progress"),
        Type.Literal("completed"),
        Type.Literal("incomplete"),
      ])
    ),
    type: Type.Literal("message"),
  },
  { description: "A message input to the model" }
);
export type ResponseInputMessageItem = Static<typeof ResponseInputMessageItem>;

// EasyInputMessage
export const EasyInputMessage = Type.Object(
  {
    content: Type.Union([Type.String(), ResponseInputMessageContentList], {
      description:
        "Text, image, or audio input to the model, used to generate a response.",
    }),
    role: Role,
    type: Type.Optional(Type.Literal("message")),
  },
  {
    description:
      "A message input to the model with a role indicating instruction following hierarchy.",
  }
);
export type EasyInputMessage = Static<typeof EasyInputMessage>;

// FileSearchTool
export const FileSearchTool = Type.Object(
  {
    type: Type.Literal("file_search"),
    vector_store_ids: Type.Array(Type.String()),
    filters: Type.Optional(Type.Union([Type.Unknown(), Type.Null()])),
    max_num_results: Type.Optional(Type.Number()),
    ranking_options: Type.Optional(
      Type.Object(
        {
          ranker: Type.Optional(
            Type.Union([
              Type.Literal("auto"),
              Type.Literal("default-2024-11-15"),
            ])
          ),
          score_threshold: Type.Optional(Type.Number()),
        },
        { description: "Ranking options for search." }
      )
    ),
  },
  {
    description:
      "A tool that searches for relevant content from uploaded files.",
  }
);
export type FileSearchTool = Static<typeof FileSearchTool>;

// FunctionTool
export const FunctionTool = Type.Object(
  {
    name: Type.String(),
    parameters: Type.Union([
      Type.Record(Type.String(), Type.Unknown()),
      Type.Null(),
    ]),
    strict: Type.Union([Type.Boolean(), Type.Null()]),
    type: Type.Literal("function"),
    description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  },
  {
    description:
      "Defines a function in your own code the model can choose to call.",
  }
);
export type FunctionTool = Static<typeof FunctionTool>;

// --- Appended Schemas ---

const IncompleteStatus = Type.Union([
  Type.Literal("in_progress"),
  Type.Literal("completed"),
  Type.Literal("incomplete"),
]);

const StringOrNull = Type.Union([Type.String(), Type.Null()]);

export const ResponseOutputRefusal = Type.Object({
  refusal: Type.String(),
  type: Type.Literal("refusal"),
});
export type ResponseOutputRefusal = Static<typeof ResponseOutputRefusal>;

export const ResponseOutputText = Type.Object({
  text: Type.String(),
  type: Type.Literal("text"),
});
export type ResponseOutputText = Static<typeof ResponseOutputText>;

export const ResponseOutputMessage = Type.Object({
  id: Type.String(),
  content: Type.Array(Type.Union([ResponseOutputText, ResponseOutputRefusal])),
  role: Type.Literal("assistant"),
  status: IncompleteStatus,
  type: Type.Literal("message"),
});
export type ResponseOutputMessage = Static<typeof ResponseOutputMessage>;

export const ResponseFileSearchToolCall = Type.Object({
  id: Type.String(),
  query: Type.String(),
  status: IncompleteStatus,
  type: Type.Literal("file_search_call"),
  results: Type.Optional(Type.Array(Type.Unknown())),
});
export type ResponseFileSearchToolCall = Static<
  typeof ResponseFileSearchToolCall
>;

export const ResponseComputerToolCallOutputScreenshot = Type.Object({
  type: Type.Literal("image"),
  image: Type.String(),
  image_url: Type.Optional(Type.String()),
});
export type ResponseComputerToolCallOutputScreenshot = Static<
  typeof ResponseComputerToolCallOutputScreenshot
>;

export const ResponseComputerToolCall = Type.Object({
  id: Type.String(),
  call_id: Type.String(),
  output: ResponseComputerToolCallOutputScreenshot,
  type: Type.Literal("computer_call_output"),
  acknowledged_safety_checks: Type.Optional(Type.Array(Type.Unknown())),
  status: Type.Optional(IncompleteStatus),
});
export type ResponseComputerToolCall = Static<typeof ResponseComputerToolCall>;

export const ComputerCallOutput = Type.Object({
  call_id: Type.String(),
  output: ResponseComputerToolCallOutputScreenshot,
  type: Type.Literal("computer_call_output"),
  id: Type.Optional(StringOrNull),
  acknowledged_safety_checks: Type.Optional(Type.Array(Type.Unknown())),
  status: Type.Optional(IncompleteStatus),
});
export type ComputerCallOutput = Static<typeof ComputerCallOutput>;

export const ResponseFunctionWebSearch = Type.Object({
  id: Type.String(),
  query: Type.String(),
  type: Type.Literal("function_web_search"),
  results: Type.Optional(Type.Array(Type.Unknown())),
});
export type ResponseFunctionWebSearch = Static<
  typeof ResponseFunctionWebSearch
>;

export const ResponseFunctionToolCall = Type.Object({
  id: Type.String(),
  arguments: Type.String(),
  name: Type.String(),
  type: Type.Literal("function_tool_call"),
  output: Type.Optional(StringOrNull),
});
export type ResponseFunctionToolCall = Static<typeof ResponseFunctionToolCall>;

export const FunctionCallOutput = Type.Object({
  call_id: Type.String(),
  output: Type.String(),
  type: Type.Literal("function_call_output"),
  id: Type.Optional(StringOrNull),
  status: Type.Optional(IncompleteStatus),
});
export type FunctionCallOutput = Static<typeof FunctionCallOutput>;

export const ResponseReasoningItemSummary = Type.Object({
  text: Type.String(),
  type: Type.Literal("summary_text"),
});
export type ResponseReasoningItemSummary = Static<
  typeof ResponseReasoningItemSummary
>;

export const ResponseReasoningItem = Type.Object({
  id: Type.String(),
  summary: Type.Array(ResponseReasoningItemSummary),
  type: Type.Literal("reasoning"),
  encrypted_content: Type.Optional(StringOrNull),
  status: Type.Optional(IncompleteStatus),
});
export type ResponseReasoningItem = Static<typeof ResponseReasoningItem>;

export const ImageGenerationCall = Type.Object({
  id: Type.String(),
  result: StringOrNull,
  status: Type.Union([
    Type.Literal("in_progress"),
    Type.Literal("completed"),
    Type.Literal("generating"),
    Type.Literal("failed"),
  ]),
  type: Type.Literal("image_generation_call"),
});
export type ImageGenerationCall = Static<typeof ImageGenerationCall>;

export const ResponseCodeInterpreterToolCall = Type.Object({
  id: Type.String(),
  code: Type.String(),
  type: Type.Literal("code_interpreter_call"),
  outputs: Type.Optional(Type.Array(Type.Unknown())),
});
export type ResponseCodeInterpreterToolCall = Static<
  typeof ResponseCodeInterpreterToolCall
>;

export const LocalShellCallAction = Type.Object({
  command: Type.Array(Type.String()),
  env: Type.Record(Type.String(), Type.String()),
  type: Type.Literal("exec"),
  timeout_ms: Type.Optional(Type.Number()),
  user: Type.Optional(StringOrNull),
  working_directory: Type.Optional(StringOrNull),
});
export type LocalShellCallAction = Static<typeof LocalShellCallAction>;

export const LocalShellCall = Type.Object({
  id: Type.String(),
  action: LocalShellCallAction,
  call_id: Type.String(),
  status: IncompleteStatus,
  type: Type.Literal("local_shell_call"),
});
export type LocalShellCall = Static<typeof LocalShellCall>;

export const LocalShellCallOutput = Type.Object({
  id: Type.String(),
  output: Type.String(),
  type: Type.Literal("local_shell_call_output"),
  status: Type.Optional(IncompleteStatus),
});
export type LocalShellCallOutput = Static<typeof LocalShellCallOutput>;

export const McpListToolsTool = Type.Object({
  input_schema: Type.Unknown(),
  name: Type.String(),
  annotations: Type.Optional(Type.Unknown()),
  description: Type.Optional(StringOrNull),
});
export type McpListToolsTool = Static<typeof McpListToolsTool>;

export const McpListTools = Type.Object({
  id: Type.String(),
  server_label: Type.String(),
  tools: Type.Array(McpListToolsTool),
  type: Type.Literal("mcp_list_tools"),
  error: Type.Optional(StringOrNull),
});
export type McpListTools = Static<typeof McpListTools>;

export const McpApprovalRequest = Type.Object({
  id: Type.String(),
  arguments: Type.String(),
  name: Type.String(),
  server_label: Type.String(),
  type: Type.Literal("mcp_approval_request"),
});
export type McpApprovalRequest = Static<typeof McpApprovalRequest>;

export const McpApprovalResponse = Type.Object({
  approval_request_id: Type.String(),
  approve: Type.Boolean(),
  type: Type.Literal("mcp_approval_response"),
  id: Type.Optional(StringOrNull),
  reason: Type.Optional(StringOrNull),
});
export type McpApprovalResponse = Static<typeof McpApprovalResponse>;

export const McpCall = Type.Object({
  id: Type.String(),
  arguments: Type.String(),
  name: Type.String(),
  server_label: Type.String(),
  type: Type.Literal("mcp_call"),
  error: Type.Optional(StringOrNull),
  output: Type.Optional(StringOrNull),
});
export type McpCall = Static<typeof McpCall>;

export const ItemReference = Type.Object({
  id: Type.String(),
  type: Type.Optional(Type.Literal("item_reference")),
});
export type ItemReference = Static<typeof ItemReference>;

export const ResponseComputerToolCallOutputItem = Type.Object({
  id: Type.String(),
  call_id: Type.String(),
  output: ResponseComputerToolCallOutputScreenshot,
  type: Type.Literal("computer_call_output"),
  acknowledged_safety_checks: Type.Optional(Type.Array(Type.Unknown())),
  status: Type.Optional(IncompleteStatus),
});
export type ResponseComputerToolCallOutputItem = Static<
  typeof ResponseComputerToolCallOutputItem
>;

export const ResponseFunctionToolCallItem = Type.Object({
  id: Type.String(),
  arguments: Type.String(),
  name: Type.String(),
  type: Type.Literal("function_tool_call"),
  output: Type.Optional(StringOrNull),
});
export type ResponseFunctionToolCallItem = Static<
  typeof ResponseFunctionToolCallItem
>;

export const ResponseFunctionToolCallOutputItem = Type.Object({
  id: Type.String(),
  call_id: Type.String(),
  output: Type.String(),
  type: Type.Literal("function_call_output"),
  status: Type.Optional(IncompleteStatus),
});
export type ResponseFunctionToolCallOutputItem = Static<
  typeof ResponseFunctionToolCallOutputItem
>;

// --- Union Schemas ---

// Input item union
export const ResponseInputItem = Type.Union(
  [
    EasyInputMessage,
    ResponseInputMessageItem,
    ResponseOutputMessage,
    ResponseFileSearchToolCall,
    ResponseComputerToolCall,
    ComputerCallOutput,
    ResponseFunctionWebSearch,
    ResponseFunctionToolCall,
    FunctionCallOutput,
    ResponseReasoningItem,
    ImageGenerationCall,
    ResponseCodeInterpreterToolCall,
    LocalShellCall,
    LocalShellCallOutput,
    McpListTools,
    McpApprovalRequest,
    McpApprovalResponse,
    McpCall,
    ItemReference,
    // from original file
    FileSearchTool,
    FunctionTool,
    ResponseInputAudio,
    ResponseInputText,
    ResponseInputImage,
    ResponseInputFile,
  ],
  { description: "An input item to the model" }
);
export type ResponseInputItem = Static<typeof ResponseInputItem>;

// Overall input
export const ResponseInput = Type.Array(ResponseInputItem, {
  description: "Array of input items",
});
export type ResponseInput = Static<typeof ResponseInput>;

/**
 * Content item used to generate a response.
 */
export const ResponseItem = Type.Union([
  ResponseInputMessageItem,
  ResponseOutputMessage,
  ResponseFileSearchToolCall,
  ResponseComputerToolCall,
  ResponseComputerToolCallOutputItem,
  ResponseFunctionWebSearch,
  ResponseFunctionToolCallItem,
  ResponseFunctionToolCallOutputItem,
  ResponseReasoningItem,
  ImageGenerationCall,
  LocalShellCall,
  LocalShellCallOutput,
  McpListTools,
  McpApprovalRequest,
  McpApprovalResponse,
  McpCall,
]);
export type ResponseItem = Static<typeof ResponseItem>;
