import { createRoot } from "react-dom/client";
import type { GetSchemes } from "rete";
import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes>;

export async function createNodeEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

  editor.use(area);
  area.use(connection);
  area.use(render);

  connection.addPreset(ConnectionPresets.classic.setup());
  render.addPreset(ReactPresets.classic.setup());

  const socket = new ClassicPreset.Socket("socket");
  const a = new ClassicPreset.Node("test");
  a.addOutput("a", new ClassicPreset.Output(socket));
  a.addInput("a", new ClassicPreset.Input(socket));
  await editor.addNode(a);
  await AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => area.destroy(),
  };
}
