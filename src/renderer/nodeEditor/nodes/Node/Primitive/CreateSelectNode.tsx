import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import { SelectControl } from "../../Controls/input/Select";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import type { AreaExtra, TypedSocket, Schemes } from "renderer/nodeEditor/types";
import { Type } from "@sinclair/typebox";

export class CreateSelectNode extends SerializableInputsNode<
  { exec: TypedSocket; list: TypedSocket },
  { exec: TypedSocket; out: TypedSocket },
  { select: SelectControl<string> }
> {
  private options: string[] = [];

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("CreateSelect");

    this.addInputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "In",
        onClick: () => this.controlflow.execute(this.id, "exec"),
      },
      {
        key: "list",
        typeName: "array",
        label: "List",
        schema: Type.Array(Type.String()),
      },
    ]);

    this.addOutputPort([
      { key: "exec", typeName: "exec", label: "Out" },
      { key: "out", typeName: "string", label: "Selected" },
    ]);

    this.addControl(
      "select",
      new SelectControl<string>({
        value: "",
        optionsList: [],
        label: "select",
        editable: true,
      })
    );
  }

  data(): { out: string } {
    return { out: this.controls.select.getValue() };
  }

  async execute(_: "exec", forward: (output: "exec") => void): Promise<void> {
    const { list } = (await this.dataflow.fetchInputs(this.id)) as {
      list?: string[][];
    };
    const options = list?.[0] || [];
    this.options = options;
    this.controls.select.options = options.map((v) => ({ label: v, value: v }));
    if (!options.includes(this.controls.select.getValue())) {
      this.controls.select.setValue(options[0] ?? "");
    }
    resetCacheDataflow(this.dataflow, this.id);
    await this.area.update("node", this.id);
    forward("exec");
  }

  serializeControlValue(): { data: { value: string; options: string[] } } {
    return {
      data: {
        value: this.controls.select.getValue(),
        options: this.options,
      },
    };
  }

  deserializeControlValue(data: { value: string; options: string[] }): void {
    this.options = data.options;
    this.controls.select.options = data.options.map((v) => ({ label: v, value: v }));
    this.controls.select.setValue(data.value);
  }
}
