import { SerializableInputsNode } from "renderer/nodeEditor/types";
import { MultiLineControl } from "renderer/nodeEditor/nodes/Controls/input/MultiLine";

// 名称がわからないノードのときのノード
export class UnknownNode extends SerializableInputsNode<
  "Unknown",
  object,
  object,
  { view: MultiLineControl }
> {
  constructor(private message: string = "Unknown Node") {
    super("Unknown");
    this.addControl(
      "view",
      new MultiLineControl({
        value: this.message,
        editable: false,
      })
    );
  }

  data(): object {
    return {};
  }

  async execute(): Promise<void> {}

  serializeControlValue(): { data: { value: string } } {
    return { data: { value: this.controls.view.getValue() } };
  }

  deserializeControlValue(data: { value: string }): void {
    this.controls.view.setValue(data.value);
  }
}
