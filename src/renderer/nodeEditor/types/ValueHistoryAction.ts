import type { HistoryAction } from "rete-history-plugin";
import type { AreaPlugin } from "rete-area-plugin";
import type { AreaExtra, BaseControl, Schemes } from ".";

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
    this.area.update("control", this.control.id);
  }
  async redo() {
    this.control.setValue(this.next);
    this.area.update("control", this.control.id);
  }
}
