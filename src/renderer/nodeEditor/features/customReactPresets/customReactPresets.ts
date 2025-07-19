import {
  ButtonControl,
  ButtonControlView,
} from "renderer/nodeEditor/nodes/Controls/Button";
import {
  ImageControl,
  ImageControlView,
} from "renderer/nodeEditor/nodes/Controls/Image";
import {
  ImageFileInputControl,
  ImageFileInputControlView,
} from "renderer/nodeEditor/nodes/Controls/input/ImageFileInput";
import {
  ListControl,
  ListControlView,
} from "renderer/nodeEditor/nodes/Controls/input/List";
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
  MessageInputControl,
  MessageInputControlView,
} from "renderer/nodeEditor/nodes/Controls/OpenAI/MessageInput";
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
import { type ReactArea2D, Presets as ReactPresets } from "rete-react-plugin";
import {
  ConsoleControl,
  ConsoleControlView,
} from "../../nodes/Controls/Console";
import {
  CheckBoxControl,
  CheckBoxControlView,
} from "../../nodes/Controls/input/CheckBox";
import {
  InputValueControl,
  InputValueControlView,
} from "../../nodes/Controls/input/InputValue";
import {
  MultiLineControl,
  TextAreaControllView,
} from "../../nodes/Controls/input/MultiLine";
import {
  ResponseInputMessageControl,
  ResponseInputMessageView,
} from "../../nodes/Controls/OpenAI/ResponseInputMessage";
import {
  RunButtonControl,
  RunButtonControlView,
} from "../../nodes/Controls/RunButton";

type Ctor<T = unknown> = new (...a: any[]) => T;

// control の View をコントロール クラスをキーにマッピング
const controlViews = new Map<Ctor, any>([
  [RunButtonControl, RunButtonControlView],
  [MultiLineControl, TextAreaControllView],
  [ConsoleControl, ConsoleControlView],
  [InputValueControl, InputValueControlView],
  [ResponseInputMessageControl, ResponseInputMessageView],
  [CheckBoxControl, CheckBoxControlView],
  [ButtonControl, ButtonControlView],
  [SelectControl, SelectControlView],
  [ListControl, ListControlView],
  [SwitchControl, SwitchControlView],
  [SliderControl, SliderControlView],
  [PropertyInputControl, PropertyInputControlView],
  [MessageInputControl, MessageInputControlView],
  [ImageControl, ImageControlView],
  [ImageFileInputControl, ImageFileInputControlView],
  [ProgressControl, ProgressControlView],
]);

export function customReactPresets(
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>,
  getZoom: () => number
) {
  return ReactPresets.classic.setup<Schemes, ReactArea2D<Schemes>>({
    customize: {
      socket(data) {
        if (data.payload.isExec) {
          return CustomExecSocket;
        }
        return CustomSocket;
      },
      control(data) {
        return controlViews.get((data.payload as any).constructor) ?? null;
      },
      node() {
        return createCustomNode(area, history, getZoom);
      },
    },
  });
}
