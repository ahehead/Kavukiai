import { expect, test, vi } from "vitest";

vi.mock("renderer/features/services/appService", () => ({
  electronApiService: { unloadAllModels: vi.fn() },
}));

import { UnLoadModelNode } from "@nodes/LMStudio/UnLoadModel/renderer/UnLoadModelNode";
import type { Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
const controlflow = {} as unknown as ControlFlowEngine<Schemes>;

function createNode() {
  return new UnLoadModelNode(area, controlflow);
}

test("execute unloads models", async () => {
  const node = createNode();
  const { electronApiService } = (await import(
    "renderer/features/services/appService"
  )) as any;
  electronApiService.unloadAllModels.mockResolvedValueOnce({
    status: "success",
    data: "ok",
  });
  const forward = vi.fn();
  await node.execute("exec", forward as any);
  expect(electronApiService.unloadAllModels).toHaveBeenCalled();
  expect(node.status).toBe(NodeStatus.COMPLETED);
  expect(forward).toHaveBeenCalled();
});

test("execute sets error status on failure", async () => {
  const node = createNode();
  const { electronApiService } = (await import(
    "renderer/features/services/appService"
  )) as any;
  electronApiService.unloadAllModels.mockResolvedValueOnce({
    status: "error",
    message: "fail",
  });
  const forward = vi.fn();
  await node.execute("exec", forward as any);
  expect(node.status).toBe(NodeStatus.ERROR);
  expect(forward).toHaveBeenCalled();
});
