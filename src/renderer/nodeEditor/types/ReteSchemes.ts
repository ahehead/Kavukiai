import type { GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { GroupExtra } from "../features/group";
import type { Connection } from "./Connection/Connection";
import type { BaseNode } from "./Node/BaseNode";
import type { NodeControl } from "./NodeControl";
import type { TypedSocket } from "./Socket/TypedSocket";

// ノードのインターフェース汎用版の定義
export interface NodeInterface
  extends BaseNode<
    string,
    { [key in string]?: TypedSocket },
    { [key in string]?: TypedSocket },
    { [key in string]?: NodeControl }
  > {
  destroy?: () => void | Promise<void>;
}

export type NodeTypes = NodeInterface;

// Rete Schemes 定義
export type Schemes = GetSchemes<
  NodeInterface,
  Connection<NodeInterface, NodeInterface>
>;

// Area アクションの定義
export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra | GroupExtra;

// Exec 系列のソケット名一覧 ここから使う
export const ExecList = [
  "exec",
  "exec2",
  "exec3",
  "exec4",
  "start",
  "stop",
  "reset",
  "continue",
] as const;

export type ExecKey = (typeof ExecList)[number];

// ExecList に対する型ガード
export const isExecKey = (name: string): name is ExecKey =>
  (ExecList as readonly string[]).includes(name);
