import { ClassicPreset } from 'rete';
import type { ControlFlowEngine } from 'rete-engine';
import type { Schemes } from '../../types';
import { ExecSocket } from '../Sockets';
import { RunButtonControl } from '../Controls/RunButton';

// Run ノード
export class RunNode extends ClassicPreset.Node<
  object,
  { exec: ClassicPreset.Socket },
  { btn: RunButtonControl }
> {
  constructor(
    private engine: ControlFlowEngine<Schemes>
  ) {
    super('Run');
    this.addOutput('exec', new ClassicPreset.Output(new ExecSocket(), undefined, true));
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
