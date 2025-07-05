import type { NodeEditor } from 'rete';
import { removeNodeWithConnections } from '../../nodes/util/removeNode';
import type { Schemes } from '../../types';

export function setupDeleteSelectedNodes(
  editor: NodeEditor<Schemes>
): () => void {
  const handler = async (e: KeyboardEvent) => {
    if (e.key !== 'Delete') return;
    const nodes = editor.getNodes().filter(node => node.selected);
    if (nodes.length === 0) return;
    await Promise.all(
      nodes.map(node => removeNodeWithConnections(editor, node.id))
    );
  };

  window.addEventListener('keydown', handler);
  return () => {
    window.removeEventListener('keydown', handler);
  };
}
