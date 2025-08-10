import type { NodeTypes, Schemes } from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";

export function getSelectedNodes(editor: NodeEditor<Schemes>): NodeTypes[] {
  return editor.getNodes().filter((node) => node.selected);
}
