import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { ShowImageNode } from "renderer/nodeEditor/nodes/Node/Primitive/Image/ShowImageNode";
import type { Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import { expect, test, vi } from "vitest";

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
const dataflow = { fetchInputs: vi.fn() } as unknown as DataflowEngine<Schemes>;
const controlflow = {
  execute: vi.fn(),
} as unknown as ControlFlowEngine<Schemes>;

function createNode() {
  return new ShowImageNode(area, dataflow, controlflow);
}

test("execute updates image control", async () => {
  const node = createNode();
  const img = { url: "path", alt: "a" } as any;
  (dataflow.fetchInputs as any).mockResolvedValueOnce({ image: [img] });
  await node.execute();
  expect(node.controls.view.getValue()).toEqual([img]);
  expect(area.update).toHaveBeenCalledWith("control", node.controls.view.id);
});
