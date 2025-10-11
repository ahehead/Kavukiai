import { setupDeleteSelectedNodes } from "renderer/nodeEditor/features/deleteSelectedNodes/deleteSelectedNodes";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import { removeNodeWithConnections } from "renderer/nodeEditor/nodes/util/removeNode";
import type { Schemes } from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";
import { expect, type Mock, test, vi } from "vitest";

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

  // 非同期ハンドラ（Promiseを返す）を待機できるようにanyにしておく
  const listeners: Record<string, (e: any) => any> = {};
  (global as any).window = {
    addEventListener: (type: string, cb: (e: any) => void) => {
      listeners[type] = cb;
    },
    removeEventListener: vi.fn(),
  };

  const deleteGroup = vi.fn();
  const groupPlugin = {
    groups: new Map([
      [
        "g1",
        {
          id: "g1",
          selected: true,
        },
      ],
      [
        "g2",
        {
          id: "g2",
          selected: false,
        },
      ],
    ]),
    delete: deleteGroup,
  } as unknown as GroupPlugin<Schemes>;

  const cleanup = setupDeleteSelectedNodes(editor, groupPlugin);
  // ハンドラはasyncでawaitを含むため、完了を待つ
  await listeners.keydown({ key: "Delete" });

  const fn = removeNodeWithConnections as unknown as Mock;
  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenNthCalledWith(1, editor, "1");
  expect(fn).toHaveBeenNthCalledWith(2, editor, "3");
  expect(deleteGroup).toHaveBeenCalledTimes(1);
  expect(deleteGroup).toHaveBeenCalledWith("g1");

  cleanup();
});
