import { GetLastMessageNode } from "renderer/nodeEditor/nodes/Node";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/ChatMessageItem";
import { expect, test } from "vitest";

const node = new GetLastMessageNode();
const messages: ChatMessageItem[] = [
  {
    id: "1",
    content: [{ type: "input_text", text: "hello" }],
    role: "user",
    type: "message",
  },
  {
    id: "2",
    content: [{ type: "input_text", text: "world" }],
    role: "assistant",
    type: "message",
  },
];

test("GetLastMessageNode without role", () => {
  const result = node.data({ list: [messages] });
  expect(result.out).toBe("world");
});

test("GetLastMessageNode with role", () => {
  const result = node.data({
    list: [messages],
    isAddRole: [true],
    roleString: ["Assistant"],
  });
  expect(result.out).toBe("Assistant\nworld");
});
