import { loadGraphFromJson } from "renderer/nodeEditor/features/loadGraphFromJson/loadGraphFromJson";
import type { NodeDeps } from "renderer/nodeEditor/nodes/nodeFactories";
import type { Item } from "rete-context-menu-plugin/_types/types";

export function createPasteItem(nodeDeps: NodeDeps): Item {
  return {
    label: "ノードをペースト",
    key: "paste-nodes",
    handler: async () => {
      const clipboardData = await navigator.clipboard.readText();
      const jsonData = JSON.parse(clipboardData);
      loadGraphFromJson({ graphJsonData: jsonData, ...nodeDeps });
    },
  };
}
