import { useSyncExternalStore } from "react";
import { ClassicPreset } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { ControlJson } from "shared/JsonType";
import type { AreaExtra, Schemes } from ".";
import { ValueHistoryAction } from "./ValueHistoryAction";

export interface SerializableControl {
  toJSON(): ControlJson | undefined;
  setFromJSON({ data }: ControlJson): void;
}

export interface ControlOptions<T> {
  label?: string;
  editable?: boolean;
  history?: HistoryPlugin<Schemes>;
  area?: AreaPlugin<Schemes, AreaExtra>;
  cols?: 0 | 1 | 2;
  onChange?: (v: T) => void;
}

type Listener = () => void;

export abstract class BaseControl<T, O extends ControlOptions<T>>
  extends ClassicPreset.Control
  implements SerializableControl
{
  opts: ControlOptions<T> & { cols: 0 | 1 | 2; editable: boolean };

  private listeners = new Set<Listener>();

  constructor(opts: O = {} as O) {
    super();
    this.opts = { editable: true, cols: 1, ...opts };
  }

  abstract setValue(value: any): void;
  abstract getValue(): T;

  setLabel(label: string) {
    this.opts.label = label;
  }
  getLabel(): string | undefined {
    return this.opts.label;
  }
  setEditable(editable: boolean) {
    this.opts.editable = editable;
  }
  getEditable(): boolean {
    return this.opts.editable ?? true;
  }
  setHistory(history: HistoryPlugin<Schemes> | undefined) {
    this.opts.history = history;
  }
  getHistory(): HistoryPlugin<Schemes> | undefined {
    return this.opts.history;
  }
  setArea(area: AreaPlugin<Schemes, AreaExtra> | undefined) {
    this.opts.area = area;
  }
  getArea(): AreaPlugin<Schemes, AreaExtra> | undefined {
    return this.opts.area;
  }
  setOnChange(onChange: (v: T) => void) {
    this.opts.onChange = onChange;
  }
  getOnChange(): ((v: T) => void) | undefined {
    return this.opts.onChange;
  }

  toJSON(): ControlJson | undefined {
    return undefined;
  }
  // biome-ignore lint/correctness/noUnusedFunctionParameters: <explanation>
  setFromJSON({ data }: ControlJson): void {}

  addHistory(prev: T, next: T) {
    if (this.opts.history && this.opts.area) {
      this.opts.history.add(
        new ValueHistoryAction(this, this.opts.area, prev, next)
      );
    }
  }

  protected notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l); // unsubscribe
  }
}

export function useControlValue<T>(control: BaseControl<T, any>): T {
  return useSyncExternalStore<T>(
    (cb) => control.subscribe(cb), // subscribe
    () => control.getValue() // getSnapshot (client)
  );
}
