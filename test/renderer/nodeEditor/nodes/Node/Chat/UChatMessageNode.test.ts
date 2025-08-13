import { UChatMessageNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatMessageNode";
import type { UPart } from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";
import { expect, test } from "vitest";

test("UChatMessageNode builds UChatMessage", () => {
  const node = new UChatMessageNode();
  const parts: UPart[] = [{ type: "text", text: "hello" }];
  const result = node.data({ role: ["user"], list: [parts] });
  expect(result.out).toEqual({ role: "user", content: parts });
});
