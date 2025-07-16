import { BaseNode, NodeStatus } from "renderer/nodeEditor/types/Node/BaseNode";
import type { AreaExtra, Schemes, TypedSocket } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import { ConsoleControl } from "../../Controls/Console";
import { electronApiService } from "renderer/features/services/appService";

export class LMStudioStopNode extends BaseNode<
  { exec: TypedSocket },
  { exec: TypedSocket },
  { console: ConsoleControl }
> {
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("LMStudioStop");
    this.addInputPort({
      key: "exec",
      typeName: "exec",
      label: "In",
      onClick: () => this.controlflow.execute(this.id, "exec"),
    });
    this.addOutputPort({ key: "exec", typeName: "exec", label: "Out" });
    this.addControl("console", new ConsoleControl({ isOpen: true }));
  }

  data(): object {
    return {};
  }

  async execute(_input: "exec", forward: (output: "exec") => void): Promise<void> {
    if (this.status === NodeStatus.RUNNING) {
      return;
    }
    await this.setStatus(this.area, NodeStatus.RUNNING);
    const result = await electronApiService.stopServer();
    if (result.status === "success") {
      this.controls.console.addValue(result.data);
      await this.setStatus(this.area, NodeStatus.COMPLETED);
    } else {
      this.controls.console.addValue(`Error: ${result.message}`);
      await this.setStatus(this.area, NodeStatus.ERROR);
    }
    await this.area.update("node", this.id);
    forward("exec");
  }

  serializeControlValue() {
    return this.controls.console.toJSON();
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data });
  }
}
