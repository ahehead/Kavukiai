import { notify } from "renderer/features/toast-notice/notify";
import type { GroupPlugin } from "renderer/nodeEditor/features/group";
import type { NodeDeps } from "renderer/nodeEditor/features/nodeFactory/factoryTypes";
import { pasteWorkflowAtPosition } from "renderer/nodeEditor/features/pasteWorkflow/pasteWorkflow";
import { buildGraphJsonForCopy } from "renderer/nodeEditor/features/serializeGraph/serializeGraph";
import { getSelectedNodes } from "renderer/nodeEditor/nodes/util/getSelectedNodes";
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { GraphJsonData } from "shared/JsonType";
import { parseGraphJson } from "shared/JsonType";
import type { AreaExtra, Schemes } from "../../types";

type ActiveEditor = "rete" | "text";

type Options = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  nodeDeps: NodeDeps;
  groupPlugin: GroupPlugin<Schemes>;
};

export type ClipboardShortcutAPI = {
  cleanup: () => void;
  setActiveEditor: (mode: ActiveEditor) => void;
};

export function setupClipboardShortcuts({
  editor,
  area,
  nodeDeps,
  groupPlugin,
}: Options): ClipboardShortcutAPI {
  let activeEditor: ActiveEditor = "rete";

  const setActiveEditor = (mode: ActiveEditor) => {
    activeEditor = mode;
  };

  const handler = async (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.repeat) return;
    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key !== "c" && key !== "v") return;

    if (isTextInputTarget(event.target)) {
      setActiveEditor("text");
      return;
    }

    if (activeEditor !== "rete") {
      setActiveEditor("rete");
    }

    if (key === "c") {
      const handled = await copySelectedNodesToClipboard(editor, area);
      if (handled) {
        event.preventDefault();
      }
      return;
    }

    if (key === "v") {
      event.preventDefault();
      await pasteClipboardWorkflowAtPointer(area, nodeDeps, groupPlugin);
    }
  };

  window.addEventListener("keydown", handler);

  return {
    cleanup: () => {
      window.removeEventListener("keydown", handler);
    },
    setActiveEditor,
  };
}

function isTextInputTarget(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable ||
    target.closest("[data-monaco-editor]") !== null
  );
}

async function copySelectedNodesToClipboard(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>
): Promise<boolean> {
  const selectedNodes = getSelectedNodes(editor);
  if (selectedNodes.length === 0) {
    return false;
  }

  const jsonData = buildGraphJsonForCopy(editor, area, selectedNodes);

  try {
    await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    notify("success", "Nodes copied to clipboard");
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    notify("error", "Failed to copy to clipboard");
    return false;
  }
}

async function pasteClipboardWorkflowAtPointer(
  area: AreaPlugin<Schemes, AreaExtra>,
  nodeDeps: NodeDeps,
  groupPlugin: GroupPlugin<Schemes>
) {
  const workflow = await readClipboardAsWorkflow();
  if (!workflow) return;

  await pasteWorkflowAtPosition({
    workflow,
    pointerPosition: area.area.pointer,
    nodeDeps,
    groupPlugin,
  });
}

async function readClipboardAsWorkflow(): Promise<GraphJsonData | null> {
  try {
    const clipboardData = await navigator.clipboard.readText();
    return parseGraphJson(JSON.parse(clipboardData));
  } catch (error) {
    console.warn("Failed to read/parse clipboard as GraphJsonData", error);
    notify("error", "Failed to read/parse clipboard as GraphJsonData");
    return null;
  }
}
