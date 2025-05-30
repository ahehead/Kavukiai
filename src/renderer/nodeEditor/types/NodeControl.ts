import type { ChatContextControl } from "../nodes/Controls/ChatContext/ChatContext";
import type { CheckBoxControl } from "../nodes/Controls/input/CheckBox";
import type { ConsoleControl } from "../nodes/Controls/Console";
import type { InputValueControl } from "../nodes/Controls/input/InputValue";
import type { RunButtonControl } from "../nodes/Controls/RunButton";
import type { MultiLineControl } from "../nodes/Controls/input/TextArea";
import type { ButtonControl } from "../nodes/Controls/Button";
import type { SelectControl } from "../nodes/Controls/input/Select";
import type { ListControl } from "../nodes/Controls/input/List";
import type { SwitchControl } from "../nodes/Controls/input/Switch";

export type NodeControl =
  | RunButtonControl
  | MultiLineControl
  | ConsoleControl
  | InputValueControl<string>
  | InputValueControl<number>
  | ChatContextControl
  | CheckBoxControl
  | ButtonControl
  | SelectControl<any>
  | ListControl<any>
  | SwitchControl;
