import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { IFNode } from "renderer/nodeEditor/nodes/Node/Primitive/Flow/IFNode";
import type { Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import { expect, test, vi } from "vitest";

const history = {} as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;

function createNode(fetchInputSingle: () => Promise<any>) {
  const dataflow = { fetchInputSingle } as unknown as DataflowEngine<Schemes>;
  return new IFNode(history, area, dataflow);
}

test('IFNode.execute forwards to "exec" when condition is true', async () => {
  const node = createNode(async () => true);
  const forward = vi.fn();
  await node.execute(undefined as never, forward);
  expect(forward).toHaveBeenCalledWith("exec");
});

test('IFNode.execute forwards to "exec2" when condition is false', async () => {
  const node = createNode(async () => false);
  const forward = vi.fn();
  await node.execute(undefined as never, forward);
  expect(forward).toHaveBeenCalledWith("exec2");
});
