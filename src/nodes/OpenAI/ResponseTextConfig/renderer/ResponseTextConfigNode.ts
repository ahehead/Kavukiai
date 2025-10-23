import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";

import type {
  ResponseFormatTextConfig,
  ResponseTextConfig,
} from "@nodes/OpenAI/common/schema/RequestSchemas";

export class ResponseTextConfigNode extends SerializableInputsNode<
  "ResponseTextConfig",
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
    return { out: format ? { format } : {} };
  }

  async execute(): Promise<void> {}
}

