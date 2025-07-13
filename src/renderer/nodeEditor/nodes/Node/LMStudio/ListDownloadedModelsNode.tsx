import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { electronApiService } from "renderer/features/services/appService";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { AreaExtra, TypedSocket, Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

export class ListDownloadedModelsNode extends SerializableInputsNode<
  { exec: TypedSocket },
  { exec: TypedSocket; list: TypedSocket },
  object
> {
  private models: unknown[] = [];

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super("ListDownloadedModels");
    this.addInputPort({ key: "exec", typeName: "exec", label: "In" });
    this.addOutputPort([
      { key: "exec", typeName: "exec", label: "Out" },
      { key: "list", typeName: "array", label: "list" },
    ]);
  }

  data(): { list: unknown[] } {
    return { list: this.models };
  }

  async execute(_input: "exec", forward: (output: "exec") => void): Promise<void> {
    await this.setStatus(this.area, NodeStatus.RUNNING);
    const result = await electronApiService.listDownloadedModels();
    if (result.status === "success") {
      this.models = result.data;
      resetCacheDataflow(this.dataflow, this.id);
      await this.setStatus(this.area, NodeStatus.COMPLETED);
    } else {
      this.models = [];
      await this.setStatus(this.area, NodeStatus.ERROR);
    }
    await this.area.update("node", this.id);
    forward("exec");
  }

  serializeControlValue(): { data: { list: unknown[] } } {
    return { data: { list: this.models } };
  }

  deserializeControlValue(data: { list: unknown[] }): void {
    this.models = data.list;
  }
}
