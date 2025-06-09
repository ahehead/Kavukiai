import { BaseNode } from "renderer/nodeEditor/nodes/Node/BaseNode";
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';
import { InputValueControl } from '../../Controls/input/InputValue';
import { resetCacheDataflow } from '../../util/resetCacheDataflow';
import { Type } from '@sinclair/typebox';

// 数値入力ノード
export class NumberNode extends BaseNode<
  object,
  { out: TypedSocket },
  { numInput: InputValueControl<number> }
> {
  constructor(
    initial: number,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('Number');

    this.addOutputPort({
      key: 'out',
      name: 'number',
      schema: Type.Number(),
    });

    this.addControl(
      'numInput',
      new InputValueControl<number>({
        value: initial,
        type: 'number',
        editable: true,
        history,
        area,
        onChange: () => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
  }

  data(): { out: number } {
    return { out: this.controls.numInput.value ?? 0 };
  }

  async execute(): Promise<void> {}

  serializeControlValue(): { data: { value: number } } {
    return {
      data: { value: this.controls.numInput.value ?? 0 },
    };
  }

  deserializeControlValue(data: { value: number }): void {
    this.controls.numInput.setValue(data.value);
  }
}
