import { UChatToOpenAINode } from "@nodes/Chat/UChatToOpenAI/renderer/UChatToOpenAINode";
import type { UChat } from "@nodes/Chat/common/schema/UChatMessage";
import { expect, test } from "vitest";

test("UChatToOpenAINode converts UChat to ResponseInput", () => {
  const node = new UChatToOpenAINode();
  const chat: UChat = [
    { role: "user", content: [{ type: "text", text: "hello" }] },
  ];
  const result = node.data({ uChat: [chat] });
  expect(result.out).toEqual([
    {
      role: "user",
      content: "hello",
      type: "message",
    },
  ]);
});

