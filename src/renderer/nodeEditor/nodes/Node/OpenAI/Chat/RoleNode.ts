import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import {
  SelectControl,
  type SelectOption,
} from "renderer/nodeEditor/nodes/Controls/input/Select";
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";

import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import type { Role } from "renderer/nodeEditor/types/Schemas/openai/InputSchemas";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";

// Role選択ノード
export class RoleNode
  extends SerializableInputsNode<
    "Role",
    object,
    { out: TypedSocket },
    { select: SelectControl<Role> }
  >
  implements SerializableDataNode
{
  constructor(
    initial: Role,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("Role");
    this.addOutputPort({
      key: "out",
      typeName: "Role",
    });
    const optionsList: SelectOption<Role>[] = [
      { label: "User", value: "user" },
      { label: "Assistant", value: "assistant" },
      { label: "System", value: "system" },
      { label: "Developer", value: "developer" },
    ];
    this.addControl(
      "select",
      new SelectControl<Role>({
        value: initial,
        optionsList,
        selectLabel: "Role",
        editable: true,
        history,
        area,
        onChange: (_v: Role) => {
          dataflow.reset(this.id);
        },
      })
    );
  }

  data(): { out: Role } {
    return { out: this.controls.select.getValue() };
  }

  async execute(): Promise<void> {}

  serializeControlValue(): { data: { value: Role } } {
    return {
      data: { value: this.controls.select.getValue() },
    };
  }

  deserializeControlValue(data: { value: Role }): void {
    this.controls.select.setValue(data.value);
  }
}
