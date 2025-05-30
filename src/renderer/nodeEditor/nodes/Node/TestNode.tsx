import { ClassicPreset } from 'rete';
import type { ControlFlowEngine } from 'rete-engine';
import { BaseNode } from "renderer/nodeEditor/types/BaseNode";
import { createSocket, type TypedSocket, type Schemes } from 'renderer/nodeEditor/types';
import { CheckBoxControl } from '../Controls/input/CheckBox';
import { ButtonControl } from '../Controls/Button';
import { SelectControl } from '../Controls/input/Select';
import { ListControl } from '../Controls/input/List';
const { Output } = ClassicPreset;

// src/renderer/nodeEditor/features/customReactPresets/customReactPresets.ts
// 型チェック回避用のNode…使うことはない。
export class TestNode extends BaseNode<
  object,
  { exec: TypedSocket },
  {
    check: CheckBoxControl,
    button: ButtonControl,
    select: SelectControl<string>,
    list: ListControl<string>
  }
> {
  constructor(
    private engine: ControlFlowEngine<Schemes>
  ) {
    super('Test');
    this.addOutput('exec', new Output(createSocket("exec"), undefined, true));
    this.addControl(
      'check',
      new CheckBoxControl({ value: true, label: 'CheckBox' })
    );
    this.addControl(
      'button',
      new ButtonControl({ label: 'Button', onClick: async () => { } })
    );
    this.addControl(
      'select',
      new SelectControl({
        value: 'option1',
        optionsList: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        label: 'Select Option'
      })
    );
    this.addControl(
      'list',
      new ListControl<string>({
        value: ['item1', 'item2'],
        label: 'List Control',
        editable: true
      })
    );
  }

  data(): object { return {} }

  async execute(_: never, forward: (output: 'exec') => void): Promise<void> {
    forward('exec');
  }
}
