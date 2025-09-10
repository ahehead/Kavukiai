import type { ButtonControl } from "../nodes/Controls/Button";
import type { UChatControl } from "../nodes/Controls/Chat/UChat";
import type { SelectWorkflowControl } from "../nodes/Controls/ComfyUI/SelectWorkflowControl";
import type { WorkflowIOSelectControl } from "../nodes/Controls/ComfyUI/WorkflowIOSelectControl";
import type { ConsoleControl } from "../nodes/Controls/Console/Console";
import type { CheckBoxControl } from "../nodes/Controls/input/CheckBox";
import type { ImageFileInputControl } from "../nodes/Controls/input/ImageFileInput";
import type { InputValueControl } from "../nodes/Controls/input/InputValue";
import type { ListControl } from "../nodes/Controls/input/List";
import type { ModelInfoListControl } from "../nodes/Controls/input/ModelInfoListControl";
import type { MultiLineControl } from "../nodes/Controls/input/MultiLine";
import type { PathInputControl } from "../nodes/Controls/input/PathInputControl";
import type { PropertyInputControl } from "../nodes/Controls/input/PropertyInput";
import type { SelectControl } from "../nodes/Controls/input/Select";
import type { SliderControl } from "../nodes/Controls/input/Slider";
import type { SwitchControl } from "../nodes/Controls/input/Switch";
import type { RunButtonControl } from "../nodes/Controls/RunButton";
import type { ImageControl } from "../nodes/Controls/view/Image";
import type { ProgressControl } from "../nodes/Controls/view/ProgressControl";

export type NodeControl =
  | RunButtonControl
  | MultiLineControl
  | ConsoleControl
  | InputValueControl<string>
  | InputValueControl<number>
  | CheckBoxControl
  | ButtonControl
  | SelectControl<any>
  | ModelInfoListControl
  | ListControl<any>
  | SwitchControl
  | SliderControl
  | PropertyInputControl
  | ImageControl
  | ImageFileInputControl
  | ProgressControl
  | UChatControl
  | PathInputControl
  | WorkflowIOSelectControl
  | SelectWorkflowControl;
