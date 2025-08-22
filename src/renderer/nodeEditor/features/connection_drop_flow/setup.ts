import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { ConnectionPlugin } from "rete-connection-plugin";

export function handleConnectionEvent(
  connection: ConnectionPlugin<Schemes, AreaExtra>,
  area: AreaPlugin<Schemes, AreaExtra>
) {
  let clientX = 0;
  let clientY = 0;
  connection.addPipe((ctx) => {
    // ポインタの画面位置を取っておく
    if (ctx.type === "pointermove") {
      clientX = ctx.data.event.clientX;
      clientY = ctx.data.event.clientY;
    }
    // connectionのdropイベント時にとりあえずコンテキストメニューを出す
    if (ctx.type === "connectiondrop") {
      const { created } = ctx.data;
      if (!created) {
        area.emit({
          type: "contextmenu",
          data: {
            event: new MouseEvent("pointerup", { clientX, clientY }),
            context: "root",
          },
        });
      }
    }
    return ctx;
  });
}
