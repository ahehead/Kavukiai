import { useEffect, useState, type JSX } from "react";
import { Drag } from "rete-react-plugin";

import { ControlLabel, ControlWrapper } from "renderer/nodeEditor/component/nodeParts/NodeControlParts";
import { Switch as UISwitch } from "renderer/components/ui/switch";
import type { ControlJson } from "shared/JsonType";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";

export interface SwitchControlParams extends ControlOptions<boolean> {
  value: boolean;
}

// boolean入力用Switchコントロール
export class SwitchControl extends BaseControl<boolean, SwitchControlParams> {
  value: boolean;

  constructor(options: SwitchControlParams) {
    super(options);
    this.value = options.value;
  }

  setValue(value: boolean) {
    this.value = value;
    this.opts.onChange?.(value);
  }

  getValue(): boolean {
    return this.value;
  }

  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        label: this.opts.label,
        editable: this.opts.editable,
      },
    };
  }

  override setFromJSON({ data }: ControlJson): void {
    const { value, label, editable } = data as any;
    this.value = value;
    this.opts.label = label;
    this.opts.editable = editable;
  }
}

export function SwitchControlView(props: { data: SwitchControl }): JSX.Element {
  const control = props.data;
  const [uiValue, setUiValue] = useState<boolean>(control.getValue());

  useEffect(() => {
    setUiValue(control.getValue());
  }, [control.value]);

  const handleChange = (checked: boolean) => {
    control.addHistory(uiValue, checked);
    setUiValue(checked);
    control.setValue(checked);
  };

  return (
    <Drag.NoDrag>
      <ControlWrapper cols={2}>
        <ControlLabel type="checkbox" htmlFor={control.id}>
          {control.opts.label}
        </ControlLabel>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex justify-end">
            <UISwitch
              id={control.id}
              checked={uiValue}
              disabled={!control.opts.editable}
              onCheckedChange={control.opts.editable ? handleChange : undefined}
            />
          </div>
          <span className="text-sm">{uiValue ? 'true' : 'false'}</span>
        </div>
      </ControlWrapper>
    </Drag.NoDrag>
  );
}
