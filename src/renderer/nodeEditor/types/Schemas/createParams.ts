import { type } from "arktype";

// OpenAI Response API schemas
const ReasoningEffort = type('"low" | "medium" | "high"').or("null");
const Reasoning = type({ "effort?": ReasoningEffort }).or("null");
const Background = type("boolean").or("null");
const IncludeItem = type(
  '"file_search_call.results" | "message.input_image.image_url" | "computer_call_output.output.image_url" | "reasoning.encrypted_content"'
);
const Include = type([IncludeItem]).or("null");
const Instructions = type("string").or("null");
const MaxOutputTokens = type("number").or("null");
const MetadataSchema = type("object").or("null");
const ParallelToolCalls = type("boolean").or("null");
const PreviousResponseId = type("string").or("null");
const ServiceTier = type('"auto" | "default" | "flex"').or("null");
const Store = type("boolean").or("null");
const Model = type("string");

// ResponseInput small units
const ResponseInputAudio = type({
  data: type("string"),
  format: type('"mp3" | "wav"'),
  type: type('"input_audio"'),
});
const ResponseInputFile = type({
  type: type('"input_file"'),
  "file_data?": type("string"),
  "file_id?": type("string").or("null"),
  "filename?": type("string"),
});
const ResponseInputImage = type({
  detail: type('"low" | "high" | "auto"'),
  type: type('"input_image"'),
  "file_id?": type("string").or("null"),
  "image_url?": type("string").or("null"),
});
const ResponseInputContent = type([
  ResponseInputAudio,
  ResponseInputFile,
  ResponseInputImage,
]);
const ResponseInputContentList = type([ResponseInputContent]);
const EasyInputMessage = type({
  content: type("string").or(ResponseInputContentList),
  role: type('"user" | "assistant" | "system" | "developer"'),
  "type?": type('"message"'),
});

// Tool schemas
const FileSearchTool = type({
  type: type('"file_search"'),
  vector_store_ids: type([type("string")]),
  "filters?": type("object").or("null"),
  "max_num_results?": type("number").or("null"),
  "ranking_options?": type({
    "ranker?": type('"auto" | "default-2024-11-15"'),
    "score_threshold?": type("number"),
  }).or("null"),
});
const ComputerTool = type({
  display_height: type("number"),
  display_width: type("number"),
  environment: type('"windows" | "mac" | "linux" | "ubuntu" | "browser"'),
  type: type('"computer_use_preview"'),
});
const FunctionTool = type({
  name: type("string"),
  parameters: type("object").or("null"),
  strict: type("boolean").or("null"),
  type: type('"function"'),
  description: type("string").or("null"),
});
const ToolItem = type([FileSearchTool, ComputerTool, FunctionTool]);
const ToolsList = type([ToolItem]).or("null");

// Additional parameters
const Temperature = type("number").or("null");
const TopP = type("number").or("null");
const Truncation = type('"auto" | "disabled"').or("null");
const User = type("string").or("null");

// Tool choices
const ToolChoiceOptions = type('"none" | "auto" | "required"');
const ToolChoiceTypesSchema = type({
  type: type(
    '"file_search" | "web_search_preview" | "computer_use_preview" | "web_search_preview_2025_03_11" | "image_generation" | "code_interpreter" | "mcp"'
  ),
});
const ToolChoiceFunctionSchema = type({
  name: type("string"),
  type: type('"function"'),
});
const ToolChoice = type([
  ToolChoiceOptions,
  ToolChoiceTypesSchema,
  ToolChoiceFunctionSchema,
]);

const ResponseTextConfig = type({ format: type("object") }).or("null");

// Response create params
const ResponseCreateParamsBase = type({
  input: type("string").or(
    type([
      EasyInputMessage,
      FileSearchTool,
      ComputerTool,
      ResponseInputAudio,
      ResponseInputFile,
      ResponseInputImage,
    ])
  ),
  model: Model,
  "background?": Background,
  "include?": Include,
  "instructions?": Instructions,
  "max_output_tokens?": MaxOutputTokens,
  "metadata?": MetadataSchema,
  "parallel_tool_calls?": ParallelToolCalls,
  "previous_response_id?": PreviousResponseId,
  "reasoning?": Reasoning,
  "service_tier?": ServiceTier,
  "store?": Store,
  "tools?": ToolsList,
  "temperature?": Temperature,
  "text?": ResponseTextConfig,
  "tool_choice?": ToolChoice,
  "top_p?": TopP,
  "truncation?": Truncation,
  "user?": User,
}).or("null");
const StreamFalse = type("false").or("null");
const StreamTrue = type("true");
const ResponseCreateParamsNonStreaming = type({ "stream?": StreamFalse })
  .and(ResponseCreateParamsBase)
  .or("null");
const ResponseCreateParamsStreaming = type({ stream: StreamTrue })
  .and(ResponseCreateParamsBase)
  .or("null");

// Export all schemas
export const createParamsSchemas = {
  Model,
  ReasoningEffort,
  Reasoning,
  Background,
  IncludeItem,
  Include,
  Instructions,
  MaxOutputTokens,
  Metadata: MetadataSchema,
  ParallelToolCalls,
  PreviousResponseId,
  ServiceTier,
  Store,
  ResponseInputAudio,
  ResponseInputFile,
  ResponseInputImage,
  ResponseInputContent,
  ResponseInputContentList,
  EasyInputMessage,
  FileSearchTool,
  ComputerTool,
  FunctionTool,
  ToolItem,
  ToolsList,
  Temperature,
  TopP,
  Truncation,
  User,
  ToolChoiceOptions,
  ToolChoiceTypesSchema,
  ToolChoiceFunctionSchema,
  ToolChoice,
  ResponseTextConfig,
  ResponseCreateParamsBase,
  StreamFalse,
  StreamTrue,
  ResponseCreateParamsNonStreaming,
  ResponseCreateParamsStreaming,
} as const;
