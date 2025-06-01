import { type } from "arktype";
import { responseSchemas as Out } from "./responseSchemas";

// Core event schemas
const ResponseCreatedEvent = type({
  response: Out.ResponseOutputItem, // actual Response object schema is complex; use output item union as placeholder
  sequence_number: type("number"),
  type: type('"response.created"'),
});
const ResponseInProgressEvent = type({
  response: Out.ResponseOutputItem,
  sequence_number: type("number"),
  type: type('"response.in_progress"'),
});
const ResponseCompletedEvent = type({
  response: Out.ResponseOutputItem,
  sequence_number: type("number"),
  type: type('"response.completed"'),
});
const ResponseFailedEvent = type({
  response: Out.ResponseOutputItem,
  sequence_number: type("number"),
  type: type('"response.failed"'),
});
const ResponseErrorEvent = type({
  code: type("string").or("null"),
  message: type("string"),
  param: type("string").or("null"),
  sequence_number: type("number"),
  type: type('"error"'),
});

// Audio events
const ResponseAudioDeltaEvent = type({
  delta: type("string"),
  sequence_number: type("number"),
  type: type('"response.audio.delta"'),
});
const ResponseAudioDoneEvent = type({
  sequence_number: type("number"),
  type: type('"response.audio.done"'),
});
const ResponseAudioTranscriptDeltaEvent = type({
  delta: type("string"),
  sequence_number: type("number"),
  type: type('"response.audio.transcript.delta"'),
});
const ResponseAudioTranscriptDoneEvent = type({
  sequence_number: type("number"),
  type: type('"response.audio.transcript.done"'),
});

// Content events
const ResponseContentPartAddedEvent = type({
  content_index: type("number"),
  item_id: type("string"),
  output_index: type("number"),
  part: Out.ResponseOutputText.or(Out.ResponseOutputRefusal),
  sequence_number: type("number"),
  type: type('"response.content_part.added"'),
});
const ResponseContentPartDoneEvent = type({
  content_index: type("number"),
  item_id: type("string"),
  output_index: type("number"),
  part: Out.ResponseOutputText.or(Out.ResponseOutputRefusal),
  sequence_number: type("number"),
  type: type('"response.content_part.done"'),
});

// Output item events
const ResponseOutputItemAddedEvent = type({
  item: Out.ResponseOutputItem,
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.output_item.added"'),
});
const ResponseOutputItemDoneEvent = type({
  item: Out.ResponseOutputItem,
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.output_item.done"'),
});

// Text events
const ResponseTextDeltaEvent = type({
  content_index: type("number"),
  delta: type("string"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.output_text.delta"'),
});
const ResponseTextDoneEvent = type({
  content_index: type("number"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  text: type("string"),
  type: type('"response.output_text.done"'),
});

// Refusal events
const ResponseRefusalDeltaEvent = type({
  content_index: type("number"),
  delta: type("string"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.refusal.delta"'),
});
const ResponseRefusalDoneEvent = type({
  content_index: type("number"),
  item_id: type("string"),
  output_index: type("number"),
  refusal: type("string"),
  sequence_number: type("number"),
  type: type('"response.refusal.done"'),
});

// File search events
const ResponseFileSearchCallInProgressEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.file_search_call.in_progress"'),
});
const ResponseFileSearchCallSearchingEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.file_search_call.searching"'),
});
const ResponseFileSearchCallCompletedEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.file_search_call.completed"'),
});

// Web search events
const ResponseWebSearchCallInProgressEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.web_search_call.in_progress"'),
});
const ResponseWebSearchCallSearchingEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.web_search_call.searching"'),
});
const ResponseWebSearchCallCompletedEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.web_search_call.completed"'),
});

