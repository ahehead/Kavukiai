import { Drag } from 'rete-react-plugin';
import { BaseControl, useControlValue, type ControlOptions } from 'renderer/nodeEditor/types';
import type { ControlJson } from 'shared/JsonType';
import type { Image } from 'renderer/nodeEditor/types/Schemas';

export interface ImageFileInputControlOptions extends ControlOptions<Image | null> {
  value?: Image | null;
}

export class ImageFileInputControl extends BaseControl<Image | null, ImageFileInputControlOptions> {
  value: Image | null;
  constructor(options: ImageFileInputControlOptions = {}) {
    super(options);
    this.value = options.value ?? null;
  }

  setValue(value: Image | null) {
    this.value = value;
    this.opts.onChange?.(value);
    this.notify();
  }

  getValue(): Image | null {
    return this.value;
  }

  override toJSON(): ControlJson {
    return { data: { value: this.value } };
  }

  override setFromJSON({ data }: ControlJson): void {
    this.value = (data as any).value ?? null;
  }
}

export function ImageFileInputControlView(props: { data: ImageFileInputControl }) {
  const control = props.data;
  const value = useControlValue(control);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      control.setValue(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const image: Image = { url, alt: file.name };
    control.addHistory(value, image);
    control.setValue(image);
  };

  return (
    <Drag.NoDrag>
      <input id={control.id} type="file" accept="image/*" onChange={handleChange} />
    </Drag.NoDrag>
  );
}
