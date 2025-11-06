import { expect, test, vi } from "vitest";

vi.mock("renderer/features/services/appService", () => ({
  electronApiService: { sendChatGptMessage: vi.fn() },
}));

import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { OpenAINode } from "@nodes/OpenAI/OpenAI/renderer/OpenAI";
import type { Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
const dataflow = {
  fetchInputs: vi.fn(),
  reset: vi.fn(),
} as unknown as DataflowEngine<Schemes>;
const controlflow = {} as ControlFlowEngine<Schemes>;

function createNode() {
  return new OpenAINode(area, dataflow, controlflow);
}

test("onPortEvent processes stream events", async () => {
  const node = createNode();
  const close = vi.fn();
  node.port = { close } as unknown as MessagePort;
  const forward = vi.fn();
  await (node as any).onPortEvent(
    {
      type: "openai",
      data: {
        type: "response.output_text.delta",
        delta: "a",
        content_index: 0,
        item_id: "id",
        output_index: 0,
        sequence_number: 0,
      },
    },

    forward
  );
  expect(node.response).toEqual({
    type: "response.output_text.delta",
    delta: "a",
    content_index: 0,
    item_id: "id",
    output_index: 0,
    sequence_number: 0,
  });
  await (node as any).onPortEvent(
    {
      type: "openai",
      data: {
        type: "response.output_text.done",
        text: "end",
        content_index: 0,
        item_id: "id",
        output_index: 0,
        sequence_number: 1,
      },
    },
    forward
  );
  expect(node.response).toEqual({
    type: "response.output_text.done",
    text: "end",
    content_index: 0,
    item_id: "id",
    output_index: 0,
    sequence_number: 1,
  });
  expect(node.status).toBe(NodeStatus.COMPLETED);
  expect(forward).toHaveBeenCalledTimes(2);
  expect(close).toHaveBeenCalled();
});
