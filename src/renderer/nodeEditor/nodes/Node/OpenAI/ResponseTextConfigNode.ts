import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { AreaExtra, Schemes, TypedSocket } from "renderer/nodeEditor/types";
import {
  ResponseTextConfig,
  ResponseFormatTextConfig,
} from "renderer/nodeEditor/types/Schemas/RequestSchemas";

export class ResponseTextConfigNode extends BaseNode<
  { format: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor(area: AreaPlugin<Schemes, AreaExtra>, dataflow: DataflowEngine<Schemes>) {
    super("ResponseTextConfig");
    this.addInputPort({
      key: "format",
      name: "object",
      schema: ResponseFormatTextConfig,
      label: "format",
    });
    this.addOutputPort({ key: "out", name: "object", schema: ResponseTextConfig });
  }

  data(inputs: { format?: ResponseFormatTextConfig[] }): { out: ResponseTextConfig } {
    const format = inputs.format?.[0];
    return { out: format ? { format } : {} } as { out: ResponseTextConfig };
  }

  async execute(): Promise<void> {}
}
