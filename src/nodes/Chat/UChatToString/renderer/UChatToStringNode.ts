import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";

import {
  extractTextContent,
  type UChat,
} from "@nodes/Chat/common/schema/UChatMessage";

export class UChatToStringNode extends SerializableInputsNode<
  "UChatToString",
  {
    list: TypedSocket;
    isAddRole: TypedSocket;
    userString: TypedSocket;
    assistantString: TypedSocket;
  },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("UChatToString");
    this.addInputPort([
      { key: "list", typeName: "UChat", label: "list" },
      { key: "isAddRole", typeName: "boolean", label: "add role" },
      { key: "userString", typeName: "string", label: "user" },
      { key: "assistantString", typeName: "string", label: "assistant" },
    ]);
    this.addOutputPort({ key: "out", typeName: "string", label: "out" });
  }

  data(inputs?: {
    list?: UChat[];
    isAddRole?: boolean[];
    userString?: string[];
    assistantString?: string[];
  }): { out: string } {
    const messages = inputs?.list?.[0] ?? [];
    const addRole = inputs?.isAddRole?.[0] ?? false;
    const userLabel = inputs?.userString?.[0] ?? "User";
    const assistantLabel = inputs?.assistantString?.[0] ?? "Assistant";
    let result = "";
    for (const msg of messages) {
      const text = extractTextContent(msg);
      const role =
        msg.role === "user"
          ? userLabel
          : msg.role === "assistant"
          ? assistantLabel
          : msg.role;
      result += addRole ? `${role}\n${text}\n\n` : `${text}\n\n`;
    }
    return { out: result.trimEnd() };
  }
}

