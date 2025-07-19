import { expect, test, vi } from "vitest";

vi.mock("renderer/features/services/appService", () => ({
  electronApiService: { listDownloadedModels: vi.fn() },
}));

import { ListDownloadedModelsNode } from "renderer/nodeEditor/nodes/Node/LMStudio/ListDownloadedModelsNode";
import type { Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
const dataflow = { reset: vi.fn() } as unknown as DataflowEngine<Schemes>;
const controlflow = {} as ControlFlowEngine<Schemes>;

function createNode() {
  return new ListDownloadedModelsNode(area, dataflow, controlflow);
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
