import type { AreaPlugin } from "rete-area-plugin";
import type { NodeControl } from "../NodeControl";
import type { AreaExtra, Schemes } from "../Schemes";
import type { TypedSocket } from "../TypedSocket";
import { NodeStatus, StatusNodeBase } from "./StatusNodeBase";

export abstract class BaseNode<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends StatusNodeBase<L, Inputs, Outputs, Controls> {
  declare readonly label: L;

  protected constructor(label: L, initialStatus: NodeStatus = NodeStatus.IDLE) {
    super(label, initialStatus);
  }

  async changeStatus(area: AreaPlugin<Schemes, AreaExtra>, status: NodeStatus) {
    this.setStatus(status);
    await area.update("node", this.id);
  }
}

export { NodeStatus };
