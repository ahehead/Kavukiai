import type { Schemes } from "renderer/nodeEditor/types";
import type { DataflowEngine } from "rete-engine";

export function resetCacheDataflow(
  dataflow: DataflowEngine<Schemes>,
  id?: string
) {
  try {
    dataflow.reset(id);
  } catch (error) {
    console.info("No cache in the data flow. nodeId:", id);
  }
}
