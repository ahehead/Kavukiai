import type React from "react"
import { useEffect, useRef, type JSX } from 'react';
import type { AreaExtra, Schemes } from "renderer/nodeEditor/types/Schemes";
import { ClassicPreset } from 'rete';
import type { AreaPlugin } from "rete-area-plugin";
import { Drag } from "rete-react-plugin";
import { useStopWheel } from "../util/useStopWheel";

// なんか表示する用の用コントロール
export class ConsoleControl extends ClassicPreset.Control {
  value = "";
  constructor(private area: AreaPlugin<Schemes, AreaExtra>) {
    super();
  }
  addValue: (addValue: string) => void = (addValue) => {
    this.value += addValue;
    this.value += "\n-----------\n"
    this.area.update("control", this.id);
  };
}

export function ConsoleControlView(props: { data: ConsoleControl }): JSX.Element {
  return <Console value={props.data.value} />;
}

function Console(props: { value: string }): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useStopWheel(textareaRef);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [props.value]);

  return (
    <Drag.NoDrag>
      <textarea
        ref={textareaRef}
        className="w-full h-full p-2 border-none resize-none text-sm text-gray-700 dark:text-gray-200 rounded-md bg-gray-100 overflow-auto focus:outline-none"
        value={props.value}
        readOnly
        rows={1}
      />
    </Drag.NoDrag>
  );
}
