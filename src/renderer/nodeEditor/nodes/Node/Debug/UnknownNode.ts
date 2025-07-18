import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";

// 名称がわからないノードのときのノード
export class UnknownNode extends BaseNode<"Unknown", object, object, object> {
  constructor() {
    super("Unknown");
  }

  data(): object {
    return {};
  }

  async execute(): Promise<void> {}

  async fromJSON(): Promise<void> {}
}
