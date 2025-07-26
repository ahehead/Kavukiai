import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { LoadImageNode } from "renderer/nodeEditor/nodes/Node/Primitive/Image/LoadImageNode";
import type { Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import { expect, test, vi } from "vitest";

const history = {} as HistoryPlugin<Schemes>;
const area = {} as AreaPlugin<Schemes, any>;
const clearCacheSpy = vi.fn();
const dataflow = { reset: clearCacheSpy } as unknown as DataflowEngine<Schemes>;

function createNode() {
  return new LoadImageNode(history, area, dataflow);
}

test("data returns selected image", () => {
  const node = createNode();
  const img = { url: "path", alt: "a" };
  node.controls.file.setValue(img);
  expect(node.data().out).toEqual(img);
});

test("serialize/deserialize round trip", () => {
  const node = createNode();
  const img = { url: "path", alt: "b" };
  node.controls.file.setValue(img);
  const serialized = node.serializeControlValue().data;
  node.controls.file.setValue(null);
  node.controls.view.setValue(null);
  node.deserializeControlValue(serialized);
  expect(node.controls.file.getValue()).toEqual(img);
  expect(node.controls.view.getValue()).toEqual(img);
});
