import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { electronApiService } from "renderer/features/services/appService";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine, DataflowEngine } from "rete-engine";
import type { AreaExtra, TypedSocket, Schemes } from "renderer/nodeEditor/types";
import { NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { ConsoleControl } from "../../Controls/Console";
import type { ModelInfo } from "@lmstudio/sdk";

export class ListDownloadedModelsNode extends SerializableInputsNode<
  { exec: TypedSocket },
  { exec: TypedSocket; list: TypedSocket },
  { console: ConsoleControl }
> {
  private models: ModelInfo[] = [];

  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("ListDownloadedModels");
    this.addInputPort({
      key: "exec",
      typeName: "exec",
      label: "In",
      onClick: () => this.controlflow.execute(this.id, "exec")
    });
    this.addOutputPort([
      { key: "exec", typeName: "exec", label: "Out" },
      { key: "list", typeName: "ModelInfoArray", label: "ModelInfo" },
    ]);
    this.addControl("console", new ConsoleControl({ isOpen: true }));
  }

  data(): { list: ModelInfo[] } {
    return { list: this.models };
  }

  async execute(_input: "exec", forward: (output: "exec") => void): Promise<void> {
    if (this.status === NodeStatus.RUNNING) {
      return; // Prevent re-execution if already running
    }
    await this.setStatus(this.area, NodeStatus.RUNNING);
    const result = await electronApiService.listDownloadedModels();
    if (result.status === "success") {
      this.models = result.data;
      resetCacheDataflow(this.dataflow, this.id);
      this.controls.console.addValue(`Downloaded models: ${this.models}`);
      await this.setStatus(this.area, NodeStatus.COMPLETED);
    } else {
      this.models = [];
      this.controls.console.addValue(`Error: ${result.message}`);
      await this.setStatus(this.area, NodeStatus.ERROR);
    }
    await this.area.update("node", this.id);
    forward("exec");
  }

  serializeControlValue(): { data: { list: ModelInfo[] } } {
    return { data: { list: this.models } };
  }

  deserializeControlValue(data: { list: ModelInfo[] }): void {
    this.models = data.list;
  }
}
