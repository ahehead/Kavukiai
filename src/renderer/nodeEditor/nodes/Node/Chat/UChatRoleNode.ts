import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import type { UChatRole } from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { SelectOption } from "../../Controls/input/Select";
import { SelectControl } from "../../Controls/input/Select";

// UChatRole選択ノード
export class UChatRoleNode
  extends SerializableInputsNode<
    "UChatRole",
    object,
    { out: TypedSocket },
    { select: SelectControl<UChatRole> }
  >
  implements SerializableDataNode
{
  constructor(
    initial: UChatRole,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("UChatRole");
    this.addOutputPort({
      key: "out",
      typeName: "UChatRole",
    });
    // UChatRoleは user/assistant/system のみ
    const optionsList: SelectOption<UChatRole>[] = [
      { label: "User", value: "user" },
      { label: "Assistant", value: "assistant" },
      { label: "System", value: "system" },
    ];
    this.addControl(
      "select",
      new SelectControl<UChatRole>({
        value: initial,
        optionsList,
        selectLabel: "UChatRole",
        editable: true,
        history,
        area,
        onChange: (_v: UChatRole) => {
          dataflow.reset(this.id);
        },
      })
    );
  }

  data(): { out: UChatRole } {
    return { out: this.controls.select.getValue() };
  }

  async execute(): Promise<void> {}

  serializeControlValue(): { data: { value: UChatRole } } {
    return {
      data: { value: this.controls.select.getValue() },
    };
  }

  deserializeControlValue(data: { value: UChatRole }): void {
    this.controls.select.setValue(data.value);
  }
}
