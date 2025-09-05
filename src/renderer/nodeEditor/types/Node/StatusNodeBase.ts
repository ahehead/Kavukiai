import { useSyncExternalStore } from "react";
import type { AreaPlugin } from "rete-area-plugin";
import type { NodeControl } from "../NodeControl";
import type { AreaExtra, Schemes } from "../Schemes";
import type { TypedSocket } from "../Socket/TypedSocket";
import { SizeNodeBase } from "./SizeNodeBase";

export enum NodeStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  WARNING = "WARNING",
}
type Listener = () => void;

// ステータス関連の機能のみを提供するベースクラス
export abstract class StatusNodeBase<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends SizeNodeBase<L, Inputs, Outputs, Controls> {
  declare readonly label: L;

  private listeners = new Set<Listener>();

  private _status: NodeStatus = NodeStatus.IDLE;

  protected constructor(label: L, initialStatus: NodeStatus = NodeStatus.IDLE) {
    super(label);
    this._status = initialStatus;
  }

  setStatus(status: NodeStatus) {
    this._status = status;
  }

  set status(status: NodeStatus) {
    this._status = status;
  }

  get status(): NodeStatus {
    return this._status;
  }

  async changeStatus(
    _area: AreaPlugin<Schemes, AreaExtra>,
    status: NodeStatus
  ) {
    this.setStatus(status);
    this.notify();
  }

  getSelected() {
    return this.selected;
  }

  notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l); // unsubscribe
  }
}

export function useStatusValue(
  node: StatusNodeBase<any, any, any, any>
): NodeStatus {
  return useSyncExternalStore<NodeStatus>(
    (cb) => node.subscribe(cb),
    () => node.status
  );
}

export function useSelectedValue(
  node: StatusNodeBase<any, any, any, any>
): boolean {
  return useSyncExternalStore<boolean>(
    (cb) => node.subscribe(cb),
    () => node.getSelected() || false
  );
}
