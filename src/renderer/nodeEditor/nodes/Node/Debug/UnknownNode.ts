import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import { MultiLineControl } from "../../Controls/input/MultiLine";

// 名称がわからないノードのときのノード
export class UnknownNode extends BaseNode<
  "Unknown",
  object,
  object,
  { view: MultiLineControl }
> {
  constructor(private message: string = "Unknown Node") {
    super("Unknown");
    this.addControlByKey({
      key: "view",
      control: new MultiLineControl({
        value: this.message,
        editable: false,
      }),
    });
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
