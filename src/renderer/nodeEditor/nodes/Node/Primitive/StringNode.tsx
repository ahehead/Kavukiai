
import { BaseNode } from "renderer/nodeEditor/types/Node/BaseNode";
import type { HistoryPlugin } from 'rete-history-plugin';
import type { AreaPlugin } from 'rete-area-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { AreaExtra, TypedSocket, Schemes } from 'renderer/nodeEditor/types';

import { resetCacheDataflow } from '../../util/resetCacheDataflow';
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import { InputValueControl } from "renderer/nodeEditor/nodes/Controls/input/InputValue";
// 短い文字列入力ノード
export class StringNode extends BaseNode<
  object,
  { out: TypedSocket },
  { textInput: InputValueControl<string> }
> implements SerializableDataNode {
  constructor(
    initial: string,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super('String');

    this.addOutputPort(
      {
        key: 'out',
        typeName: "string",
      }
    );

    this.addControl(
      'textInput',
      new InputValueControl<string>({
        value: initial,
        type: 'string',
        editable: true,
        history: history,
        area: area,
        onChange: (v: string) => {
          resetCacheDataflow(dataflow, this.id);
        }
      })
    );
  }

  data(): { out: string } {
    return { out: this.controls.textInput.value || '' };
  }

  async execute(): Promise<void> { }

  serializeControlValue(): { data: { value: string } } {
    return {
      data: { value: this.controls.textInput.value || "" }
    };
  }

  deserializeControlValue(data: { value: string }): void {
    this.controls.textInput.setValue(data.value);
  }
}
