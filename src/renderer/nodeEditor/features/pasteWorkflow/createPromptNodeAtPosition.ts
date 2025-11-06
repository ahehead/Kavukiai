import type { MultiLineStringNode } from "nodes/Primitive/String/MultiLineString/renderer/MultiLineStringNode";
import { screenToWorld } from "../../nodes/util/screenToWorld";
import { getFactoryByTypeId } from "../nodeFactory/factoryRegistry";
import type { NodeDeps } from "../nodeFactory/factoryTypes";

export type CreatePromptNodeAtPositionArgs = {
  content: string;
  pointerPosition: { x: number; y: number };
  nodeDeps: NodeDeps;
};

export async function createPromptNodeAtPosition({
  content,
  pointerPosition,
  nodeDeps,
}: CreatePromptNodeAtPositionArgs): Promise<MultiLineStringNode | undefined> {
  const multiLineFactory = getFactoryByTypeId("core:MultiLineString");

  if (!multiLineFactory) {
    console.warn("MultiLineString node factory not found");
    return;
  }

  const node = multiLineFactory(nodeDeps) as MultiLineStringNode;
  const { editor, area } = nodeDeps;

  await editor.addNode(node);

  const worldPosition = screenToWorld(
    area,
    pointerPosition.x,
    pointerPosition.y
  );
  await area.translate(node.id, worldPosition);

  const textAreaControl = node.controls.textArea;
  textAreaControl?.setValue(content);

  return node;
}
