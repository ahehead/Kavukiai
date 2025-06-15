import type { ControlFlowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import { RunButtonControl } from '../../Controls/RunButton';
import type { TypedSocket, Schemes } from 'renderer/nodeEditor/types';

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
    this.addOutputPort(
      {
        key: 'exec',
        typeName: 'exec',
      });

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
