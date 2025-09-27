import { notify } from "renderer/features/toast-notice/notify";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import type { NodeDeps } from "renderer/nodeEditor/features/nodeFactory/factoryTypes";
import { pasteWorkflowAtPosition } from "renderer/nodeEditor/features/pasteWorkflow/pasteWorkflow";
import type { Schemes } from "renderer/nodeEditor/types";
import type { Item } from "rete-context-menu-plugin/_types/types";
import { type GraphJsonData, parseGraphJson } from "shared/JsonType";

export function createPasteItem(
  pointerPosition: { x: number; y: number },
  nodeDeps: NodeDeps,
  groupPlugin: GroupPlugin<Schemes>
): Item {
  return {
    label: "ノードをペースト",
    key: "paste-nodes",
    handler: async () => {
      // クリップボードから JSON を取得して貼り付け
      await pasteGraphFromClipboard(pointerPosition, nodeDeps, groupPlugin);
    },
  };
}

/**
 * クリップボードのテキストを GraphJsonData として読み取る
 */
async function parseClipboardGraphJson(): Promise<GraphJsonData | null> {
  try {
    const clipboardData = await navigator.clipboard.readText();
    return parseGraphJson(JSON.parse(clipboardData));
  } catch (e) {
    // パースエラーや権限エラーを包含
    console.warn("Failed to read/parse clipboard as GraphJsonData", e);
    notify("error", "Failed to read/parse clipboard as GraphJsonData");
    return null;
  }
}

/**
 * クリップボードからのペースト一連処理
 */
async function pasteGraphFromClipboard(
  pointerPosition: { x: number; y: number },
  nodeDeps: NodeDeps,
  groupPlugin: GroupPlugin<Schemes>
) {
  const jsonData = await parseClipboardGraphJson();
  if (!jsonData) return;
  await pasteWorkflowAtPosition({
    workflow: jsonData,
    pointerPosition,
    nodeDeps,
    groupPlugin,
  });
}
