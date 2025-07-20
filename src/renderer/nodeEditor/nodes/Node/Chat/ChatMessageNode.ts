import type { TypedSocket } from "renderer/nodeEditor/types";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/ChatMessageItem";

/**
 * ChatMessageNode
 *
 * Inputs:
 *  - text: string content
 *  - role: "user" | "assistant"
 * Output:
 *  - message: ChatMessageItem
 */
export class ChatMessageNode extends SerializableInputsNode<
  "ChatMessage",
  { role: TypedSocket; text: TypedSocket },
  { message: TypedSocket },
  object
> {
  constructor() {
    super("ChatMessage");
    // inputs: text and role
    this.addInputPort([
      { key: "role", typeName: "string", label: "role" },
      { key: "text", typeName: "string", label: "text" },
    ]);
    // output: message
    this.addOutputPort({
      key: "message",
      typeName: "ChatMessageItem",
      label: "message",
    });
  }

  /** Build and return ChatMessageItem from inputs */
  data(inputs: { text?: string[]; role?: string[] }): {
    message: ChatMessageItem;
  } {
    const content = inputs.text?.[0] ?? "";
    const roleValue = (inputs.role?.[0] as "user" | "assistant") || "user";
    const message: ChatMessageItem = {
      role: roleValue,
      content: [{ text: content, type: "input_text" }],
      type: "message",
    };
    return { message };
  }

  // no execution logic needed
  async execute(): Promise<void> {}
}
