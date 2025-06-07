import type { NodeControl } from "./NodeControl";
import type { SerializableControl } from "./BaseControl";
import type { InputPortJson } from "shared/JsonType";
import type { AreaExtra, Schemes, TypedSocket } from ".";
import type { AreaPlugin } from "rete-area-plugin";
import { NodeIO } from "./Node/NodeIO";

export enum NodeStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  WARNING = "WARNING",
}

export class BaseNode<
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends NodeIO<Inputs, Outputs, Controls> {
  public width?: number;
  public height?: number;
  public status: NodeStatus;

  constructor(label: string, initialStatus: NodeStatus = NodeStatus.IDLE) {
    super(label);
    this.status = initialStatus;
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

  async setStatus(area: AreaPlugin<Schemes, AreaExtra>, status: NodeStatus) {
    this.status = status;
    await area.update("node", this.id);
  }

  getStatus(): NodeStatus {
    return this.status;
  }
}

// inputsをシリアライズできるように拡張したノードクラス
export class SerializableInputsNode<
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends BaseNode<Inputs, Outputs, Controls> {
  toInputsJson(): { inputs: Record<string, InputPortJson> } {
    const inputsJson: Record<string, InputPortJson> = {};
    for (const [key, input] of Object.entries(this.inputs)) {
      if (!input) continue;
      const controlJson = input.control?.toJSON();
      inputsJson[key] = {
        isShowControl: input.showControl,
        ...(controlJson !== undefined ? { control: controlJson } : {}),
      };
    }
    return { inputs: inputsJson };
  }

  setFromInputsJson(inputsJson: Record<string, InputPortJson>): void {
    for (const [key, inputJson] of Object.entries(inputsJson)) {
      const input = this.inputs[key as keyof Inputs];
      if (!input) continue;
      input.showControl = inputJson.isShowControl;
      if (inputJson.control && input.control) {
        (input.control as unknown as SerializableControl).setFromJSON(
          inputJson.control
        );
      }
    }
  }
}

export interface ConnectNode {
  connected: () => void;
  disconnected: () => void;
}

export interface ObjectNode {
  updateOutputSchema: () => Promise<void>;
}

export function isObjectNode(node: any): node is ObjectNode {
  return typeof node.updateOutputSchema === "function";
}
