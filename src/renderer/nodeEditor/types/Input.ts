import { ClassicPreset } from "rete";
import type { TypedSocket } from "./TypedSocket";

export class TooltipInput<
  S extends TypedSocket
> extends ClassicPreset.Input<S> {
  tooltip?: string;

  constructor(
    socket: S,
    label?: string,
    multipleConnections?: boolean,
    tooltip?: string
  ) {
    super(socket, label, multipleConnections);
    this.tooltip = tooltip;
  }

  setSocket(socket: S) {
    this.socket = socket;
  }
}
