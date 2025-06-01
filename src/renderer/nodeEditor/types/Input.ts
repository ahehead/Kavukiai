import { ClassicPreset } from "rete";
import type { TypedSocket } from "./TypedSocket";
import type { NodeControl } from ".";

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
}
