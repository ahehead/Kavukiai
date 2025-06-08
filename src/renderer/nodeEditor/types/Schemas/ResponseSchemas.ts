import { Type, type Static } from "@sinclair/typebox";
import * as Base from "./BaseSchemas";

// Enum-like unions
export const ResponseStatus = Type.Union(
  [
    Type.Literal("completed"),
    Type.Literal("failed"),
    Type.Literal("in_progress"),
    Type.Literal("cancelled"),
    Type.Literal("queued"),
    Type.Literal("incomplete"),
  ],
  { description: "Status of the response generation" }
);
export type ResponseStatus = Static<typeof ResponseStatus>;

export const ServiceTier = Type.Union(
  [
    Type.Literal("auto"),
    Type.Literal("default"),
    Type.Literal("flex"),
    Type.Null(),
  ],
  { description: "Service tier" }
);
export type ServiceTier = Static<typeof ServiceTier>;

// Error
export const ResponseError = Type.Object(
  {
    code: Type.String(), // specific codes omitted for brevity
    message: Type.String(),
  },
  { description: "Error object returned when model fails" }
);
export type ResponseError = Static<typeof ResponseError>;

// Incomplete details
export const IncompleteDetails = Type.Object(
  {
    reason: Type.Optional(
      Type.Union([
        Type.Literal("max_output_tokens"),
        Type.Literal("content_filter"),
      ])
    ),
  },
  { description: "Details why response is incomplete" }
);
export type IncompleteDetails = Static<typeof IncompleteDetails>;

// Annotations for ResponseOutputText
export const FileCitation = Type.Object({
  file_id: Base.ID,
  index: Type.Number(),
  type: Type.Literal("file_citation"),
});
export type FileCitation = Static<typeof FileCitation>;

export const URLCitation = Type.Object({
  start_index: Type.Number(),
  end_index: Type.Number(),
  title: Type.String(),
  url: Type.String(),
  type: Type.Literal("url_citation"),
});
export type URLCitation = Static<typeof URLCitation>;

export const FilePath = Type.Object({
  file_id: Base.ID,
  index: Type.Number(),
  type: Type.Literal("file_path"),
});
export type FilePath = Static<typeof FilePath>;

export const Annotation = Type.Union([FileCitation, URLCitation, FilePath], {
  description: "Annotation in output text",
});
export type Annotation = Static<typeof Annotation>;

// Logprob details
export const TopLogprob = Type.Object({
  token: Type.String(),
  bytes: Type.Array(Type.Number()),
  logprob: Type.Number(),
});
export type TopLogprob = Static<typeof TopLogprob>;

export const Logprob = Type.Object({
  token: Type.String(),
  bytes: Type.Array(Type.Number()),
  logprob: Type.Number(),
  top_logprobs: Type.Array(TopLogprob),
});
export type Logprob = Static<typeof Logprob>;

// Output Text
export const ResponseOutputText = Type.Object(
  {
    annotations: Type.Array(Annotation),
    text: Type.String(),
    type: Type.Literal("output_text"),
    logprobs: Type.Optional(Type.Array(Logprob)),
  },
  { description: "A text output from the model" }
);
export type ResponseOutputText = Static<typeof ResponseOutputText>;

// Output Refusal
export const ResponseOutputRefusal = Type.Object(
  {
    refusal: Type.String(),
    type: Type.Literal("refusal"),
  },
  { description: "A refusal from the model" }
);
export type ResponseOutputRefusal = Static<typeof ResponseOutputRefusal>;

// Output Message
export const ResponseOutputMessage = Type.Object(
  {
    id: Base.ID,
    content: Type.Array(
      Type.Union([ResponseOutputText, ResponseOutputRefusal])
    ),
    role: Type.Literal("assistant"),
    status: Type.Union([
      Type.Literal("in_progress"),
      Type.Literal("completed"),
      Type.Literal("incomplete"),
    ]),
    type: Type.Literal("message"),
  },
  { description: "An output message from the model" }
);
export type ResponseOutputMessage = Static<typeof ResponseOutputMessage>;

export const ResponseFileSearchToolCallResult = Type.Object(
  {
    file_id: Type.Optional(Base.ID),
    filename: Type.Optional(Type.String()),
    text: Type.Optional(Type.String()),
    score: Type.Optional(Type.Number()),
    attributes: Type.Optional(
      Type.Union([
        Type.Record(
          Type.String(),
          Type.Union([Type.String(), Type.Number(), Type.Boolean()])
        ),
        Type.Null(),
      ])
    ),
  },
  { description: "Single file search result" }
);
export type ResponseFileSearchToolCallResult = Static<
  typeof ResponseFileSearchToolCallResult
>;

