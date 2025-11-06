import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { SwitchControl } from "renderer/nodeEditor/nodes/Controls/input/Switch";
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";

import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";

// IF ノード
export class IFNode extends SerializableInputsNode<
  "IF",
  { exec: TypedSocket; boolData: TypedSocket },
  { exec: TypedSocket; exec2: TypedSocket },
  object
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super("IF");
    this.addInputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "In",
      },
      {
        key: "boolData",
        typeName: "boolean",
        label: "Condition",
        control: new SwitchControl({
          value: true,
          history,
          area,
          onChange: () => dataflow.reset(this.id),
        }),
      },
    ]);
    this.addOutputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "True",
      },
      {
        key: "exec2",
        typeName: "exec",
        label: "False",
      },
    ]);
  }

  data(): object {
    return {};
  }

  async execute(
    _: never,
    forward: (output: "exec" | "exec2") => void
  ): Promise<void> {
    let boolData = await this.dataflow.fetchInputSingle<boolean>(
      this.id,
      "boolData"
    );
    // inputにcontrolがあれば値を取得
    if (
      boolData === null &&
      this.inputs.boolData?.control &&
      this.inputs.boolData?.showControl
    ) {
      boolData = this.inputs.boolData.control.getValue();
    }
    // 真なら"exec"、偽またはnullなら"exec2"
    forward(boolData ? "exec" : "exec2");
  }
}
