import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type {
  UChat,
  UChatMessage,
} from "@nodes/Chat/common/schema/UChatMessage";

export class ReverseRoleNode extends SerializableInputsNode<
  "ReverseRole",
  { list: TypedSocket },
  { list: TypedSocket },
  object
> {
  constructor() {
    super("ReverseRole");
    this.addInputPort({ key: "list", typeName: "UChat", label: "list" });
    this.addOutputPort({ key: "list", typeName: "UChat", label: "list" });
  }

  data(inputs?: { list?: UChat[] }): { list: UChat } {
    const messages = inputs?.list?.[0] ?? [];
    const out = messages.map((m) => {
      if (m.role === "user") return { ...m, role: "assistant" } as UChatMessage;
      if (m.role === "assistant") return { ...m, role: "user" } as UChatMessage;
      return m;
    });
    return { list: out };
  }
}