// File Search Tool Call
export const ResponseFileSearchToolCall = Type.Object(
  {
    id: Base.ID,
    queries: Type.Array(Type.String()),
    status: Type.Union([
      Type.Literal("in_progress"),
      Type.Literal("searching"),
      Type.Literal("completed"),
      Type.Literal("incomplete"),
      Type.Literal("failed"),
    ]),
    type: Type.Literal("file_search_call"),
    results: Type.Optional(Type.Array(ResponseFileSearchToolCallResult)),
  },
  { description: "Results of a file search tool call" }
);
export type ResponseFileSearchToolCall = Static<
  typeof ResponseFileSearchToolCall
>;

// Function Tool Call
export const ResponseFunctionToolCall = Type.Object(
  {
    arguments: Type.String(),
    call_id: Base.ID,
    name: Type.String(),
    type: Type.Literal("function_call"),
    id: Base.ID,
    status: Type.Optional(
      Type.Union([
        Type.Literal("in_progress"),
        Type.Literal("completed"),
        Type.Literal("incomplete"),
      ])
    ),
  },
  { description: "A tool call to run a function" }
);
export type ResponseFunctionToolCall = Static<typeof ResponseFunctionToolCall>;

// Computer Tool Call
export const ResponseComputerToolCall = Type.Object(
  {
    id: Base.ID,
    action: Type.Unknown(),
    call_id: Base.ID,
    pending_safety_checks: Type.Array(Type.Unknown()),
    status: Type.Union([
      Type.Literal("in_progress"),
      Type.Literal("completed"),
      Type.Literal("incomplete"),
    ]),
    type: Type.Literal("computer_call"),
  },
  { description: "A tool call to a computer use tool" }
);
export type ResponseComputerToolCall = Static<typeof ResponseComputerToolCall>;

// Code Interpreter Tool Call
export const ResponseCodeInterpreterToolCall = Type.Object(
  {
    id: Base.ID,
    code: Type.String(),
    results: Type.Array(Type.Unknown()),
    status: Type.Union([
      Type.Literal("in_progress"),
      Type.Literal("interpreting"),
      Type.Literal("completed"),
    ]),
    type: Type.Literal("code_interpreter_call"),
  },
  { description: "A tool call to run code via the code interpreter" }
);
export type ResponseCodeInterpreterToolCall = Static<
  typeof ResponseCodeInterpreterToolCall
>;

// Image Generation Call
export const ResponseImageGenCall = Type.Object(
  {
    id: Base.ID,
    result: Type.Union([Type.String(), Type.Null()]),
    status: Type.Union([
      Type.Literal("in_progress"),
      Type.Literal("generating"),
      Type.Literal("completed"),
      Type.Literal("failed"),
    ]),
    type: Type.Literal("image_generation_call"),
  },
  { description: "A tool call to generate an image" }
);
export type ResponseImageGenCall = Static<typeof ResponseImageGenCall>;

// Local Shell Call
export const ResponseLocalShellCall = Type.Object(
  {
    id: Base.ID,
    action: Type.Unknown(),
    call_id: Base.ID,
    status: Type.Union([
      Type.Literal("in_progress"),
      Type.Literal("completed"),
      Type.Literal("incomplete"),
    ]),
    type: Type.Literal("local_shell_call"),
  },
  { description: "A tool call to run a command on the local shell" }
);
export type ResponseLocalShellCall = Static<typeof ResponseLocalShellCall>;

// MCP List Tools
export const ResponseMcpListTools = Type.Object(
  {
    id: Base.ID,
    server_label: Type.String(),
    tools: Type.Array(Type.Unknown()),
    type: Type.Literal("mcp_list_tools"),
    error: Type.Optional(Type.String()),
  },
  { description: "A list of tools available on an MCP server" }
);
export type ResponseMcpListTools = Static<typeof ResponseMcpListTools>;

// MCP Approval Request
export const ResponseMcpApprovalRequest = Type.Object(
  {
    id: Base.ID,
    arguments: Type.String(),
    name: Type.String(),
    server_label: Type.String(),
    type: Type.Literal("mcp_approval_request"),
  },
  { description: "A request for human approval of an MCP tool invocation" }
);
export type ResponseMcpApprovalRequest = Static<
  typeof ResponseMcpApprovalRequest
>;

// MCP Approval Response
export const ResponseMcpApprovalResponse = Type.Object(
  {
    approval_request_id: Type.String(),
    approve: Type.Boolean(),
    type: Type.Literal("mcp_approval_response"),
    id: Type.Optional(Base.ID),
    reason: Type.Optional(Type.String()),
  },
  { description: "A response to an MCP approval request" }
);
export type ResponseMcpApprovalResponse = Static<
  typeof ResponseMcpApprovalResponse
>;

