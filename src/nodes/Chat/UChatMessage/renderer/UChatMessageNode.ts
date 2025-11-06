import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import type {
  UChatMessage,
  UChatRole,
  UPartArray,
} from "@nodes/Chat/common/schema/UChatMessage";

// UChatMessageを組み立てるノード
export class UChatMessageNode extends SerializableInputsNode<
  "UChatMessage",
  { role: TypedSocket; list: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("UChatMessage");
    this.addInputPort([
      { key: "role", typeName: "UChatRole", label: "role" },
      { key: "list", typeName: "UPartArray", label: "parts" },
    ]);
    this.addOutputPort({
      key: "out",
      typeName: "UChatMessage",
      label: "message",
    });
  }

  data(inputs: { role?: UChatRole[]; list?: UPartArray[] }): {
    out: UChatMessage;
  } {
    const role = inputs.role?.[0] ?? "user";
    const content = inputs.list?.[0] ?? [];
    return { out: { role, content } };
  }
}

