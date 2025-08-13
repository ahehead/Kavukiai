import { ClassicPreset } from "rete";
import type { NodeControl } from "./NodeControl";
import type { TypedSocket } from "./TypedSocket";

export class TooltipInput<
  S extends TypedSocket
> extends ClassicPreset.Input<S> {
  tooltip?: string;
  require?: boolean;
  override control: NodeControl | null;

  constructor(
    socket: S,
    label?: string,
    multipleConnections?: boolean,
    tooltip?: string,
    require?: boolean
  ) {
    super(socket, label, multipleConnections);
    this.tooltip = tooltip;
    this.control = null;
    this.require = require;
  }

  setSocket(socket: S) {
    this.socket = socket;
  }

  getShowValue<T>(): T | null {
    if (!this.control || !this.showControl) return null;
    return this.control.getValue() as T;
  }
}
