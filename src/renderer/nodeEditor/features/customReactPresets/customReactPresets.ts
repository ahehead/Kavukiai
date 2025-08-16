import {
  ButtonControl,
  ButtonControlView,
} from "renderer/nodeEditor/nodes/Controls/Button";
// ChatMessageList
import {
  ChatMessageListControl,
  ChatMessageListControlView,
} from "renderer/nodeEditor/nodes/Controls/Chat/ChatMessageList";
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
// Console
import {
  ConsoleControl,
  ConsoleControlView,
} from "renderer/nodeEditor/nodes/Controls/Console";
import {
  ImageControl,
  ImageControlView,
} from "renderer/nodeEditor/nodes/Controls/Image";
// CheckBox
import {
  CheckBoxControl,
  CheckBoxControlView,
} from "renderer/nodeEditor/nodes/Controls/input/CheckBox";
import {
  ImageFileInputControl,
  ImageFileInputControlView,
} from "renderer/nodeEditor/nodes/Controls/input/ImageFileInput";
// InputValue
import {
  InputValueControl,
  InputValueControlView,
} from "renderer/nodeEditor/nodes/Controls/input/InputValue";
import {
  ListControl,
  ListControlView,
} from "renderer/nodeEditor/nodes/Controls/input/List";
// MultiLine
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
// RunButton
import {
  RunButtonControl,
  RunButtonControlView,
} from "renderer/nodeEditor/nodes/Controls/RunButton";
// Progress control
import {
  ProgressControl,
  ProgressControlView,
} from "renderer/nodeEditor/nodes/Controls/view/ProgressControl";
import {
  CustomExecSocket,
  CustomSocket,
  createCustomNode,
} from "renderer/nodeEditor/nodes/components";
import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import { Presets as ReactPresets } from "rete-react-plugin";

type Ctor<T = unknown> = new (...a: any[]) => T;
// React コンポーネント型を明確に定義
type ControlViewComponent = React.ComponentType<any>;

// control の View をコントロール クラスをキーにマッピング
const controlViews = new Map<Ctor, ControlViewComponent>([
  [RunButtonControl, RunButtonControlView],
  [MultiLineControl, TextAreaControllView],
  [ConsoleControl, ConsoleControlView],
  [InputValueControl, InputValueControlView],
  [ChatMessageListControl, ChatMessageListControlView],
  [CheckBoxControl, CheckBoxControlView],
  [ButtonControl, ButtonControlView],
  [SelectControl, SelectControlView],
  [ListControl, ListControlView],
  [SwitchControl, SwitchControlView],
  [SliderControl, SliderControlView],
  [PropertyInputControl, PropertyInputControlView],
  [UChatControl, UChatMessageListControlView],
  [ImageControl, ImageControlView],
  [ImageFileInputControl, ImageFileInputControlView],
  [ProgressControl, ProgressControlView],
  [PathInputControl, PathInputControlView],
  [WorkflowIOSelectControl, WorkflowIOSelectControlView],
  [SelectWorkflowControl, SelectWorkflowControlView],
]);

export function customReactPresets(
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>,
  getZoom: () => number
) {
  // Use any-cast to bypass complex TS types for Rete React Presets
  return (ReactPresets.classic as any).setup({
    customize: {
      socket: (data: any) => {
        return data.payload?.isExec ? CustomExecSocket : CustomSocket;
      },
      control: (data: any) => {
        const payload = data.payload as { constructor: Ctor };
        return controlViews.get(payload.constructor) ?? null;
      },
      node: () => createCustomNode(area, history, getZoom),
    },
  });
}
