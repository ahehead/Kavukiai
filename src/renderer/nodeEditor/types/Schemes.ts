import type { GetSchemes } from "rete";
import type { ContextMenuExtra } from "rete-context-menu-plugin";
import type { ReactArea2D } from "rete-react-plugin";
import type { NodeFactoriesType } from "../nodes/nodeFactories";
import type { Connection } from "./Connection/Connection";
import type { BaseNode } from "./Node/BaseNode";
import type { NodeControl } from "./NodeControl";
import type { TypedSocket } from "./Socket/TypedSocket";

export type NodeTypes = ReturnType<NodeFactoriesType[keyof NodeFactoriesType]>;

export type NodeTypeKey = keyof NodeFactoriesType;

export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

export type Schemes = GetSchemes<
  NodeTypes,
  Connection<NodeInterface, NodeInterface>
>;

// BaseNodeを埋めたもの
export interface NodeInterface
  extends BaseNode<
    NodeTypeKey,
    { [key in string]?: TypedSocket },
    { [key in string]?: TypedSocket },
    { [key in string]?: NodeControl }
  > {}

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
