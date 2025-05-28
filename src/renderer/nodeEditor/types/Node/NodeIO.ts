import { ClassicPreset } from "rete";
import {
  type BaseControl,
  type NodeControl,
  type NodeSchemaSpec,
  TooltipInput,
  TypedSocket,
} from "..";
const { Output } = ClassicPreset;

export type InputPortConfig<K> = {
  key: K;
  schemaSpec: NodeSchemaSpec;
  label?: string;
  tooltip?: string;
  control?: BaseControl;
};
export type InputSpec<K> = InputPortConfig<K> | InputPortConfig<K>[];

export type OutputPortConfig<K> = {
  key: K;
  schemaSpec: NodeSchemaSpec;
  label?: string;
};
export type OutputSpec<K> = OutputPortConfig<K> | OutputPortConfig<K>[];

export abstract class NodeIO<
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  /** 単一 or 複数の入力ポート */
  public addInputPort<K extends keyof Inputs>(param: InputSpec<K>): void {
    if (Array.isArray(param)) {
      for (const p of param) this._addInputPort(p);
    } else {
      this._addInputPort(param);
    }
  }

  private _addInputPort<
    K extends keyof Inputs,
    S extends Exclude<Inputs[K], undefined>
  >({ key, schemaSpec, label, tooltip, control }: InputPortConfig<K>): void {
    const input = new TooltipInput<S>(
      new TypedSocket(schemaSpec) as S,
      label,
      false,
      tooltip
    );
    this.addInput(key, input);
    if (control) {
      input.addControl(control);
      input.showControl = false;
    }
  }

  /** 単一 or 複数の出力ポート */
  public addOutputPort<K extends keyof Outputs>(param: OutputSpec<K>): void {
    if (Array.isArray(param)) {
      for (const p of param) this._addOutputPort(p);
    } else {
      this._addOutputPort(param);
    }
  }

  private _addOutputPort<
    K extends keyof Outputs,
    S extends Exclude<Outputs[K], undefined>
  >({ key, schemaSpec, label }: OutputPortConfig<K>): void {
    this.addOutput(
      key,
      new Output(new TypedSocket(schemaSpec) as S, label, true)
    );
  }
}
