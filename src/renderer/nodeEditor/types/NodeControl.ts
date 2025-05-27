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

export abstract class BaseControl
  extends ClassicPreset.Control
  implements SerializableControl
{
  toJSON(): ControlJson | undefined {
    return undefined;
  }
  setFromJSON({ data }: ControlJson): void {}
}
