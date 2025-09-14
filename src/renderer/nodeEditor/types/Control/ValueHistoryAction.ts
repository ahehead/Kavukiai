import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryAction } from "rete-history-plugin";
import type { AreaExtra, Schemes } from "../ReteSchemes";
import type { BaseControl } from "./BaseControl";

export class ValueHistoryAction<C extends BaseControl<T, any>, T>
  implements HistoryAction
{
  constructor(
    private control: C,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private prev: T,
    private next: T
  ) {}
  async undo() {
    this.control.setValue(this.prev);
    await this.area.update("control", this.control.id);
  }
  async redo() {
    this.control.setValue(this.next);
    await this.area.update("control", this.control.id);
  }
}
