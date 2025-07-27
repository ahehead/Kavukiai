import type { TypedSocket } from "renderer/nodeEditor/types";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import {
  type ChatMessageItem,
  chatMessageToString,
} from "renderer/nodeEditor/types/Schemas/ChatMessageItem";

export class GetLastMessageNode extends BaseNode<
  "GetLastMessage",
  { list: TypedSocket; isAddRole: TypedSocket; roleString: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("GetLastMessage");
    this.addInputPort([
      { key: "list", typeName: "ChatMessageItemList", label: "list" },
      { key: "isAddRole", typeName: "boolean", label: "add role" },
      { key: "roleString", typeName: "string", label: "role" },
    ]);
    this.addOutputPort({ key: "out", typeName: "string", label: "out" });
  }

  data(inputs?: {
    list?: ChatMessageItem[][];
    isAddRole?: boolean[];
    roleString?: string[];
  }): { out: string } {
    const list = inputs?.list?.[0] ?? [];
    const last = list[list.length - 1];
    if (!last) return { out: "" };
    const addRole = inputs?.isAddRole?.[0] ?? false;
    const roleLabel = inputs?.roleString?.[0] ?? last.role;
    const text = chatMessageToString(last);
    const result = addRole ? `${roleLabel}\n${text}` : text;
    return { out: result };
  }

  async execute(): Promise<void> {}
}
