import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import type {
  ResponseFormatTextConfig,
  ResponseTextConfig,
} from "renderer/nodeEditor/types/Schemas/openai/RequestSchemas";

export class ResponseTextConfigNode extends BaseNode<
  { format: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("ResponseTextConfig");
    this.addInputPort({
      key: "format",
      typeName: "ResponseFormatTextConfig",
      label: "format",
    });
    this.addOutputPort({
      key: "out",
      typeName: "ResponseTextConfig",
    });
  }

  data(inputs: { format?: ResponseFormatTextConfig[] }): {
    out: ResponseTextConfig;
  } {
    const format = inputs.format?.[0];
    return { out: format ? { format } : {} } as { out: ResponseTextConfig };
  }

  async execute(): Promise<void> {}
}
