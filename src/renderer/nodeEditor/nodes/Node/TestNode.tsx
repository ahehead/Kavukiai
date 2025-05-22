import { ClassicPreset } from 'rete';
import type { ControlFlowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import { createSocket, type NodeSocket, type Schemes } from 'renderer/nodeEditor/types';
import { CheckBoxControl } from '../Controls/CheckBox';
import { ButtonControl } from '../Controls/Button';
const { Output } = ClassicPreset;

// src/renderer/nodeEditor/features/customReactPresets/customReactPresets.ts
// 型チェック回避用のNode…使うことはない。
export class TestNode extends BaseNode<
  object,
  { exec: NodeSocket },
  { check: CheckBoxControl, button: ButtonControl }
> {
  constructor(
    private engine: ControlFlowEngine<Schemes>
  ) {
    super('Test');
    this.addOutput('exec', new Output(createSocket("exec"), undefined, true));
    this.addControl(
      'check',
      new CheckBoxControl(true, { label: 'CheckBox' })
    );
    this.addControl(
      'button',
      new ButtonControl('Button', async () => { })
    );
  }

  data(): object { return {} }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec');
  }
}
