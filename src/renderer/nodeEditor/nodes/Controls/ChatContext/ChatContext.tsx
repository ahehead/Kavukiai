import { useState, type JSX } from "react";
import { ClassicPreset } from "rete";
import type { HistoryPlugin } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../../../types/Schemes";
import type { AreaPlugin } from "rete-area-plugin";
import type { ResponseInputImage } from "openai/resources/responses/responses.mjs";

type Role = "user" | "assistant" | "developer";
type Content = string | Array<ResponseInputImage>;
type ResponseData = { model: string; token?: number; finish_reason?: string };
type Message = { role: Role; content: Content; data: ResponseData };
export type ChatContext = Array<Message>;

// チャット入力用コントロール
export class ChatContextControl extends ClassicPreset.Control {
  chatContext: ChatContext;
  totalTokens = 0;
  editable: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: ChatContext) => void;

  constructor(
    initial: ChatContext,
    options?: {
      editable?: boolean;
      history?: HistoryPlugin<Schemes>;
      area?: AreaPlugin<Schemes, AreaExtra>;
      onChange?: (v: ChatContext) => void;
    }
  ) {
    super();
    this.chatContext = initial;
    this.editable = options?.editable ?? true;
    this.history = options?.history;
    this.area = options?.area;
    this.onChange = options?.onChange;
  }
  setContext(context: ChatContext) {
    this.chatContext = context;
    this.onChange?.(this.getContext());
  }
  setEditable(editable: boolean, isUpdate = false) {
    this.editable = editable;
    if (isUpdate && this.area) {
      this.area.update("control", this.id);
    }
  }
  getContext(): ChatContext {
    return this.chatContext;
  }

}


// カスタムコンポーネント
export function ChatContextControlView(props: {
  data: ChatContextControl;
}): JSX.Element {
  const control = props.data;
  const [value, setValue] = useState(control.getContext());
  return (
    <div>
      {value.map((message, index) => (
        <div key={index}>
          <strong>{message.role}</strong>: {typeof message.content === "string" ? message.content : "Image"}
        </div>
      ))}
    </div>
  )
}

