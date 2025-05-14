import { ClassicPreset } from 'rete';
import type { ControlFlowEngine } from 'rete-engine';
import { BaseNode, type CustomSocketType, type Schemes } from '../../types';
import { createSocket } from '../Sockets';
import { RunButtonControl } from '../Controls/RunButton';
const { Output } = ClassicPreset;

// Run ノード
export class RunNode extends BaseNode<
  object,
  { exec: CustomSocketType },
  { btn: RunButtonControl }
> {
  constructor(
    private engine: ControlFlowEngine<Schemes>
  ) {
    super('Run');
    this.addOutput('exec', new Output(createSocket("exec"), undefined, true));
    this.addControl(
      'btn',
      new RunButtonControl('Run', async (e: React.MouseEvent<HTMLButtonElement>) => {
        this.engine.execute(this.id);
        e.stopPropagation();
      })
    );
  }

  data(): object { return {} }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec');
  }
}
