import type { ControlJson } from "shared/JsonType";
import type { ChatContextControl } from "../nodes/Controls/ChatContext/ChatContext";
import type { CheckBoxControl } from "../nodes/Controls/CheckBox";
import type { ConsoleControl } from "../nodes/Controls/Console";
import type { InputValueControl } from "../nodes/Controls/InputValue";
import type { RunButtonControl } from "../nodes/Controls/RunButton";
import type { MultiLineControl } from "../nodes/Controls/TextArea";
import type { ButtonControl } from "../nodes/Controls/Button";
import type { SelectControl } from "../nodes/Controls/Select";
import { ClassicPreset } from "rete";
import type { HistoryPlugin } from "rete-history-plugin";
import type { AreaExtra, Schemes } from ".";
import type { AreaPlugin } from "rete-area-plugin";
import { ValueHistoryAction } from "./ValueHistoryAction";

export type NodeControl =
  | RunButtonControl
  | MultiLineControl
  | ConsoleControl
  | InputValueControl<string>
  | InputValueControl<number>
  | ChatContextControl
  | CheckBoxControl
  | ButtonControl
  | SelectControl<any>;

export interface SerializableControl {
  toJSON(): ControlJson | undefined;
  setFromJSON({ data }: ControlJson): void;
}

export interface ControlOptions<T> {
  label?: string;
  editable?: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: T) => void;
}

export abstract class BaseControl<T, O extends ControlOptions<T>>
  extends ClassicPreset.Control
  implements SerializableControl
{
  opts: ControlOptions<T>;

  constructor(opts: O = {} as O) {
    super();
    this.opts = { editable: true, ...opts };
  }

  abstract setValue(value: any): void;

  setLabel(label: string) {
    this.opts.label = label;
  }
  getLabel(): string | undefined {
    return this.opts.label;
  }
  setEditable(editable: boolean) {
    this.opts.editable = editable;
  }
  getEditable(): boolean {
    return this.opts.editable ?? true;
  }
  setHistory(history: HistoryPlugin<Schemes> | undefined) {
    this.opts.history = history;
  }
  getHistory(): HistoryPlugin<Schemes> | undefined {
    return this.opts.history;
  }
  setArea(area: AreaPlugin<Schemes, AreaExtra> | undefined) {
    this.opts.area = area;
  }
  getArea(): AreaPlugin<Schemes, AreaExtra> | undefined {
    return this.opts.area;
  }
  setOnChange(onChange: (v: T) => void) {
    this.opts.onChange = onChange;
  }
  getOnChange(): ((v: T) => void) | undefined {
    return this.opts.onChange;
  }

  toJSON(): ControlJson | undefined {
    return undefined;
  }
  setFromJSON({ data }: ControlJson): void {}

  addHistory(prev: T, next: T) {
    if (this.opts.history && this.opts.area) {
      this.opts.history.add(
        new ValueHistoryAction(this, this.opts.area, prev, next)
      );
    }
  }
}
