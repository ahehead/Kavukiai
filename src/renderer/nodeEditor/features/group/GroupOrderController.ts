import type { AreaExtra } from "renderer/nodeEditor/types";
import type { BaseSchemes } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { Group } from "./Group";

type GroupTarget = Group | string;

export class GroupOrderController<Schemes extends BaseSchemes> {
  constructor(
    private readonly getGroups: () => Map<string, Group>,
    private readonly setGroups: (groups: Map<string, Group>) => void,
    private readonly getArea: () => AreaPlugin<Schemes, AreaExtra> | undefined
  ) {}

  public ensureGroupStacking(element: HTMLDivElement) {
    const area = this.requireArea();
    const target = this.findFirstNonGroupSibling(element);
    if (target) {
      void area.area.content.reorder(element, target);
    }
  }

  public bringGroupToFront(target: GroupTarget) {
    this.reorder(target, (id, order) => {
      const filtered = order.filter((currentId) => currentId !== id);
      filtered.push(id);
      return filtered;
    });
  }

  public bringGroupForward(target: GroupTarget) {
    this.reorder(target, (id, order) => {
      const index = order.indexOf(id);
      if (index === -1 || index === order.length - 1) return order;
      const next = [...order];
      const [item] = next.splice(index, 1);
      next.splice(index + 1, 0, item);
      return next;
    });
  }

  public sendGroupBackward(target: GroupTarget) {
    this.reorder(target, (id, order) => {
      const index = order.indexOf(id);
      if (index <= 0) return order;
      const next = [...order];
      const [item] = next.splice(index, 1);
      next.splice(index - 1, 0, item);
      return next;
    });
  }

  public sendGroupToBack(target: GroupTarget) {
    this.reorder(target, (id, order) => {
      const filtered = order.filter((currentId) => currentId !== id);
      filtered.unshift(id);
      return filtered;
    });
  }

  public applyOrder(order: string[]) {
    this.commit(order);
  }

  private reorder(
    target: GroupTarget,
    mutator: (id: string, order: string[]) => string[]
  ) {
    const groups = this.getGroups();
    const id = typeof target === "string" ? target : target.id;
    if (!groups.has(id)) return;
    const currentOrder = Array.from(groups.keys());
    const nextOrder = mutator(id, currentOrder);
    this.commit(nextOrder);
  }

  private commit(order: string[]) {
    const groups = this.getGroups();
    const currentOrder = Array.from(groups.keys());
    const finalOrder = this.normalizeOrder(order, currentOrder, groups);
    if (this.equals(currentOrder, finalOrder)) return;
    const newMap = new Map<string, Group>();
    for (const id of finalOrder) {
      const group = groups.get(id);
      if (group) newMap.set(id, group);
    }
    this.setGroups(newMap);
    this.reorderGroupElements(finalOrder);
  }

  private normalizeOrder(
    order: string[],
    currentOrder: string[],
    groups: Map<string, Group>
  ) {
    const seen = new Set<string>();
    const filtered: string[] = [];
    for (const id of order) {
      if (!groups.has(id) || seen.has(id)) continue;
      seen.add(id);
      filtered.push(id);
    }
    for (const id of currentOrder) {
      if (seen.has(id)) continue;
      seen.add(id);
      filtered.push(id);
    }
    return filtered;
  }

  private reorderGroupElements(order: string[]) {
    const area = this.requireArea();
    const reference = this.findFirstNonGroupSibling();
    let next: ChildNode | null = reference;
    for (let i = order.length - 1; i >= 0; i -= 1) {
      const id = order[i];
      if (!id) continue;
      const group = this.getGroups().get(id);
      const el = group?.element;
      if (!el) continue;
      void area.area.content.reorder(el, next);
      next = el;
    }
  }

  private findFirstNonGroupSibling(exclude?: HTMLElement): ChildNode | null {
    const area = this.requireArea();
    const holder = area.area.content.holder;
    for (const sibling of Array.from(holder.children)) {
      if (exclude && sibling === exclude) continue;
      if (!(sibling instanceof HTMLElement)) return sibling;
      if (sibling.getAttribute("data-rete-group") !== "true") return sibling;
    }
    return null;
  }

  private equals(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    return a.every((id, index) => id === b[index]);
  }

  private requireArea() {
    const area = this.getArea();
    if (!area) throw new Error("Group area is not initialized");
    return area;
  }
}
