import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { ResponseInputMessageControl } from "../../Controls/ChatContext/ResponseInput";
import type {
  AreaExtra,
  TypedSocket,
  Schemes,
} from "renderer/nodeEditor/types";
import {
  chatMessagesToResponseInput,
  ResponseInput,
} from "renderer/nodeEditor/types/Schemas/InputSchemas";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/InputSchemas";

// 長文文字列入力ノード
export class ChatContextNode extends BaseNode<
  object,
  { out: TypedSocket },
  { chatContext: ResponseInputMessageControl }
> {
  constructor(
    initial: ChatMessageItem[],
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
      new ResponseInputMessageControl({
        value: initial,
        editable: true,
        history: history,
        area: area,
        onChange: () => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  // dataflowで流す
  data(): { out: ResponseInput } {
    const messages = this.controls.chatContext.getValue();
    console.log("data", messages);
    return { out: chatMessagesToResponseInput(messages) };
  }

  async execute(): Promise<void> {}
}
