import type { AreaExtra, Schemes } from "renderer/nodeEditor/types";
import type { AreaPlugin } from "rete-area-plugin";
import type { ConnectionPlugin } from "rete-connection-plugin";

export function handleConnectionEvent(
  connection: ConnectionPlugin<Schemes, AreaExtra>,
  area: AreaPlugin<Schemes, AreaExtra>
) {
  let clientX = 0;
  let clientY = 0;
  const handlerPointerMove = (event: PointerEvent) => {
    clientX = event.clientX;
    clientY = event.clientY;
  };
  document.addEventListener("pointermove", handlerPointerMove);
  connection;
  connection.addPipe((ctx) => {
    // console.log("connection event", ctx);
    if (ctx.type === "connectiondrop") {
      const { created } = ctx.data;
      if (!created) {
        // console.log("connection dropped", ctx.data);
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
  return () => {
    document.removeEventListener("pointermove", handlerPointerMove);
  };
}
