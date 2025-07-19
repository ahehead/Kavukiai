import type { ButtonControl } from "../nodes/Controls/Button";
import type { ConsoleControl } from "../nodes/Controls/Console";
import type { ImageControl } from "../nodes/Controls/Image";
import type { CheckBoxControl } from "../nodes/Controls/input/CheckBox";
import type { ImageFileInputControl } from "../nodes/Controls/input/ImageFileInput";
import type { InputValueControl } from "../nodes/Controls/input/InputValue";
import type { ListControl } from "../nodes/Controls/input/List";
import type { MultiLineControl } from "../nodes/Controls/input/MultiLine";
import type { PropertyInputControl } from "../nodes/Controls/input/PropertyInput";
import type { SelectControl } from "../nodes/Controls/input/Select";
import type { SliderControl } from "../nodes/Controls/input/Slider";
import type { SwitchControl } from "../nodes/Controls/input/Switch";
import type { MessageInputControl } from "../nodes/Controls/OpenAI/MessageInput";
import type { ResponseInputMessageControl } from "../nodes/Controls/OpenAI/ResponseInputMessage";
import type { RunButtonControl } from "../nodes/Controls/RunButton";

import type { ProgressControl } from "../nodes/Controls/view/ProgressControl";
export type NodeControl =
  | RunButtonControl
  | MultiLineControl
  | ConsoleControl
  | InputValueControl<string>
  | InputValueControl<number>
  | ResponseInputMessageControl
  | MessageInputControl
  | CheckBoxControl
  | ButtonControl
  | SelectControl<any>
  | ListControl<any>
  | SwitchControl
  | SliderControl
  | PropertyInputControl
  | MessageInputControl
  | ImageControl
  | ImageFileInputControl
  | ProgressControl;
