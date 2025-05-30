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
  ChatContextControl,
  ChatContextControlView,
} from "../../nodes/Controls/ChatContext/ChatContext";
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
  CustomExecSocket,
  CustomSocket,
  createCustomNode,
} from "../customization";
import {
  ListControl,
  ListControlView,
} from "renderer/nodeEditor/nodes/Controls/input/List";

export function customReactPresets(
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>,
  getZoom: () => number
) {
  return ReactPresets.classic.setup<Schemes, ReactArea2D<Schemes>>({
    customize: {
      socket(data) {
        if (data.payload.name === "exec") {
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
        if (data.payload instanceof ChatContextControl) {
          return ChatContextControlView;
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
        return null;
      },
      node() {
        return createCustomNode(area, history, getZoom);
      },
    },
  });
}