// MCP Call
export const ResponseMcpCall = Type.Object(
  {
    id: Base.ID,
    arguments: Type.String(),
    name: Type.String(),
    server_label: Type.String(),
    type: Type.Literal("mcp_call"),
    error: Type.Optional(Type.String()),
    output: Type.Optional(Type.String()),
  },
  { description: "An invocation of a tool on an MCP server" }
);
export type ResponseMcpCall = Static<typeof ResponseMcpCall>;

// Item Reference
export const ResponseItemReference = Type.Object(
  {
    id: Base.ID,
    type: Type.Literal("item_reference"),
  },
  { description: "An internal identifier for an item to reference" }
);
export type ResponseItemReference = Static<typeof ResponseItemReference>;

// Output Item union (partial)
export const ResponseOutputItem = Type.Union(
  [
    ResponseOutputMessage,
    ResponseFileSearchToolCall,
    ResponseFunctionToolCall,
    ResponseComputerToolCall,
    ResponseCodeInterpreterToolCall,
    ResponseImageGenCall,
    ResponseLocalShellCall,
    ResponseMcpListTools,
    ResponseMcpApprovalRequest,
    ResponseMcpApprovalResponse,
    ResponseMcpCall,
    ResponseItemReference,
  ],
  { description: "Output items generated by the model" }
);
export type ResponseOutputItem = Static<typeof ResponseOutputItem>;

// Main Response object
export const Response = Type.Object(
  {
    id: Base.ID,
    created_at: Base.Timestamp,
    output_text: Type.String(),
    error: Type.Union([ResponseError, Type.Null()]),
    incomplete_details: Type.Union([IncompleteDetails, Type.Null()]),
    instructions: Type.Union([Type.String(), Type.Null()]),
    metadata: Type.Union([Type.Unknown(), Type.Null()]),
    model: Type.String(), // Shared.ResponsesModel omitted
    object: Type.Literal("response"),
    output: Type.Array(ResponseOutputItem),
    parallel_tool_calls: Type.Boolean(),
    temperature: Type.Union([Type.Number(), Type.Null()]),
    tool_choice: Type.Unknown(),
    tools: Type.Array(Type.Unknown()),
    top_p: Type.Union([Type.Number(), Type.Null()]),
    background: Type.Union([Type.Boolean(), Type.Null()]),
    max_output_tokens: Type.Union([Type.Number(), Type.Null()]),
    previous_response_id: Type.Union([Type.String(), Type.Null()]),
    service_tier: ServiceTier,
    status: ResponseStatus,
    text: Type.Optional(Type.Unknown()),
    truncation: Type.Union([
      Type.Literal("auto"),
      Type.Literal("disabled"),
      Type.Null(),
    ]),
    usage: Type.Optional(Type.Unknown()),
    user: Type.Optional(Type.String()),
  },
  { description: "Response object" }
);
export type Response = Static<typeof Response>;

// Streaming Events
export const ResponseAudioDeltaEvent = Type.Object(
  {
    delta: Type.String(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.audio.delta"),
  },
  { description: "Partial audio response chunk" }
);
export type ResponseAudioDeltaEvent = Static<typeof ResponseAudioDeltaEvent>;

export const ResponseAudioDoneEvent = Type.Object(
  {
    sequence_number: Type.Number(),
    type: Type.Literal("response.audio.done"),
  },
  { description: "Audio response complete" }
);
export type ResponseAudioDoneEvent = Static<typeof ResponseAudioDoneEvent>;

export const ResponseTextDeltaEvent = Type.Object(
  {
    content_index: Type.Number(),
    delta: Type.String(),
    item_id: Type.String(),
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.output_text.delta"),
  },
  { description: "Partial text output delta" }
);
export type ResponseTextDeltaEvent = Static<typeof ResponseTextDeltaEvent>;

export const ResponseTextDoneEvent = Type.Object(
  {
    content_index: Type.Number(),
    item_id: Type.String(),
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    text: Type.String(),
    type: Type.Literal("response.output_text.done"),
  },
  { description: "Text output complete" }
);
export type ResponseTextDoneEvent = Static<typeof ResponseTextDoneEvent>;

export const ResponseCompletedEvent = Type.Object(
  {
    response: Response,
    sequence_number: Type.Number(),
    type: Type.Literal("response.completed"),
  },
  { description: "Model response complete event" }
);
export type ResponseCompletedEvent = Static<typeof ResponseCompletedEvent>;

export const ResponseStreamEvent = Type.Union(
  [
    ResponseAudioDeltaEvent,
    ResponseAudioDoneEvent,
    ResponseTextDeltaEvent,
    ResponseTextDoneEvent,
    ResponseCompletedEvent,
  ],
  { description: "Union of all streaming response events" }
);
export type ResponseStreamEvent = Static<typeof ResponseStreamEvent>;
