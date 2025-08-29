import type { TSchema } from "@sinclair/typebox";
import { ButtonControl } from "renderer/nodeEditor/nodes/Controls/Button";
import { ClassicPreset } from "rete";
import type { BaseControl } from "../BaseControl";
import { TooltipInput } from "../Input";
import type { NodeControl } from "../NodeControl";
import { getSchema, type SchemaKey } from "../Schemas";
import { TypedSocket } from "../TypedSocket";

const { Output } = ClassicPreset;

// 自作スキーマTSchemaと、スキーマ呼び出しSchemaKeyと、exec buttonの三通り
export type InputPortConfig<K> =
  | {
      key: K;
      schema: TSchema;
      typeName: string;
      label?: string;
      tooltip?: string;
      control?: BaseControl<any, any>;
      showControl?: boolean;
      require?: boolean;
      onClick?: () => Promise<void> | void;
    }
  | {
      key: K;
      schema?: undefined;
      typeName: SchemaKey;
      label?: string;
      tooltip?: string;
      control?: BaseControl<any, any>;
      showControl?: boolean;
      require?: boolean;
      onClick?: () => Promise<void> | void;
    };

export type InputSpec<K> = InputPortConfig<K> | InputPortConfig<K>[];

export type OutputPortConfig<K> =
  | {
      key: K;
      schema: TSchema;
      typeName: string;
      label?: string;
    }
  | {
      key: K;
      schema?: undefined;
      typeName: SchemaKey;
      label?: string;
    };
export type OutputSpec<K> = OutputPortConfig<K> | OutputPortConfig<K>[];

// input outputをなるべく簡単に作成する関数を持つクラス
export abstract class NodeIO<
  Inputs extends { [key in string]?: TypedSocket },
  Outputs extends { [key in string]?: TypedSocket },
  Controls extends { [key in string]?: NodeControl }
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {
  declare inputs: {
    [key in keyof Inputs]?: TooltipInput<Exclude<Inputs[key], undefined>>;
  };

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
  >({
    key,
    typeName,
    schema,
    label,
    tooltip,
    control,
    showControl,
    require,
    onClick,
  }: InputPortConfig<K>): void {
    const input = new TooltipInput<S>(
      new TypedSocket(typeName, schema ? schema : getSchema(typeName)) as S,
      label,
      false,
      tooltip,
      require ?? false
    );
    this.addInput(key, input);
    // control と onClick が両方指定された場合は control を優先する
    if (control) {
      input.addControl(control);
      input.showControl = showControl ?? true; // controlはデフォルトで表示する
    } else if (onClick) {
      input.addControl(
        new ButtonControl({
          label: label ?? "Click",
          onClick: async (e) => {
            e.stopPropagation();
            await onClick();
          },
          isExec: true,
        })
      );
      input.showControl = showControl ?? true; // controlはデフォルトで表示する
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
  >({ key, typeName, schema, label }: OutputPortConfig<K>): void {
    this.addOutput(
      key,
      new Output(
        new TypedSocket(
          typeName,
          schema ? schema : getSchema(typeName as SchemaKey)
        ) as S,
        label,
        true
      )
    );
  }
}
