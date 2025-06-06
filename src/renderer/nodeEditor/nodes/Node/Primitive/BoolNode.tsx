import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import { BaseNode } from 'renderer/nodeEditor/types/BaseNode';
import type { TypedSocket, Schemes, AreaExtra } from 'renderer/nodeEditor/types';
import { SwitchControl } from '../../Controls/input/Switch';
import { resetCacheDataflow } from '../../util/resetCacheDataflow';
import { Type } from '@sinclair/typebox';

// Boolean入力ノード
export class BoolNode extends BaseNode<
  object,
  { out: TypedSocket },
  { switch: SwitchControl }
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('Bool');
    const opts = {
      history,
      area,
      editable: true,
      onChange: () => resetCacheDataflow(dataflow, this.id),
    };
    this.addOutputPort({
      key: 'out',
      name: 'boolean',
      schema: Type.Boolean(),
    });
    this.addControl(
      'switch',
      new SwitchControl({
        value: false,
        ...opts,
      })
    );
  }

  data(): { out: boolean } {
    return { out: this.controls.switch.getValue() };
  }

  async execute(): Promise<void> { }
}
