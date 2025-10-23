import { expect, test, vi } from "vitest";

vi.mock("renderer/features/services/appService", () => ({
  electronApiService: { loadModel: vi.fn() },
}));

import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { LMStudioLoadModelNode } from "@nodes/LMStudio/LMStudioLoadModel/renderer/LMStudioLoadModelNode";
import type { Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
const dataflow = {
  fetchInputs: vi.fn(),
  fetchInputSingle: vi.fn(),
  fetchInputMultiple: vi.fn(),
  hasDataWithFetch: vi.fn(),
} as unknown as DataflowEngine<Schemes>;
const controlflow = {} as ControlFlowEngine<Schemes>;

function createNode() {
  return new LMStudioLoadModelNode(area, dataflow, controlflow);
}

test("onPortEvent processes events", async () => {
  const node = createNode();
  const close = vi.fn();
  node.port = { close } as unknown as MessagePort;
  const forward = vi.fn();
  node.status = NodeStatus.RUNNING;
  await (node as any).onPortEvent({ type: "progress", progress: 0.5 }, forward);
  expect(node.status).toBe(NodeStatus.RUNNING);
  await (node as any).onPortEvent({ type: "finish" } as MessageEvent, forward);
  expect(node.status).toBe(NodeStatus.COMPLETED);
  expect(forward).toHaveBeenCalledWith("exec");
  expect(close).toHaveBeenCalled();
});
