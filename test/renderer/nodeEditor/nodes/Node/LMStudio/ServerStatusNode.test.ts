import { expect, test, vi } from "vitest";

vi.mock("renderer/features/services/appService", () => ({
  electronApiService: { getServerStatus: vi.fn() },
}));

import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { ServerStatusNode } from "renderer/nodeEditor/nodes/Node/LMStudio/ServerStatusNode";
import type { Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { ControlFlowEngine } from "rete-engine";

const dataflow = { reset: vi.fn() } as unknown as DataflowEngine<Schemes>;
const controlflow = {} as ControlFlowEngine<Schemes>;

function createNode() {
  return new ServerStatusNode(dataflow, controlflow);
}

test("execute fetches status and forwards exec", async () => {
  const node = createNode();
  const { electronApiService } = (await import(
    "renderer/features/services/appService"
  )) as any;
  const info = { server: "ON", port: 1234, loadedModels: ["a"] };
  electronApiService.getServerStatus.mockResolvedValueOnce({
    status: "success",
    data: info,
  });
  const forward = vi.fn();
  await node.execute("exec", forward);
  expect(electronApiService.getServerStatus).toHaveBeenCalled();
  expect(node.data().status).toEqual(info);
  expect(node.status).toBe(NodeStatus.COMPLETED);
  expect(forward).toHaveBeenCalledWith("exec");
});

test("execute sets error status on failure", async () => {
  const node = createNode();
  const { electronApiService } = (await import(
    "renderer/features/services/appService"
  )) as any;
  electronApiService.getServerStatus.mockResolvedValueOnce({
    status: "error",
    message: "fail",
  });
  const forward = vi.fn();
  await node.execute("exec", forward);
  expect(node.status).toBe(NodeStatus.ERROR);
  expect(forward).toHaveBeenCalledWith("exec");
});
