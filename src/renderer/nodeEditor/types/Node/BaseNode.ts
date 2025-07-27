import type { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, Schemes, TypedSocket } from "..";
import type { NodeControl } from "../NodeControl";
import { NodeIO } from "./NodeIO";

export enum NodeStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

export abstract class BaseNode<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends NodeIO<Inputs, Outputs, Controls> {
  public width?: number;
  public height?: number;
  private _status: NodeStatus;

  declare readonly label: L;

  protected constructor(label: L, initialStatus: NodeStatus = NodeStatus.IDLE) {
    super(label);
    this._status = initialStatus;
  }

  addControlByKey<K extends keyof Controls>({
    key,
    control,
  }: {
    key: K;
    control: Controls[K];
  }): void {
    this.addControl(key, control);
  }

  setSize(width?: number, height?: number) {
    this.width = width;
    this.height = height;
  }

  getSize(): { width: number | undefined; height: number | undefined } {
    return { width: this.width, height: this.height };
  }

  clearSize() {
    this.width = undefined;
    this.height = undefined;
  }

  clearHeight() {
    this.height = undefined;
  }

  setStatus(status: NodeStatus) {
    this._status = status;
  }

  async changeStatus(area: AreaPlugin<Schemes, AreaExtra>, status: NodeStatus) {
    this._status = status;
    await area.update("node", this.id);
  }

  get status(): NodeStatus {
    return this._status;
  }
}
