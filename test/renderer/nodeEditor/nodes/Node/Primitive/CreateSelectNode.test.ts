import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { CreateSelectNode } from "renderer/nodeEditor/nodes/Node/Primitive/CreateSelectNode";
import type { Schemes } from "renderer/nodeEditor/types";
import type { ControlFlowEngine } from "rete-engine";
import { expect, test, vi } from "vitest";

const dataflow = {
  fetchInputs: vi.fn(),
  reset: vi.fn(),
} as unknown as DataflowEngine<Schemes>;
const controlflow = {
  execute: vi.fn(),
} as unknown as ControlFlowEngine<Schemes>;

function createNode() {
  return new CreateSelectNode(dataflow, controlflow);
}

test("execute updates options and forwards exec", async () => {
  const node = createNode();
  (dataflow.fetchInputs as any).mockResolvedValueOnce({ list: [["a", "b"]] });
  const forward = vi.fn();
  await node.execute("exec", forward);
  expect(node.data().out).toBe("a");
  expect(forward).toHaveBeenCalledWith("exec");
});
