import { test, expect, vi } from 'vitest';
import { IFNode } from 'renderer/nodeEditor/nodes/Node/Flow/IFNode';
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';

const history = {} as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;

function createNode(fetchInputs: () => Promise<any>) {
  const dataflow = { fetchInputs } as unknown as DataflowEngine<Schemes>;
  return new IFNode(history, area, dataflow);
}

test('IFNode.execute forwards to "exec" when condition is true', async () => {
  const node = createNode(async () => ({ boolData: [true] }));
  const forward = vi.fn();
  await node.execute(undefined as never, forward);
  expect(forward).toHaveBeenCalledWith('exec');
});

test('IFNode.execute forwards to "exec2" when condition is false', async () => {
  const node = createNode(async () => ({ boolData: [false] }));
  const forward = vi.fn();
  await node.execute(undefined as never, forward);
  expect(forward).toHaveBeenCalledWith('exec2');
});
