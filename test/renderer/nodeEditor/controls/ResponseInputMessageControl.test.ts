import { test, expect } from "vitest";

import { ResponseInputMessageControl } from "renderer/nodeEditor/nodes/Controls/OpenAI/ResponseInputMessage";
import { ChatMessageItem } from "renderer/nodeEditor/types/Schemas";

const sampleMessage: ChatMessageItem = {
  id: "1",
  role: "user",
  type: "message",
  content: [{ type: "input_text", text: "hello" }],
};

test("addNewMessage adds a message", () => {
  const control = new ResponseInputMessageControl({ value: [] });
  control.addMessage(sampleMessage);
  expect(control.getValue()).toHaveLength(1);
  expect(control.getValue()[0]).toEqual(sampleMessage);
});

test("removeMessage deletes the given index", () => {
  const control = new ResponseInputMessageControl({ value: [sampleMessage] });
  control.removeMessage(0);
  expect(control.getValue()).toHaveLength(0);
});
