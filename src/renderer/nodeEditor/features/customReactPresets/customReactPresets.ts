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
} from "../../nodes/Controls/input/TextArea";
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
        if (data.payload instanceof RunButtonControl) {
          return RunButtonControlView;
        }
        if (data.payload instanceof MultiLineControl) {
          return TextAreaControllView;
        }
        if (data.payload instanceof ConsoleControl) {
          return ConsoleControlView;
        }
        if (data.payload instanceof InputValueControl) {
          return InputValueControlView;
        }
        if (data.payload instanceof ResponseInputMessageControl) {
          return ResponseInputMessageView;
        }
        if (data.payload instanceof CheckBoxControl) {
          return CheckBoxControlView;
        }
        if (data.payload instanceof ButtonControl) {
          return ButtonControlView;
        }
        if (data.payload instanceof SelectControl) {
          return SelectControlView;
        }
        if (data.payload instanceof ListControl) {
          return ListControlView;
        }
        if (data.payload instanceof SwitchControl) {
          return SwitchControlView;
        }
        if (data.payload instanceof SliderControl) {
          return SliderControlView;
        }
        if (data.payload instanceof PropertyInputControl) {
          return PropertyInputControlView;
        }
        if (data.payload instanceof MessageInputControl) {
          return MessageInputControlView;
        }
        return null;
      },
      node() {
        return createCustomNode(area, history, getZoom);
      },
    },
  });
}
