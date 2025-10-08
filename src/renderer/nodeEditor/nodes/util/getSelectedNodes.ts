import type { NodeTypes, Schemes } from "renderer/nodeEditor/types";
import type { NodeEditor } from "rete";

/**
 * @param editor - Reteエディタのインスタンス
 * @returns 選択中のノードの配列
 */
export function getSelectedNodes(editor: NodeEditor<Schemes>): NodeTypes[] {
  return editor.getNodes().filter((node) => node.selected);
}

/** 選択中のノード（右クリック対象を必ず含む）を収集
 * @param context - 右クリックされたノード
 * @param editor - Reteエディタのインスタンス
 * @returns 右クリックされたノードと選択中のノードを含む配列
 */
export function collectTargetNodes(
  context: NodeTypes,
  editor: NodeEditor<Schemes>
): NodeTypes[] {
  return [
    context,
    ...editor
      .getNodes()
      .filter((node) => node.selected && node.id !== context.id),
  ];
}
