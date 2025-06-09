import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { ResponseInputControl } from "../../Controls/ChatContext/ResponseInput";
import type {
  AreaExtra,
  TypedSocket,
  Schemes,
} from "renderer/nodeEditor/types";
import { ResponseInput } from "renderer/nodeEditor/types/Schemas/InputSchemas";

// 長文文字列入力ノード
export class ChatContextNode extends BaseNode<
  object,
  { out: TypedSocket },
  { chatContext: ResponseInputControl }
> {
  constructor(
    initial: ResponseInput,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("ChatContext");
    this.addOutputPort({
      key: "out",
      name: "ResponseInput",
      schema: ResponseInput,
    });
    this.addControl(
      "chatContext",
      new ResponseInputControl({
        value: initial,
        editable: true,
        history: history,
        area: area,
        onChange: (v: ResponseInput) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  // dataflowで流す
  data(): { out: ResponseInput } {
    console.log("data", this.controls.chatContext.getValue());
    return { out: this.controls.chatContext.getValue() || [] };
  }

  async execute(): Promise<void> {}
}
