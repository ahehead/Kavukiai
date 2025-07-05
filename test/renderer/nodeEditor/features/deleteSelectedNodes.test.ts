import { test, expect, vi, type Mock } from "vitest";
import type { NodeEditor } from "rete";
import type { Schemes } from "renderer/nodeEditor/types";
import { setupDeleteSelectedNodes } from "renderer/nodeEditor/features/deleteSelectedNodes/deleteSelectedNodes";
import { removeNodeWithConnections } from "renderer/nodeEditor/nodes/util/removeNode";

vi.mock("renderer/nodeEditor/nodes/util/removeNode", () => ({
  removeNodeWithConnections: vi.fn(),
}));

test("setupDeleteSelectedNodes removes selected nodes on Delete key press", async () => {
  const nodes = [
    { id: "1", selected: true },
    { id: "2", selected: false },
    { id: "3", selected: true },
  ] as any[];
  const editor = {
    getNodes: () => nodes,
  } as unknown as NodeEditor<Schemes>;

  const listeners: Record<string, (e: any) => void> = {};
  (global as any).window = {
    addEventListener: (type: string, cb: (e: any) => void) => {
      listeners[type] = cb;
    },
    removeEventListener: vi.fn(),
  };

  const cleanup = setupDeleteSelectedNodes(editor);
  listeners.keydown({ key: "Delete" });

  const fn = removeNodeWithConnections as unknown as Mock;
  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenNthCalledWith(1, editor, "1");
  expect(fn).toHaveBeenNthCalledWith(2, editor, "3");

  cleanup();
});
