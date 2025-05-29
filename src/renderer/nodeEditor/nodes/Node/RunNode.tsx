import { ClassicPreset } from 'rete';
import type { ControlFlowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import { RunButtonControl } from '../Controls/RunButton';
import { createSocket, type TypedSocket, type Schemes } from 'renderer/nodeEditor/types';
const { Output } = ClassicPreset;

// Run ノード
export class RunNode extends BaseNode<
  object,
  { exec: TypedSocket },
  { btn: RunButtonControl }
> {
  constructor(
    private engine: ControlFlowEngine<Schemes>
  ) {
    super('Run');
    this.addOutput('exec', new Output(createSocket("exec"), undefined, true));
    this.addControl(
      'btn',
      new RunButtonControl({
        onClick: async (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          this.engine.execute(this.id);
        }
      })
    );
  }

  data(): object { return {} }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec');
  }
}
