import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";

export function setupNodeZOrder(area: AreaPlugin<Schemes, AreaExtra>) {
  // コネクションよりノードを前に表示
  area.addPipe((context) => {
    if (context.type === "nodecreated") {
      const nodeView = area.nodeViews.get(context.data.id);
      nodeView?.element.classList.add("z-node");
    }
    return context;
  });
  area.addPipe((context) => {
    if (context.type === "nodepicked") {
      const nodeViewElement = area.nodeViews.get(context.data.id)?.element;
      const parentElement = nodeViewElement?.parentElement;
      if (parentElement) {
        parentElement.appendChild(nodeViewElement);
      }
    }
    return context;
  });
}
