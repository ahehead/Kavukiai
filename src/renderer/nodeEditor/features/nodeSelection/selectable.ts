import type { Schemes } from "renderer/nodeEditor/types";
import { NodeEditor, type NodeId } from "rete";
import type { BaseArea, BaseAreaPlugin } from "rete-area-plugin";
import type { PressedType } from "./accumulateOnShift";

export type SelectorEntity = {
  label: string;
  id: string;
  unselect(): void;
  translate(dx: number, dy: number): void;
};

/**
 * Selector class. Used to collect selected entities (nodes, connections, etc.) and synchronize them (select, unselect, translate, etc.).
 * Can be extended to add custom functionality.
 */
export class Selector<E extends SelectorEntity> {
  entities = new Map<string, E>();
  pickId: string | null = null;

  isSelected(entity: Pick<E, "label" | "id">) {
    return this.entities.has(`${entity.label}_${entity.id}`);
  }

  add(entity: E, accumulate: boolean) {
    if (!accumulate) this.unselectAll();
    this.entities.set(`${entity.label}_${entity.id}`, entity);
  }

  remove(entity: Pick<E, "label" | "id">) {
    const id = `${entity.label}_${entity.id}`;
    const item = this.entities.get(id);

    if (item) {
      this.entities.delete(id);
      item.unselect();
    }
  }

  unselectAll() {
    [...Array.from(this.entities.values())].forEach((item) =>
      this.remove(item)
    );
  }

  translate(dx: number, dy: number) {
    this.entities.forEach(
      (item) => !this.isPicked(item) && item.translate(dx, dy)
    );
  }

  pick(entity: Pick<E, "label" | "id">) {
    this.pickId = `${entity.label}_${entity.id}`;
  }

  release() {
    this.pickId = null;
  }

  isPicked(entity: Pick<E, "label" | "id">) {
    return this.pickId === `${entity.label}_${entity.id}`;
  }
}

/**
 * Selector factory, uses default Selector class
 * @returns Selector instance
 */
export function selector<E extends SelectorEntity>() {
  return new Selector<E>();
}

/**
 * Accumulating interface, used to determine whether to accumulate entities on selection
 */
export type Accumulating = {
  active(): PressedType;
};

export type Selectable = ReturnType<typeof selector>;

/**
 * Selectable nodes extension. Adds the ability to select nodes in the area.
 * @param base BaseAreaPlugin instance
 * @param core Selectable instance
 * @param options.accumulating Accumulating interface
 * @listens nodepicked
 * @listens nodetranslated
 * @listens pointerdown
 * @listens pointermove
 * @listens pointerup
 */
export function selectableNodes<T>(
  base: BaseAreaPlugin<Schemes, T>,
  core: Selectable,
  options: { accumulating: Accumulating }
) {
  let editor: null | NodeEditor<Schemes> = null;
  const area = base as BaseAreaPlugin<Schemes, BaseArea<Schemes>>;
  const getEditor = () => {
    if (editor) {
      return editor;
    }
    editor = area.parentScope<NodeEditor<Schemes>>(NodeEditor);
    return editor;
  };

  let twitch: null | number = 0;

  function selectNode(node: Schemes["Node"]) {
    if (!node.selected) {
      node.selected = true;
      void area.update("node", node.id);
    }
  }

  function unselectNode(node: Schemes["Node"]) {
    if (node.selected) {
      node.selected = false;
      void area.update("node", node.id);
    }
  }
  /**
   * Select node programmatically
   * @param nodeId Node id
   * @param accumulate Whether to accumulate nodes on selection
   */
  function add(nodeId: NodeId, accumulate: boolean) {
    const node = getEditor().getNode(nodeId);

    if (!node) return;

    core.add(
      {
        label: "node",
        id: node.id,
        translate(dx, dy) {
          const view = area.nodeViews.get(node.id);
          const current = view?.position;

          if (current) {
            void view.translate(current.x + dx, current.y + dy);
          }
        },
        unselect() {
          unselectNode(node);
        },
      },
      accumulate
    );
    selectNode(node);
  }
  /**
   * Unselect node programmatically
   * @param nodeId Node id
   */
  function remove(nodeId: NodeId) {
    core.remove({ id: nodeId, label: "node" });
  }

  area.addPipe((context) => {
    if (!context || typeof context !== "object" || !("type" in context))
      return context;

    if (context.type === "nodepicked") {
      const pickedId = context.data.id;
      const accumulate = options.accumulating.active();
      // console.debug("Node picked", pickedId, accumulate);
      if (accumulate === "Add") {
        core.pick({ id: pickedId, label: "node" });
        add(pickedId, true);
      } else if (accumulate === "Toggle") {
        if (
          core.isPicked({ id: pickedId, label: "node" }) ||
          core.isSelected({ id: pickedId, label: "node" })
        ) {
          core.release();
          core.remove({ id: pickedId, label: "node" });
          const node = getEditor().getNode(pickedId);
          if (node) unselectNode(node);
        }
      } else if (accumulate === "None") {
        core.pick({ id: pickedId, label: "node" });
        add(pickedId, false);
      }
      twitch = null;
    } else if (context.type === "nodetranslated") {
      const { id, position, previous } = context.data;
      const dx = position.x - previous.x;
      const dy = position.y - previous.y;

      if (core.isPicked({ id, label: "node" })) core.translate(dx, dy);
    } else if (context.type === "pointerdown") {
      twitch = 0;
    } else if (context.type === "pointermove") {
      if (twitch !== null) twitch++;
    } else if (context.type === "pointerup") {
      // クリック以外は無視
      if (context.data.event.button !== 0) return context;
      // 右クリックメニューをクリックした場合は無視
      const element = context.data.event.target as HTMLElement;
      if (element.getAttribute("data-testid") === "context-menu-item")
        return context;

      if (twitch !== null && twitch < 4) {
        core.unselectAll();
      }
      twitch = null;
    }
    return context;
  });

  return {
    select: add,
    unselect: remove,
  };
}
