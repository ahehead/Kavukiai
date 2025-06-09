import { MultiLineControl } from '../../Controls/input/TextArea';
import type { HistoryPlugin } from 'rete-history-plugin';
import { BaseNode } from "renderer/nodeEditor/nodes/Node/BaseNode";
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import { resetCacheDataflow } from '../../util/resetCacheDataflow';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';
import { Type } from '@sinclair/typebox';

// 長文文字列入力ノード
export class MultiLineStringNode extends BaseNode<
  object,
  { out: TypedSocket },
  { textArea: MultiLineControl }
> {

  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
  ) {
    super('MultiLineString');
    this.addOutputPort({
      key: 'out',
      name: "string",
      schema: Type.String(),
    });
    this.addControl(
      'textArea',
      new MultiLineControl({
        value: initial,
        history,
        area,
        onChange: (v: string) => {
          resetCacheDataflow(dataflow, this.id); // この階層じゃないとなぜかnodeIdがおかしくなる
        }
      })
    );
  }

  data(): { out: string } {
    return { out: this.controls.textArea.getValue() || '' };
  }

  async execute(): Promise<void> { }

  serializeControlValue(): { data: { value: string } } {
    return {
      data: {
        value: this.controls.textArea.getValue() || '',
      }
    };
  }

  deserializeControlValue(data: { value: string }): void {
    this.controls.textArea.setValue(data.value);
  }
}
