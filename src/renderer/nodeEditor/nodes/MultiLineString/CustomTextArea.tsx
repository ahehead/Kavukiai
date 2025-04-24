import { useEffect, useState, type JSX } from "react";
import type { MultiLineControl } from "./index";
import { Drag } from "rete-react-plugin";

// 長文テキストエリア用カスタムコンポーネント
export function CustomTextArea(props: { data: MultiLineControl }): JSX.Element {
  const [uiTextValue, setUiTextValue] = useState(props.data.value);
  useEffect(() => {
    props.data.setValue(uiTextValue);
  }
    , [uiTextValue]);
  return (
    <Drag.NoDrag>
      <textarea
        value={uiTextValue}
        className='resize-none w-full h-full p-2 border-none focus:border-none focus:outline-none ring-1 focus:ring-2 ring-white rounded-md'
        placeholder='text...'
        rows={5}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setUiTextValue(e.target.value);
        }}
      /></Drag.NoDrag>
  );
}
