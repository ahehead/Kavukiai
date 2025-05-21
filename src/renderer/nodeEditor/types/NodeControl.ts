import type { ChatContextControl } from "../nodes/Controls/ChatContext/ChatContext";
import type { CheckBoxControl } from "../nodes/Controls/CheckBox";
import type { ConsoleControl } from "../nodes/Controls/Console";
import type { InputValueControl } from "../nodes/Controls/InputValue";
import type { RunButtonControl } from "../nodes/Controls/RunButton";
import type { MultiLineControl } from "../nodes/Controls/TextArea";

export type NodeControl =
  | RunButtonControl
  | MultiLineControl
  | ConsoleControl
  | InputValueControl<string>
  | InputValueControl<number>
  | ChatContextControl
  | CheckBoxControl;