// Function call argument events
const ResponseFunctionCallArgumentsDeltaEvent = type({
  delta: type("string"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.function_call_arguments.delta"'),
});
const ResponseFunctionCallArgumentsDoneEvent = type({
  arguments: type("string"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.function_call_arguments.done"'),
});

// MCP call events
const ResponseMcpCallArgumentsDeltaEvent = type({
  delta: type("unknown"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.mcp_call.arguments_delta"'),
});
const ResponseMcpCallArgumentsDoneEvent = type({
  arguments: type("unknown"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.mcp_call.arguments_done"'),
});
const ResponseMcpCallInProgressEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.mcp_call.in_progress"'),
});
const ResponseMcpCallCompletedEvent = type({
  sequence_number: type("number"),
  type: type('"response.mcp_call.completed"'),
});
const ResponseMcpCallFailedEvent = type({
  sequence_number: type("number"),
  type: type('"response.mcp_call.failed"'),
});

// MCP list tools events
const ResponseMcpListToolsInProgressEvent = type({
  sequence_number: type("number"),
  type: type('"response.mcp_list_tools.in_progress"'),
});
const ResponseMcpListToolsCompletedEvent = type({
  sequence_number: type("number"),
  type: type('"response.mcp_list_tools.completed"'),
});
const ResponseMcpListToolsFailedEvent = type({
  sequence_number: type("number"),
  type: type('"response.mcp_list_tools.failed"'),
});

// Reasoning events
const ResponseReasoningDeltaEvent = type({
  delta: type("unknown"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.reasoning.delta"'),
});
const ResponseReasoningDoneEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  text: type("string"),
  type: type('"response.reasoning.done"'),
});

// Reasoning summary events
const ResponseReasoningSummaryDeltaEvent = type({
  delta: type("unknown"),
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.reasoning_summary.delta"'),
});
const ResponseReasoningSummaryDoneEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  text: type("string"),
  type: type('"response.reasoning_summary.done"'),
});
const ResponseReasoningSummaryPartAddedEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  summary_index: type("number"),
  part: type({ text: type("string"), type: type('"summary_text"') }),
  sequence_number: type("number"),
  type: type('"response.reasoning_summary_part.added"'),
});
const ResponseReasoningSummaryPartDoneEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  summary_index: type("number"),
  part: type({ text: type("string"), type: type('"summary_text"') }),
  sequence_number: type("number"),
  type: type('"response.reasoning_summary_part.done"'),
});

// Image generation streaming events
const ResponseImageGenCallInProgressEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.image_generation_call.in_progress"'),
});
const ResponseImageGenCallGeneratingEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.image_generation_call.generating"'),
});
const ResponseImageGenCallPartialImageEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  partial_image_b64: type("string"),
  partial_image_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.image_generation_call.partial_image"'),
});
const ResponseImageGenCallCompletedEvent = type({
  item_id: type("string"),
  output_index: type("number"),
  sequence_number: type("number"),
  type: type('"response.image_generation_call.completed"'),
});

// Queue and incomplete events
const ResponseQueuedEvent = type({
  response: Out.ResponseOutputItem,
  sequence_number: type("number"),
  type: type('"response.queued"'),
});
const ResponseIncompleteEvent = type({
  response: Out.ResponseOutputItem,
  sequence_number: type("number"),
  type: type('"response.incomplete"'),
});

// Union of all stream events
export const responseEventSchemas = {
  ResponseCreatedEvent,
  ResponseInProgressEvent,
  ResponseCompletedEvent,
  ResponseFailedEvent,
  ResponseErrorEvent,
  ResponseAudioDeltaEvent,
  ResponseAudioDoneEvent,
  ResponseAudioTranscriptDeltaEvent,
  ResponseAudioTranscriptDoneEvent,
  ResponseContentPartAddedEvent,
  ResponseContentPartDoneEvent,
  ResponseOutputItemAddedEvent,
  ResponseOutputItemDoneEvent,
  ResponseTextDeltaEvent,
  ResponseTextDoneEvent,
  ResponseRefusalDeltaEvent,
  ResponseRefusalDoneEvent,
  ResponseFileSearchCallInProgressEvent,
  ResponseFileSearchCallSearchingEvent,
  ResponseFileSearchCallCompletedEvent,
  ResponseWebSearchCallInProgressEvent,
  ResponseWebSearchCallSearchingEvent,
  ResponseWebSearchCallCompletedEvent,
  ResponseFunctionCallArgumentsDeltaEvent,
  ResponseFunctionCallArgumentsDoneEvent,
  ResponseMcpCallArgumentsDeltaEvent,
  ResponseMcpCallArgumentsDoneEvent,
  ResponseMcpCallInProgressEvent,
  ResponseMcpCallCompletedEvent,
  ResponseMcpCallFailedEvent,
  ResponseMcpListToolsInProgressEvent,
  ResponseMcpListToolsCompletedEvent,
  ResponseMcpListToolsFailedEvent,
  ResponseReasoningDeltaEvent,
  ResponseReasoningDoneEvent,
  ResponseReasoningSummaryDeltaEvent,
  ResponseReasoningSummaryDoneEvent,
  ResponseReasoningSummaryPartAddedEvent,
  ResponseReasoningSummaryPartDoneEvent,
  ResponseImageGenCallInProgressEvent,
  ResponseImageGenCallGeneratingEvent,
  ResponseImageGenCallPartialImageEvent,
  ResponseImageGenCallCompletedEvent,
  ResponseQueuedEvent,
  ResponseIncompleteEvent,
} as const;
