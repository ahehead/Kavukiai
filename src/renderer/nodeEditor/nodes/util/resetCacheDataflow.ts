import type { Schemes } from "renderer/nodeEditor/types/Schemes";
import type { DataflowEngine } from "rete-engine";

export function resetCacheDataflow(
  dataflow: DataflowEngine<Schemes>,
  id?: string
) {
  try {
    dataflow.reset(id);
  } catch (_error) {
    // 握りつぶして問題ないはず…デバッグ時に
    //console.info("No cache in the data flow. nodeId:", id);
  }
}
