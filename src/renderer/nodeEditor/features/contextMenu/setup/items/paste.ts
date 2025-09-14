import { notify } from "renderer/features/toast-notice/notify";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import { pasteWorkflowAtPosition } from "renderer/nodeEditor/features/pasteWorkflow/pasteWorkflow";
import type { NodeDeps } from "renderer/nodeEditor/nodes/factoryTypes";
import type { Schemes } from "renderer/nodeEditor/types";
import type { Item } from "rete-context-menu-plugin/_types/types";
import type { GraphJsonData } from "shared/JsonType";

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
    const parsed = JSON.parse(clipboardData);
    if (!isGraphJsonData(parsed)) {
      console.warn("Clipboard JSON is not a valid GraphJsonData");
      notify("error", "Clipboard JSON is not a valid GraphJsonData");
      return null;
    }
    return parsed;
  } catch (e) {
    // パースエラーや権限エラーを包含
    console.warn("Failed to read/parse clipboard as GraphJsonData", e);
    notify("error", "Failed to read/parse clipboard as GraphJsonData");
    return null;
  }
}

/**
 * GraphJsonData の最低限のバリデーション
 */
function isGraphJsonData(data: unknown): data is GraphJsonData {
  const d = data as Partial<GraphJsonData> | null | undefined;
  return !!d && Array.isArray(d.nodes) && Array.isArray(d.connections);
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
