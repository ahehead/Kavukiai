import { test, expect, vi } from 'vitest';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine, ControlFlowEngine } from 'rete-engine';
import type { Schemes } from 'renderer/nodeEditor/types';
import { ImageNode } from 'renderer/nodeEditor/nodes/Node/Output/ImageNode';

const area = { update: vi.fn() } as unknown as AreaPlugin<Schemes, any>;
const dataflow = { fetchInputs: vi.fn() } as unknown as DataflowEngine<Schemes>;
const controlflow = { execute: vi.fn() } as unknown as ControlFlowEngine<Schemes>;

function createNode() {
  return new ImageNode(area, dataflow, controlflow);
}

test('execute updates image control', async () => {
  const node = createNode();
  const img = { url: 'path', alt: 'a' };
  (dataflow.fetchInputs as any).mockResolvedValueOnce({ image: [img] });
  await node.execute();
  expect(node.controls.view.getValue()).toEqual(img);
  expect(area.update).toHaveBeenCalledWith('control', node.controls.view.id);
});
