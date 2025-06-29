import { Type, type Static } from "@sinclair/typebox";
import * as Base from "./BaseSchemas";
import {
  ResponseOutputText,
  ResponseOutputRefusal,
  ResponseOutputItem,
  Response,
} from "./ResponseSchemas";

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
    item_id: Base.ID,
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
    item_id: Base.ID,
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

export const ResponseWebSearchCallInProgressEvent = Type.Object(
  {
    item_id: Base.ID,
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.web_search_call.in_progress"),
  },
  { description: "Web search call in progress" }
);
export type ResponseWebSearchCallInProgressEvent = Static<
  typeof ResponseWebSearchCallInProgressEvent
>;

export const ResponseWebSearchCallSearchingEvent = Type.Object(
  {
    item_id: Base.ID,
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.web_search_call.searching"),
  },
  { description: "Web search call searching" }
);
export type ResponseWebSearchCallSearchingEvent = Static<
  typeof ResponseWebSearchCallSearchingEvent
>;

export const ResponseWebSearchCallCompletedEvent = Type.Object(
  {
    item_id: Base.ID,
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.web_search_call.completed"),
  },
  { description: "Web search call completed" }
);
export type ResponseWebSearchCallCompletedEvent = Static<
  typeof ResponseWebSearchCallCompletedEvent
>;

// Non-streaming Events
export const ResponseContentPartAddedEvent = Type.Object(
  {
    content_index: Type.Number(),
    item_id: Base.ID,
    output_index: Type.Number(),
    part: Type.Union([ResponseOutputText, ResponseOutputRefusal]),
    sequence_number: Type.Number(),
    type: Type.Literal("response.content_part.added"),
  },
  { description: "Emitted when a new content part is added." }
);
export type ResponseContentPartAddedEvent = Static<
  typeof ResponseContentPartAddedEvent
>;

export const ResponseContentPartDoneEvent = Type.Object(
  {
    content_index: Type.Number(),
    item_id: Base.ID,
    output_index: Type.Number(),
    part: Type.Union([ResponseOutputText, ResponseOutputRefusal]),
    sequence_number: Type.Number(),
    type: Type.Literal("response.content_part.done"),
  },
  { description: "Emitted when a content part is done." }
);
export type ResponseContentPartDoneEvent = Static<
  typeof ResponseContentPartDoneEvent
>;

export const ResponseCreatedEvent = Type.Object(
  {
    response: Response,
    sequence_number: Type.Number(),
    type: Type.Literal("response.created"),
  },
  { description: "Emitted when a response is created." }
);
export type ResponseCreatedEvent = Static<typeof ResponseCreatedEvent>;

export const ResponseErrorEvent = Type.Object(
  {
    code: Type.Union([Type.String(), Type.Null()]),
    message: Type.String(),
    param: Type.Union([Type.String(), Type.Null()]),
    sequence_number: Type.Number(),
    type: Type.Literal("error"),
  },
  { description: "Emitted when an error occurs." }
);
export type ResponseErrorEvent = Static<typeof ResponseErrorEvent>;

/**
 * An event that is emitted when a response fails.
 */
export const ResponseFailedEvent = Type.Object(
  {
    response: Response,
    sequence_number: Type.Number({
      description: "The sequence number of this event.",
    }),
    type: Type.Literal("response.failed", {
      description: "The type of the event. Always `response.failed`.",
    }),
  },
  { description: "An event that is emitted when a response fails." }
);
export type ResponseFailedEvent = Static<typeof ResponseFailedEvent>;

export const ResponseIncompleteEvent = Type.Object(
  {
    response: Response,
    sequence_number: Type.Number(),
    type: Type.Literal("response.incomplete"),
  },
  { description: "Emitted when a response finishes as incomplete." }
);
export type ResponseIncompleteEvent = Static<typeof ResponseIncompleteEvent>;

export const ResponseOutputItemAddedEvent = Type.Object(
  {
    item: ResponseOutputItem,
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.output_item.added"),
  },
  { description: "Emitted when a new output item is added." }
);
export type ResponseOutputItemAddedEvent = Static<
  typeof ResponseOutputItemAddedEvent
>;

export const ResponseOutputItemDoneEvent = Type.Object(
  {
    item: ResponseOutputItem,
    output_index: Type.Number(),
    sequence_number: Type.Number(),
    type: Type.Literal("response.output_item.done"),
  },
  { description: "Emitted when an output item is marked done." }
);
export type ResponseOutputItemDoneEvent = Static<
  typeof ResponseOutputItemDoneEvent
>;

export const ResponseStreamEvent = Type.Union(
  [
    ResponseAudioDeltaEvent,
    ResponseAudioDoneEvent,
    ResponseTextDeltaEvent,
    ResponseTextDoneEvent,
    ResponseCompletedEvent,
    ResponseWebSearchCallInProgressEvent,
    ResponseWebSearchCallSearchingEvent,
    ResponseWebSearchCallCompletedEvent,
    ResponseCreatedEvent,
    ResponseErrorEvent,
    ResponseContentPartAddedEvent,
    ResponseContentPartDoneEvent,
    ResponseFailedEvent,
    ResponseIncompleteEvent,
    ResponseOutputItemAddedEvent,
    ResponseOutputItemDoneEvent,
  ],
  { description: "Union of all defined response events" }
);
export type ResponseStreamEvent = Static<typeof ResponseStreamEvent>;
