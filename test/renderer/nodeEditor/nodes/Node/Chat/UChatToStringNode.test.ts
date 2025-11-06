import { UChatToStringNode } from "@nodes/Chat/UChatToString/renderer/UChatToStringNode";
import type { UChat } from "@nodes/Chat/common/schema/UChatMessage";
import { expect, test } from "vitest";

const node = new UChatToStringNode();
const messages: UChat = [
  {
    id: "1",
    content: [{ type: "text", text: "hello" }],
    role: "user",
  },
  {
    id: "2",
    content: [{ type: "text", text: "world" }],
    role: "assistant",
  },
];

test("UChatToStringNode without role", () => {
  const result = node.data({ list: [messages] });
  expect(result.out).toBe("hello\n\nworld");
});

test("UChatToStringNode with custom roles", () => {
  const result = node.data({
    list: [messages],
    isAddRole: [true],
    userString: ["U"],
    assistantString: ["A"],
  });
  expect(result.out).toBe("U\nhello\n\nA\nworld");
});

