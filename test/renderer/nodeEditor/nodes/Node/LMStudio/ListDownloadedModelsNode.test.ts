import { expect, test, vi } from "vitest";

vi.mock("renderer/features/services/appService", () => ({
  electronApiService: { listDownloadedModels: vi.fn() },
}));

import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { ListDownloadedModelsNode } from "@nodes/LMStudio/ListDownloadedModels/renderer/ListDownloadedModelsNode";
import type { Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { ControlFlowEngine } from "rete-engine";

const dataflow = {
  reset: vi.fn(),
  fetchInputSingle: vi.fn(),
  fetchInputMultiple: vi.fn(),
  hasDataWithFetch: vi.fn(),
} as unknown as DataflowEngine<Schemes>;
const controlflow = {} as ControlFlowEngine<Schemes>;

function createNode() {
  return new ListDownloadedModelsNode(dataflow, controlflow);
}

test("execute stores model list and forwards exec", async () => {
  const node = createNode();
  const { electronApiService } = (await import(
    "renderer/features/services/appService"
  )) as any;
  const models = [{ name: "model" }];
  electronApiService.listDownloadedModels.mockResolvedValueOnce({
    status: "success",
    data: models,
  });
  const forward = vi.fn();
  await node.execute("exec", forward);
  expect(electronApiService.listDownloadedModels).toHaveBeenCalled();
  expect(node.data().list).toEqual(models);
  expect(node.status).toBe(NodeStatus.COMPLETED);
  expect(forward).toHaveBeenCalledWith("exec");
});

test("execute sets error status on failure", async () => {
  const node = createNode();
  const { electronApiService } = (await import(
    "renderer/features/services/appService"
  )) as any;
  electronApiService.listDownloadedModels.mockResolvedValueOnce({
    status: "error",
    message: "fail",
  });
  const forward = vi.fn();
  await node.execute("exec", forward);
  expect(node.status).toBe(NodeStatus.ERROR);
  expect(node.data().list).toEqual([]);
  expect(forward).toHaveBeenCalledWith("exec");
});
