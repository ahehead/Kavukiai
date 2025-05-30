import { useState, useRef, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import { ControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import { defaultNodeSchemas, type DefaultSchemaKey } from "renderer/nodeEditor/types/DefaultNodeSchema";
import { normalizeSchema } from "renderer/nodeEditor/types/TypedSocket";
import type { Type } from "arktype";
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

export interface PropertyInputValue {
  key: string;
  typeStr: DefaultSchemaKey;
  type: Type;
}

export interface PropertyInputParams extends ControlOptions<PropertyInputValue> {
  value: PropertyInputValue;
}

export class PropertyInputControl extends BaseControl<PropertyInputValue, PropertyInputParams> {
  value: PropertyInputValue;

  constructor(params: PropertyInputParams) {
    super(params);
    this.value = params.value;
  }

  getValue(): PropertyInputValue {
    return this.value;
  }

  setValue(value: PropertyInputValue): void {
    this.value = value;
    this.opts.onChange?.(value);
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        label: this.opts.label,
        editable: this.opts.editable
      }
    };
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value, label, editable } = data as any;
    this.value = value;
    this.opts.label = label;
    this.opts.editable = editable;
  }
}

export function PropertyInputControlView(props: { data: PropertyInputControl }): JSX.Element {
  const control = props.data;
  const { editable } = control.opts;
  const [keyStr, setKeyStr] = useState(control.getValue().key);
  const [typeStr, setTypeStr] = useState<DefaultSchemaKey>(control.getValue().typeStr);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleAdd = (): void => {
    const schemaType = normalizeSchema(typeStr);
    const newValue = { key: keyStr, typeStr, type: schemaType };
    control.addHistory(control.getValue(), newValue);
    control.setValue(newValue);
    setKeyStr("");
  };

  return (
    <Drag.NoDrag>
      <ControlWrapper className="grid-cols-[minmax(7rem,max-content)_1fr_auto] gap-0.5" ref={ref}>
        {/* TODO labelとデザインのバリアント */}
        {/* 型選択 */}
        <Select
          value={typeStr}
          onValueChange={(val) => editable && setTypeStr(val as DefaultSchemaKey)}
          disabled={!editable}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              {(Object.keys(defaultNodeSchemas) as DefaultSchemaKey[]).map((key) => (
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
          className=" w-full px-3 py-2 border border-input rounded text-sm"
          disabled={!editable}
        />

        {/* 追加ボタン */}
        <button
          onClick={handleAdd}
          disabled={!editable}
          className=" items-center justify-center p-1 rounded border border-input text-sm hover:bg-accent/50 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </ControlWrapper>
    </Drag.NoDrag>
  );
}
