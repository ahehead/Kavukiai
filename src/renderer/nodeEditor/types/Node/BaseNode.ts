import type { NodeControl } from "../NodeControl";
import type { TypedSocket } from "../Socket/TypedSocket";
import { NodeStatus, StatusNodeBase } from "./StatusNodeBase";

export abstract class BaseNode<
  L extends string,
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends StatusNodeBase<L, Inputs, Outputs, Controls> {
  declare readonly label: L;
  // Stable identifier for serialization/deserialization: "namespace:name"
  // Assigned by factory wrappers at creation time.
  typeId!: string;

  protected constructor(label: L, initialStatus: NodeStatus = NodeStatus.IDLE) {
    super(label, initialStatus);
  }

  data(
    _inputs: Record<string, any>
  ): Promise<Record<string, any>> | Record<string, any> {
    return {};
  }

  async execute(_input: any, _forward: (output: any) => void): Promise<void> {}
}

export { NodeStatus };
