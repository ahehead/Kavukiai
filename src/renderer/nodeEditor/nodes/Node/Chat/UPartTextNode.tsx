import type { DataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/dataflowEngin";
import { InputValueControl } from "renderer/nodeEditor/nodes/Controls/input/InputValue";
import type { AreaExtra, Schemes, TypedSocket } from "renderer/nodeEditor/types";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { UPart } from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";

// 文字列からUPart(text)を作るノード
export class UPartTextNode extends SerializableInputsNode<
  "UPartText",
  { text: TypedSocket },
  { out: TypedSocket },
  object
> {
  private textControl: InputValueControl<string>;

  constructor(
    initial = "",
    history?: HistoryPlugin<Schemes>,
    area?: AreaPlugin<Schemes, AreaExtra>,
    private dataflow?: DataflowEngine<Schemes>
  ) {
    super("UPartText");
    this.textControl = new InputValueControl<string>({
      value: initial,
      type: "string",
      history,
      area,
      onChange: () => this.dataflow?.reset(this.id),
    });
    this.addInputPort({
      key: "text",
      typeName: "string",
      label: "text",
      control: this.textControl,
      showControl: true,
    });
    this.addOutputPort({ key: "out", typeName: "UPart", label: "out" });
  }

  data(inputs: { text?: string[] }): { out: UPart } {
    const text = inputs.text?.[0] ?? this.textControl.getValue() ?? "";
    return { out: { type: "text", text } };
  }

  async execute(): Promise<void> {}
}

