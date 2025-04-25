import { ClassicPreset } from 'rete';
import type { JSX } from 'react';
import type { ControlFlowEngine } from 'rete-engine';
import type { Schemes } from '../../types';
import { ExecSocket } from '../Sockets';
import RunButton from '../components/RunButton';

// Run ノード
export class Run extends ClassicPreset.Node<
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

// Run ボタン用コントロール
export class RunButtonControl extends ClassicPreset.Control {
  constructor(
    public label: string,
    public onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  ) {
    super();
  }
}

// カスタム Run ボタンコンポーネント
export function RunButtonControlView(props: { data: RunButtonControl }): JSX.Element {
  return <RunButton label={props.data.label} onClick={props.data.onClick} />;
}
