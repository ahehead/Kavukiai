import { type } from "arktype";

// Small units
const ResponseOutputTextAnnotations = type([type("object")]);
const ResponseOutputText = type({
  annotations: ResponseOutputTextAnnotations,
  text: type("string"),
  type: type('"output_text"'),
});
const ResponseOutputRefusal = type({
  refusal: type("string"),
  type: type('"refusal"'),
});

// Combined message
const ResponseOutputMessage = type({
  id: type("string"),
  content: type([ResponseOutputText, ResponseOutputRefusal]),
  role: type('"assistant"'),
  status: type('"in_progress" | "completed" | "incomplete"'),
  type: type('"message"'),
});

// Response output variants
const ResponseFileSearchToolCall = type({
  id: type("string"),
  queries: type([type("string")]),
  status: type(
    '"in_progress" | "searching" | "completed" | "incomplete" | "failed"'
  ),
  type: type('"file_search_call"'),
  "results?": type([
    type({
      "attributes?": type("object").or("null"),
      file_id: type("string").or("null"),
      filename: type("string").or("null"),
      score: type("number").or("null"),
      text: type("string").or("null"),
    }),
  ]).or("null"),
});

const ResponseFunctionToolCall = type({
  arguments: type("string"),
  call_id: type("string"),
  name: type("string"),
  type: type('"function_call"'),
  "id?": type("string"),
  "status?": type('"in_progress" | "completed" | "incomplete"').or("null"),
});

const ResponseFunctionWebSearch = type({
  id: type("string"),
  status: type('"in_progress" | "searching" | "completed" | "failed"'),
  type: type('"web_search_call"'),
});

const ResponseReasoningSummary = type({
  text: type("string"),
  type: type('"summary_text"'),
});

const ResponseReasoningItem = type({
  id: type("string"),
  summary: type([ResponseReasoningSummary]),
  type: type('"reasoning"'),
  "encrypted_content?": type("string").or("null"),
  "status?": type('"in_progress" | "completed" | "incomplete"').or("null"),
});

const ResponseImageGenerationCall = type({
  id: type("string"),
  result: type("string").or("null"),
  status: type('"in_progress" | "completed" | "generating" | "failed"'),
  type: type('"image_generation_call"'),
});

const ResponseCodeInterpreterLogs = type({
  logs: type("string"),
  type: type('"logs"'),
});
const ResponseCodeInterpreterFiles = type({
  files: type([type({ file_id: type("string"), mime_type: type("string") })]),
  type: type('"files"'),
});
const ResponseCodeInterpreterToolCall = type({
  id: type("string"),
  code: type("string"),
  results: type([ResponseCodeInterpreterLogs, ResponseCodeInterpreterFiles]),
  status: type('"in_progress" | "interpreting" | "completed"'),
  type: type('"code_interpreter_call"'),
  "container_id?": type("string").or("null"),
});

const ResponseLocalShellCallAction = type({
  command: type([type("string")]),
  env: type("object"),
  type: type('"exec"'),
  "timeout_ms?": type("number").or("null"),
  "user?": type("string").or("null"),
  "working_directory?": type("string").or("null"),
});
const ResponseLocalShellCall = type({
  id: type("string"),
  action: ResponseLocalShellCallAction,
  call_id: type("string"),
  status: type('"in_progress" | "completed" | "incomplete"'),
  type: type('"local_shell_call"'),
});

const ResponseMcpCall = type({
  id: type("string"),
  arguments: type("string"),
  name: type("string"),
  server_label: type("string"),
  type: type('"mcp_call"'),
  "error?": type("string").or("null"),
  "output?": type("string").or("null"),
});

const ResponseMcpListToolsTool = type({
  input_schema: type("object"),
  name: type("string"),
  "annotations?": type("object").or("null"),
  "description?": type("string").or("null"),
});
const ResponseMcpListTools = type({
  id: type("string"),
  server_label: type("string"),
  tools: type([ResponseMcpListToolsTool]),
  type: type('"mcp_list_tools"'),
  "error?": type("string").or("null"),
});

const ResponseMcpApprovalRequest = type({
  id: type("string"),
  arguments: type("string"),
  name: type("string"),
  server_label: type("string"),
  type: type('"mcp_approval_request"'),
});

// Computer tool call output
const ResponseComputerToolCall = type({
  id: type("string"),
  action: type("object"),
  call_id: type("string"),
  pending_safety_checks: type([type("object")]),
  status: type('"in_progress" | "completed" | "incomplete"'),
  type: type('"computer_call"'),
});

// Update output item union (remove Req.ComputerTool)
const ResponseOutputItem = type([
  ResponseOutputMessage,
  ResponseFileSearchToolCall,
  ResponseFunctionToolCall,
  ResponseFunctionWebSearch,
  ResponseComputerToolCall,
  ResponseReasoningItem,
  ResponseImageGenerationCall,
  ResponseCodeInterpreterToolCall,
  ResponseLocalShellCall,
  ResponseMcpCall,
  ResponseMcpListTools,
  ResponseMcpApprovalRequest,
]);

// Top-level Response object schema
const Response = type({
  id: type("string"),
  created_at: type("number"),
  output_text: type("string"),
  error: type("object").or("null"),
  incomplete_details: type("object").or("null"),
  instructions: type("string").or("null"),
  metadata: type("object").or("null"),
  model: type("string"),
  object: type('"response"'),
  output: type([ResponseOutputItem]),
  parallel_tool_calls: type("boolean"),
  temperature: type("number").or("null"),
  tool_choice: type("string").or(type("object")),
  tools: type([type("object")]),
  top_p: type("number").or("null"),
  background: type("boolean").or("null"),
  max_output_tokens: type("number").or("null"),
  previous_response_id: type("string").or("null"),
  reasoning: type("object").or("null"),
  service_tier: type('"auto" | "default" | "flex"').or("null"),
  status: type(
    '"completed" | "failed" | "in_progress" | "cancelled" | "queued" | "incomplete"'
  ),
  text: type("object").or("null"),
  truncation: type('"auto" | "disabled"').or("null"),
  usage: type("object").or("null"),
  user: type("string").or("null"),
});

export const responseSchemas = {
  ResponseOutputTextAnnotations,
  ResponseOutputText,
  ResponseOutputRefusal,
  ResponseOutputMessage,
  ResponseFileSearchToolCall,
  ResponseFunctionToolCall,
  ResponseFunctionWebSearch,
  ResponseComputerToolCall,
  ResponseReasoningItem,
  ResponseImageGenerationCall,
  ResponseCodeInterpreterToolCall,
  ResponseLocalShellCall,
  ResponseMcpCall,
  ResponseMcpListTools,
  ResponseMcpApprovalRequest,
  ResponseOutputItem,
  Response,
} as const;
