import type React from "react"
import { useEffect, useRef, type JSX } from 'react';
import { Drag } from "rete-react-plugin";
import { useStopWheel } from "../util/useStopWheel";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";

// なんか表示する用の用コントロール
export class ConsoleControl extends BaseControl<any, ControlOptions<any>> {
  value = "";
  addValue: (addValue: string) => void = (addValue) => {
    this.value += addValue;
    this.value += "\n-----------\n"
    this.opts.area?.update("control", this.id); // 画面更新。しないと一度に表示される
  };
  setValue(value: string) {
    this.value = value
  }
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
        className="w-full h-full min-h-0 overflow-auto p-2 border-none resize-none text-sm text-gray-700 dark:text-gray-200 rounded-md bg-gray-100 focus:outline-none"
        value={props.value}
        readOnly
        rows={1}
      />
    </Drag.NoDrag>
  );
}
