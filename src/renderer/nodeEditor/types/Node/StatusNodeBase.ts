import type { NodeControl } from "../NodeControl";
import type { TypedSocket } from "../TypedSocket";
import { SizeNodeBase } from "./SizeNodeBase";

export enum NodeStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

// ステータス関連の機能のみを提供するベースクラス
export abstract class StatusNodeBase<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends SizeNodeBase<L, Inputs, Outputs, Controls> {
  declare readonly label: L;

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
}
