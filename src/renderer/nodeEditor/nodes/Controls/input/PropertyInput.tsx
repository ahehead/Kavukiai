import { useMemo, useRef, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue
} from "renderer/components/ui/select";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useStopWheel } from "../../util/useStopWheel";

export type PropertyItem = {
  key: string;
  typeStr: "string" | "number" | "boolean";
};

export interface PropertyInputParams extends ControlOptions<PropertyItem[]> {
  value: PropertyItem[];
}

export class PropertyInputControl extends BaseControl<PropertyItem[], PropertyInputParams> {
  items: PropertyItem[];

  constructor(params: PropertyInputParams) {
    super(params);
    this.items = params.value ?? [];
  }

  getValue(): PropertyItem[] {
    return this.items;
  }

  setValue(items: PropertyItem[]): void {
    this.items = items;
    this.opts.onChange?.(items);
  }

  addItem(item: PropertyItem): void {
    const newItems = [...this.items, item];
    this.addHistory(this.items, newItems);
    this.setValue(newItems);
  }

  override toJSON(): ControlJson {
    return {
      data: {
        items: this.items,
        label: this.opts.label,
        editable: this.opts.editable
      }
    };
  }

  override setFromJSON({ data }: ControlJson): void {
    const { items, label, editable } = data as any;
    this.items = items;
    this.opts.label = label;
    this.opts.editable = editable;
  }
}

export function PropertyInputControlView(props: { data: PropertyInputControl }): JSX.Element {
  const control = props.data;
  const { editable } = control.opts;
  const [keyStr, setKeyStr] = useState("");
  const [typeStr, setTypeStr] = useState<PropertyItem["typeStr"]>("string");
  const items = useMemo(() => control.getValue(), [control]);
  // Handlers for item manipulation
  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const newItems = [...items];
    [newItems[from], newItems[to]] = [newItems[to], newItems[from]];
    control.addHistory(items, newItems);
    control.setValue(newItems);
  };
  const handleMoveUp = (index: number) => { handleMove(index, index - 1); };
  const handleMoveDown = (index: number) => { handleMove(index, index + 1); };
  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    control.addHistory(items, newItems);
    control.setValue(newItems);
  };
  const listRef = useRef<HTMLDivElement | null>(null);
  useStopWheel(listRef);

  const handleAdd = (): void => {
    if (!keyStr) return;
    // 重複するキーがあれば追加をキャンセル
    if (items.some(item => item.key === keyStr)) return;
    const item: PropertyItem = { key: keyStr, typeStr };
    control.addItem(item);
    setKeyStr("");
  };

  return (
    <Drag.NoDrag>
      <div className="flex flex-col gap-1 h-full w-full">
        {/* リスト */}
        <div
          ref={listRef}
          className="flex-1 w-full min-h-0 overflow-y-auto border rounded p-2 bg-node-bg"
        >
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm py-0.5">
              <span>{item.key}: {item.typeStr}</span>
              {editable && (
                <div className="flex space-x-1">
                  <button onClick={() => handleMoveUp(idx)} disabled={idx === 0}
                    className="p-1 hover:bg-gray-200 disabled:opacity-50">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMoveDown(idx)} disabled={idx === items.length - 1}
                    className="p-1 hover:bg-gray-200 disabled:opacity-50">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(idx)}
                    className="p-1 hover:bg-gray-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 新規追加入力 */}
        <div className="shrink-0 grid grid-cols-[1fr_minmax(7rem,max-content)_auto] gap-0.5 place-items-center">
          {/* key入力 */}
          <div className="grid grid-cols-[1fr_auto] place-items-center w-full">
            <input
              type="text"
              value={keyStr}
              placeholder="key*"
              onChange={(e) => setKeyStr(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded text-sm"
              disabled={!editable}
            />
            :
          </div>
          {/* 型選択 */}
          <Select
            value={typeStr}
            onValueChange={(val) => editable && setTypeStr(val as PropertyItem["typeStr"])}
            disabled={!editable}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-0">
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                {(["string", "number", "boolean"] as PropertyItem["typeStr"][]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* 追加ボタン */}
          <button
            onClick={handleAdd}
            disabled={!editable}
            className="ml-1 w-8 h-8 flex justify-center items-center p-1 rounded border border-input text-sm bg-accent/40 hover:bg-accent/70 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

      </div>
    </Drag.NoDrag>
  );
}
