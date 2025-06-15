import type { DataflowEngine } from "rete-engine";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type {
  TypedSocket,
  Schemes,
  AreaExtra,
} from "renderer/nodeEditor/types";
import { SwitchControl } from "../../Controls/input/Switch";
import type { HistoryPlugin } from "rete-history-plugin";
import type { AreaPlugin } from "rete-area-plugin";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

// IF ノード
export class IFNode extends BaseNode<
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
          onChange: () => resetCacheDataflow(dataflow, this.id),
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
    const { boolData } = (await this.dataflow.fetchInputs(this.id)) as {
      boolData?: boolean[];
    };
    if (boolData?.[0]) {
      forward("exec");
      return;
    }
    forward("exec2");
  }
}
