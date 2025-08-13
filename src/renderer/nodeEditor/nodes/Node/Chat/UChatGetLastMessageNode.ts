import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import {
  extractTextContent,
  type UChat,
} from "renderer/nodeEditor/types/Schemas/UChat/UChatMessage";

export class UChatGetLastMessageNode extends SerializableInputsNode<
  "UChatGetLastMessage",
  { list: TypedSocket; isAddRole: TypedSocket; roleString: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("UChatGetLastMessage");
    this.addInputPort([
      { key: "list", typeName: "UChat", label: "list" },
      { key: "isAddRole", typeName: "boolean", label: "add role" },
      { key: "roleString", typeName: "string", label: "role" },
    ]);
    this.addOutputPort({ key: "out", typeName: "string", label: "out" });
  }

  data(inputs?: {
    list?: UChat[];
    isAddRole?: boolean[];
    roleString?: string[];
  }): { out: string } {
    const list = inputs?.list?.[0] ?? [];
    const last = list[list.length - 1];
    if (!last) return { out: "" };
    const addRole = inputs?.isAddRole?.[0] ?? false;
    const roleLabel = inputs?.roleString?.[0] ?? last.role;
    const text = extractTextContent(last);
    const result = addRole ? `${roleLabel}\n${text}` : text;
    return { out: result };
  }

  async execute(): Promise<void> {}
}
