// Central registry for all node editor controls and their React views.
// Adding a new Control now only requires appending one entry here.
// Optional: specialize generic controls (see NodeControl type below).

import {
  ButtonControl,
  ButtonControlView,
} from "renderer/nodeEditor/nodes/Controls/Button";
import {
  UChatControl,
  UChatMessageListControlView,
} from "renderer/nodeEditor/nodes/Controls/Chat/UChat";
import {
  SelectWorkflowControl,
  SelectWorkflowControlView,
} from "renderer/nodeEditor/nodes/Controls/ComfyUI/SelectWorkflowControl";
import {
  WorkflowIOSelectControl,
  WorkflowIOSelectControlView,
} from "renderer/nodeEditor/nodes/Controls/ComfyUI/WorkflowIOSelectControl";
import {
  ConsoleControl,
  ConsoleControlView,
} from "renderer/nodeEditor/nodes/Controls/Console/Console";
import {
  CheckBoxControl,
  CheckBoxControlView,
} from "renderer/nodeEditor/nodes/Controls/input/CheckBox";
import {
  ImageFileInputControl,
  ImageFileInputControlView,
} from "renderer/nodeEditor/nodes/Controls/input/ImageFileInput";
import {
  InputValueControl,
  InputValueControlView,
} from "renderer/nodeEditor/nodes/Controls/input/InputValue";
import {
  ListControl,
  ListControlView,
} from "renderer/nodeEditor/nodes/Controls/input/List";
import {
  MultiLineControl,
  TextAreaControllView,
} from "renderer/nodeEditor/nodes/Controls/input/MultiLine";
import {
  PathInputControl,
  PathInputControlView,
} from "renderer/nodeEditor/nodes/Controls/input/PathInputControl";
import {
  PropertyInputControl,
  PropertyInputControlView,
} from "renderer/nodeEditor/nodes/Controls/input/PropertyInput";
import {
  SelectControl,
  SelectControlView,
} from "renderer/nodeEditor/nodes/Controls/input/Select";
import {
  SliderControl,
  SliderControlView,
} from "renderer/nodeEditor/nodes/Controls/input/Slider";
import {
  SwitchControl,
  SwitchControlView,
} from "renderer/nodeEditor/nodes/Controls/input/Switch";
import {
  ModelInfoListControl,
  ModelInfoListControlView,
} from "renderer/nodeEditor/nodes/Controls/LMStudio/ModelInfoListControl";
import {
  RunButtonControl,
  RunButtonControlView,
} from "renderer/nodeEditor/nodes/Controls/RunButton";
import {
  ImageControl,
  ImageControlView,
} from "renderer/nodeEditor/nodes/Controls/view/Image";
import {
  ProgressControl,
  ProgressControlView,
} from "renderer/nodeEditor/nodes/Controls/view/ProgressControl";

// 1. Append new entries here when adding a Control.
// 2. If you need specialized generic variants (e.g., InputValueControl<string>) extend the NodeControl type below.
export const controlDefinitions = [
  { ctor: RunButtonControl, view: RunButtonControlView },
  { ctor: MultiLineControl, view: TextAreaControllView },
  { ctor: ConsoleControl, view: ConsoleControlView },
  { ctor: InputValueControl, view: InputValueControlView },
  { ctor: CheckBoxControl, view: CheckBoxControlView },
  { ctor: ButtonControl, view: ButtonControlView },
  { ctor: SelectControl, view: SelectControlView },
  { ctor: ModelInfoListControl, view: ModelInfoListControlView },
  { ctor: ListControl, view: ListControlView },
  { ctor: SwitchControl, view: SwitchControlView },
  { ctor: SliderControl, view: SliderControlView },
  { ctor: PropertyInputControl, view: PropertyInputControlView },
  { ctor: UChatControl, view: UChatMessageListControlView },
  { ctor: ImageControl, view: ImageControlView },
  { ctor: ImageFileInputControl, view: ImageFileInputControlView },
  { ctor: ProgressControl, view: ProgressControlView },
  { ctor: PathInputControl, view: PathInputControlView },
  { ctor: WorkflowIOSelectControl, view: WorkflowIOSelectControlView },
  { ctor: SelectWorkflowControl, view: SelectWorkflowControlView },
] as const;

// Map used by React preset customization.
export const controlViews = new Map(
  controlDefinitions.map((d) => [d.ctor, d.view] as const)
);

// Derive a union of instances of all registered control constructors.
type RegisteredControlInstance = InstanceType<
  (typeof controlDefinitions)[number]["ctor"]
>;

// Extend with any specialized generic instantiations you rely on elsewhere for stricter typing.
export type NodeControl =
  | RegisteredControlInstance
  | InputValueControl<string>
  | InputValueControl<number>
  | SelectControl<any>
  | ListControl<any>;

// Helper (optional) for debug nodes: create a map from name to ctor
// export const controlCtorByName = Object.fromEntries(
//   controlDefinitions.map(d => [d.ctor.name, d.ctor])
// ) as Record<string, (new (...a: any[]) => NodeControl)>
