import { useEffect, useRef, type JSX } from "react";
import { Drag } from "rete-react-plugin";
import { ControlLabel, ControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import { formatValue } from "../../util/formatValue";

export interface ListControlParams<T> extends ControlOptions<T[]> {
  value: T[];
}

export class ListControl<T> extends BaseControl<T[], ListControlParams<T>> {
  items: T[];

  constructor(params: ListControlParams<T>) {
    super(params);
    this.items = params.value;
  }

  getValue(): T[] {
    return this.items;
  }

  setValue(items: T[]) {
    this.items = items;
    this.opts.onChange?.(items);
  }

  addItem(item: T) {
    const newItems = [...this.items, item];
    this.addHistory(this.items, newItems);
    this.items = newItems;
    this.opts.onChange?.(this.items);
  }

  replaceItem(index: number, item: T) {
    const newItems = [...this.items];
    newItems[index] = item;
    this.addHistory(this.items, newItems);
    this.items = newItems;
    this.opts.onChange?.(this.items);
  }

  removeItem(index: number) {
    const newItems = [...this.items];
    newItems.splice(index, 1);
    this.addHistory(this.items, newItems);
    this.items = newItems;
    this.opts.onChange?.(this.items);
  }

  override toJSON(): ControlJson {
    return {
      data: {
        items: this.items,
        label: this.opts.label,
        editable: this.opts.editable,
      },
    };
  }

  override setFromJSON({ data }: ControlJson): void {
    const { items, label, editable } = data as any;
    this.items = items;
    this.opts.label = label;
    this.opts.editable = editable;
  }
}

export function ListControlView<T>(props: { data: ListControl<T> }): JSX.Element {
  const control = props.data;
  const items = control.getValue();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [items]);

  return (
    <Drag.NoDrag>
      <ControlWrapper cols={1}>
        {control.opts.label && (
          <ControlLabel type="input" htmlFor={control.id}>
            {control.opts.label}
          </ControlLabel>
        )}
        <div
          ref={containerRef}
          className="w-full max-h-32 overflow-auto border border-input rounded-md bg-node-bg p-2"
        >
          {items.map((item, idx) => (
            <div key={idx} className="text-sm py-0.5 border-b last:border-b-0">
              {formatValue(item)}
            </div>
          ))}
        </div>
      </ControlWrapper>
    </Drag.NoDrag>
  );
}
