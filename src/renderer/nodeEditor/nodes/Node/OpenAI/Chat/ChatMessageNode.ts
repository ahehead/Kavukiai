import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas/ChatMessageItem";
import type { Role } from "renderer/nodeEditor/types/Schemas/openai/InputSchemas";

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
      { key: "role", typeName: "Role", label: "role" },
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
  data(inputs: { text?: string[]; role?: Role[] }): {
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
