import { ClassicPreset } from "rete";
import type { NodeSocket } from "./NodeSocket";
import type { NodeControl, SerializableControl } from "./NodeControl";
import type { InputPortJson } from "shared/JsonType";
import type { AreaExtra, Schemes } from ".";
import type { AreaPlugin } from "rete-area-plugin";

export class TooltipInput<
  S extends ClassicPreset.Socket
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
}

export enum NodeStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

// ClassicPreset.Nodeを拡張 サイズとステータスを追加
export class BaseNode<
  Inputs extends {
    [key in string]?: NodeSocket;
  },
  Outputs extends {
    [key in string]?: NodeSocket;
  },
  Controls extends {
    [key in string]?: NodeControl;
  }
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  public width?: number;
  public height?: number;
  public status: NodeStatus;

  constructor(label: string, initialStatus: NodeStatus = NodeStatus.IDLE) {
    super(label);
    this.status = initialStatus;
  }

  setSize(width: number, height: number) {
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

  setStatus(area: AreaPlugin<Schemes, AreaExtra>, status: NodeStatus) {
    this.status = status;
    area.update("node", this.id);
  }

  getStatus(): NodeStatus {
    return this.status;
  }
}

// inputsをシリアライズできるように拡張したノードクラス
export class SerializableInputsNode<
  Inputs extends { [key in string]?: NodeSocket },
  Outputs extends { [key in string]?: NodeSocket },
  Controls extends { [key in string]?: NodeControl }
> extends BaseNode<Inputs, Outputs, Controls> {
  protected hasToJson = (c: unknown): c is SerializableControl =>
    typeof (c as SerializableControl | undefined)?.toJSON === "function";

  protected hasSetFromJson = (c: unknown): c is SerializableControl =>
    typeof (c as any).setFromJSON === "function";

  toInputsJson(): { inputs: Record<string, InputPortJson> } {
    const inputsJson: Record<string, InputPortJson> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (input) {
        inputsJson[key] = {
          isShowControl: input.showControl,
          ...(this.hasToJson(input.control) && {
            control: input.control.toJSON(),
          }),
        };
      }
    }
    return { inputs: inputsJson };
  }

  setFromInputsJson(inputsJson: Record<string, InputPortJson>): void {
    for (const [key, inputJson] of Object.entries(inputsJson)) {
      const input = this.inputs[key as keyof Inputs];
      if (input) {
        input.showControl = inputJson.isShowControl;
        if (
          inputJson.control &&
          input.control &&
          this.hasSetFromJson(input.control)
        ) {
          input.control.setFromJSON(inputJson.control);
        }
      }
    }
  }
}
