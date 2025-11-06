import { ReverseRoleNode } from "@nodes/Chat/ReverseRole/renderer/ReverseRoleNode";
import type { UChat } from "@nodes/Chat/common/schema/UChatMessage";
import { expect, test } from "vitest";

const node = new ReverseRoleNode();
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

test("ReverseRoleNode swaps roles", () => {
  const result = node.data({ list: [messages] });
  expect(result.list[0].role).toBe("assistant");
  expect(result.list[1].role).toBe("user");
});

