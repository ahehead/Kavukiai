import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { AreaExtra, NodeInterface, Schemes } from "../../types";
import type { DataflowEngine } from "../safe-dataflow/dataflowEngin";

export type NodeDeps = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
  message?: string;
};

// FactoryMeta: categories で任意深さの階層を表現する。
//  - categories: [] の場合はルート直下（トップレベルカテゴリなし）
export interface FactoryMeta {
  categories: string[]; // 空配列 => ルート直下扱い
  op: string; // 不変な論理操作名 (必須)。保存される typeId の後半部に使用
  label?: string; // UI 表示名
  devOnly?: boolean; // development のみ表示
  namespace?: string; // 省略時は "core"
  /**
   * 正規化後に自動付与される一意 ID。`${namespace}:${op}` 形式。
   * 定義側で指定しない
   */
  typeId?: string;
}

export type NodeFactory = (deps: NodeDeps) => NodeInterface;
export type FactoryWithMeta = NodeFactory & {
  meta: FactoryMeta;
};

export function define(
  fn: (deps: NodeDeps) => NodeInterface,
  meta: FactoryMeta
): FactoryWithMeta {
  const wrapped = ((deps: NodeDeps) => {
    const node = fn(deps);
    // ensure node.typeId is assigned from meta.typeId (registry で後付け)
    const m = wrapped.meta as FactoryMeta | undefined;
    if (m?.typeId && !node.typeId) node.typeId = m.typeId;
    if (m?.label) (node as any).label = m.label;
    return node;
  }) as FactoryWithMeta;
  wrapped.meta = meta;
  return wrapped;
}
