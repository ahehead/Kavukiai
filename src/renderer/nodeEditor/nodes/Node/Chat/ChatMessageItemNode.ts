import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import { MessageInputControl } from "../../Controls/OpenAI/MessageInput";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

export class ChatMessageItemNode extends BaseNode<
  "ChatMessageItem",
  object,
  { exec: TypedSocket; outMessage: TypedSocket },
  { input: MessageInputControl }
> {
  private lastMessage: ChatMessageItem | null = null;

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>,
    history: HistoryPlugin<Schemes>
  ) {
    super("ChatMessageItem");
    this.addOutputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "send",
      },
      { key: "outMessage", typeName: "ChatMessageItem" },
    ]);
    this.addControl(
      "input",
      new MessageInputControl({
        history,
        area: this.area,
        editable: true,
        onSend: (chatItem: ChatMessageItem) => {
          this.lastMessage = chatItem;
          this.controlflow.execute(this.id);
        },
      })
    );
  }

  data(): { outMessage: ChatMessageItem | null } {
    return { outMessage: this.lastMessage };
  }

  async execute(_: never, forward: (output: "exec") => void): Promise<void> {
    resetCacheDataflow(this.dataflow, this.id);
    await this.area.update("node", this.id);
    forward("exec");
  }
}
