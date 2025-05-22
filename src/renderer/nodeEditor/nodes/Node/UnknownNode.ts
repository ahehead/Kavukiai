import { BaseNode } from "renderer/nodeEditor/types/BaseNode";

// 名称がわからないノードのときのノード
export class UnknownNode extends BaseNode<object, object, object> {
  constructor() {
    super("Unknown");
  }

  data(): object {
    return {};
  }

  async execute(): Promise<void> {}

  async fromJSON(json: Record<string, unknown>): Promise<void> {}
}
