import { ClassicPreset } from "rete";
import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import { resetCacheDataflow } from "../util/resetCacheDataflow";
import {
  type ChatContext,
  ChatContextControl,
} from "../Controls/ChatContext/ChatContext";
import {
  type AreaExtra,
  createSocket,
  type TypedSocket,
  type Schemes,
} from "renderer/nodeEditor/types";
const { Output } = ClassicPreset;

// 長文文字列入力ノード
export class ChatContextNode extends BaseNode<
  object,
  { out: TypedSocket },
  { chatContext: ChatContextControl }
> {
  constructor(
    initial: ChatContext,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("ChatContext");
    this.addOutput("out", new Output(createSocket("chatContext"), undefined));
    this.addControl(
      "chatContext",
      new ChatContextControl({
        value: initial,
        editable: true,
        history: history,
        area: area,
        onChange: (v: ChatContext) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  // dataflowで流す
  data(): { out: ChatContext } {
    console.log("data", this.controls.chatContext.getContext());
    return { out: this.controls.chatContext.getContext() || [] };
  }

  async execute(): Promise<void> {}
}
