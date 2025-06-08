import type { BaseSchemes } from "rete";
import type { ContextMenuRender } from "rete-react-plugin/_types/presets/context-menu/types";
import type { RenderPreset } from "rete-react-plugin/_types/presets/types";
import { CustomContextMenu } from "../components/CustomContextMenu";

export function customContextMenuPreset<S extends BaseSchemes>(): RenderPreset<S, ContextMenuRender> {
  return {
    render(ctx: ContextMenuRender) {
      if (ctx.data.type === "contextmenu") {
        return (
          <CustomContextMenu
            element={ctx.data.element}
            type={ctx.data.type}
            items={ctx.data.items}
            searchBar={ctx.data.searchBar}
            onHide={ctx.data.onHide}
          />
        );
      }
    },
  };
}
