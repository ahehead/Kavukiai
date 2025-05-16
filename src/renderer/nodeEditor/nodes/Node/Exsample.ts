import { ClassicPreset } from "rete";
import type { ControlFlowEngine } from "rete-engine";
import { BaseNode, type CustomSocketType, type Schemes } from "../../types";
import { createSocket } from "../Sockets";
import { RunButtonControl } from "../Controls/RunButton";
const { Output, Input } = ClassicPreset;

// Run ノード
export class ExsampleNode extends BaseNode<
  { exec: CustomSocketType },
  { exec: CustomSocketType },
  { btn: RunButtonControl }
> {
  constructor(private engine: ControlFlowEngine<Schemes>) {
    super("Exsample");
    this.addInput("exec", new Input(createSocket("exec"), undefined, true));
    this.addOutput("exec", new Output(createSocket("exec"), undefined, true));
    this.addControl(
      "btn",
      new RunButtonControl(
        "Run",
        async (e: React.MouseEvent<HTMLButtonElement>) => {
          this.engine.execute(this.id);
          e.stopPropagation();
        }
      )
    );
  }

  data(): object {
    return {};
  }

  async execute(_: never, forward: (output: "exec") => void): Promise<void> {
    forward("exec");
  }
}
