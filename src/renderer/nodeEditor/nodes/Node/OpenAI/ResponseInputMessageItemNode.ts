import type { ControlFlowEngine } from "rete-engine";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaExtra, Schemes, TypedSocket } from "renderer/nodeEditor/types";
import { Type } from "@sinclair/typebox";
import { MessageInputControl } from "../../Controls/OpenAI/MessageInput";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/InputSchemas";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

export class ResponseInputMessageItemNode extends BaseNode<
  {},
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
    super("ResponseInputMessageItem");
    this.addOutputPort([
      { key: "exec", name: "exec", schema: Type.Literal("exec"), label: "send" },
      { key: "outMessage", name: "ChatMessageItem", schema: ChatMessageItem },
    ]);
    this.addControl(
      "input",
      new MessageInputControl({
        onSend: () => this.controlflow.execute(this.id),
        history,
        area: this.area,
        editable: true,
        onChange: () => resetCacheDataflow(this.dataflow, this.id),
      })
    );
  }

  data(): { outMessage: ChatMessageItem | null } {
    return { outMessage: this.lastMessage };
  }

  async execute(_: never, forward: (output: "exec") => void): Promise<void> {
    this.lastMessage = this.controls.input.getValue();
    resetCacheDataflow(this.dataflow, this.id);
    await this.area.update("node", this.id);
    forward("exec");
  }
}
