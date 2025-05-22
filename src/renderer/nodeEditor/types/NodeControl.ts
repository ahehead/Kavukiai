import type { ControlJson } from "shared/JsonType";
import type { ChatContextControl } from "../nodes/Controls/ChatContext/ChatContext";
import type { CheckBoxControl } from "../nodes/Controls/CheckBox";
import type { ConsoleControl } from "../nodes/Controls/Console";
import type { InputValueControl } from "../nodes/Controls/InputValue";
import type { RunButtonControl } from "../nodes/Controls/RunButton";
import type { MultiLineControl } from "../nodes/Controls/TextArea";
import type { HistoryPlugin } from "rete-history-plugin";
import type { AreaExtra, Schemes } from ".";
import type { AreaPlugin } from "rete-area-plugin";
import type { ButtonControl } from "../nodes/Controls/Button";

export type NodeControl =
  | RunButtonControl
  | MultiLineControl
  | ConsoleControl
  | InputValueControl<string>
  | InputValueControl<number>
  | ChatContextControl
  | CheckBoxControl
  | ButtonControl;

export interface SerializableControl {
  toJSON(): ControlJson;
}

export interface SerializableControlConstructor {
  fromJSON(json: ControlJson, ctx?: ControlContext): SerializableControl;
}

export interface ControlContext {
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  onChange?: (v: unknown) => void;
}
