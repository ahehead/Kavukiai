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
} from "../../nodes/Controls/TextArea";
import {
  ConsoleControl,
  ConsoleControlView,
} from "../../nodes/Controls/Console";
import {
  InputValueControl,
  InputValueControlView,
} from "../../nodes/Controls/InputValue";
import {
  ChatContextControl,
  ChatContextControlView,
} from "../../nodes/Controls/ChatContext/ChatContext";
import {
  CheckBoxControl,
  CheckBoxControlView,
} from "../../nodes/Controls/CheckBox";
import {
  CustomExecSocket,
  CustomSocket,
  createCustomNode,
} from "../../component";
import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";

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
        return null;
      },
      node() {
        return createCustomNode(area, history, getZoom);
      },
    },
  });
}
