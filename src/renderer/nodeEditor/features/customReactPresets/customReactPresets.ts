import { type ReactArea2D, Presets as ReactPresets } from "rete-react-plugin";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import {
  RunButtonControl,
  RunButtonControlView,
} from "../../nodes/Controls/RunButton";
import {
  MultiLineControl,
  TextAreaControllView,
} from "../../nodes/Controls/input/MultiLine";
import {
  ConsoleControl,
  ConsoleControlView,
} from "../../nodes/Controls/Console";
import {
  InputValueControl,
  InputValueControlView,
} from "../../nodes/Controls/input/InputValue";
import {
  ResponseInputMessageControl,
  ResponseInputMessageView,
} from "../../nodes/Controls/OpenAI/ResponseInputMessage";
import {
  CheckBoxControl,
  CheckBoxControlView,
} from "../../nodes/Controls/input/CheckBox";

import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import {
  ButtonControl,
  ButtonControlView,
} from "renderer/nodeEditor/nodes/Controls/Button";
import {
  SelectControl,
  SelectControlView,
} from "renderer/nodeEditor/nodes/Controls/input/Select";

import {
  ListControl,
  ListControlView,
} from "renderer/nodeEditor/nodes/Controls/input/List";
import {
  SwitchControl,
  SwitchControlView,
} from "renderer/nodeEditor/nodes/Controls/input/Switch";
import {
  SliderControl,
  SliderControlView,
} from "renderer/nodeEditor/nodes/Controls/input/Slider";
import {
  PropertyInputControl,
  PropertyInputControlView,
} from "renderer/nodeEditor/nodes/Controls/input/PropertyInput";
import {
  CustomExecSocket,
  CustomSocket,
  createCustomNode,
} from "renderer/nodeEditor/nodes/components";
import {
  MessageInputControl,
  MessageInputControlView,
} from "renderer/nodeEditor/nodes/Controls/OpenAI/MessageInput";

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
