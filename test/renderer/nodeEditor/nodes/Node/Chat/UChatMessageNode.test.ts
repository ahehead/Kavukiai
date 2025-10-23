import { UChatMessageNode } from "@nodes/Chat/UChatMessage/renderer/UChatMessageNode";
import type { UPart } from "@nodes/Chat/common/schema/UChatMessage";
import { expect, test } from "vitest";

test("UChatMessageNode builds UChatMessage", () => {
  const node = new UChatMessageNode();
  const parts: UPart[] = [{ type: "text", text: "hello" }];
  const result = node.data({ role: ["user"], list: [parts] });
  expect(result.out).toEqual({ role: "user", content: parts });
});

