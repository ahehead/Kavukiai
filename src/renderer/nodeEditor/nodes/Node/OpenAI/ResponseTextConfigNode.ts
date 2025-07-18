import type { TypedSocket } from "renderer/nodeEditor/types";
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
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
