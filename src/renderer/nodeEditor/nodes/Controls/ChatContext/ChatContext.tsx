import { useState, type JSX } from "react";
import type { ResponseInputImage } from "openai/resources/responses/responses.mjs";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";

type Role = "user" | "assistant" | "developer";
type Content = string | Array<ResponseInputImage>;
type ResponseData = { model: string; token?: number; finish_reason?: string };
type Message = { role: Role; content: Content; data: ResponseData };
export type ChatContext = Array<Message>;
export type OpenAIInput = ChatContext | string;

export interface ChatContextControlParams extends ControlOptions<ChatContext> {
  value: ChatContext;
}

// チャット入力用コントロール
export class ChatContextControl extends BaseControl<ChatContext, ChatContextControlParams> {
  chatContext: ChatContext;
  totalTokens = 0;

  constructor(
    options: ChatContextControlParams,
  ) {
    super();
    this.chatContext = options.value ?? [];
  }
  setValue(value: ChatContext): void {
    this.chatContext = value;
    this.opts.onChange?.(this.getContext());
  }
  setContext(context: ChatContext) {
    this.chatContext = context;
    this.opts.onChange?.(this.getContext());
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

