import { useState, type JSX } from "react";
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
import { Plus } from "lucide-react";
import { defaultNodeSchemas } from "renderer/nodeEditor/types/Schemas/DefaultSchema";

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
  const items = control.getValue();

  const handleAdd = (): void => {
    if (!keyStr) return;
    const item: PropertyItem = { key: keyStr, typeStr };
    control.addItem(item);
    setKeyStr("");
  };

  return (
    <Drag.NoDrag>
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-[minmax(7rem,max-content)_1fr_auto] gap-0.5">
          {/* 型選択 */}
          <Select
            value={typeStr}
            onValueChange={(val) => editable && setTypeStr(val as PropertyItem["typeStr"])}
            disabled={!editable}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
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
          {/* キー入力 */}
          <input
            type="text"
            value={keyStr}
            placeholder="key"
            onChange={(e) => setKeyStr(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded text-sm"
            disabled={!editable}
          />

          {/* 追加ボタン */}
          <button
            onClick={handleAdd}
            disabled={!editable}
            className="items-center justify-center p-1 rounded border border-input text-sm hover:bg-accent/50 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full max-h-32 overflow-auto border border-input rounded-md bg-node-bg p-2">
          {items.map((item, idx) => (
            <div key={idx} className="text-sm py-0.5 border-b last:border-b-0">
              {item.key}: {item.typeStr}
            </div>
          ))}
        </div>
      </div>
    </Drag.NoDrag>
  );
}
