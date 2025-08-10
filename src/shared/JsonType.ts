import type { NodeTypeKey } from "renderer/nodeEditor/types";

// グラフデータの型定義
export interface GraphJsonData {
  version: string; // バージョン情報
  nodes: NodeJson[]; // ノード情報の配列
  connections: ConnectionJson[]; // 接続情報の配列
  metadata?: Record<string, unknown>; // 任意のメタ情報
}

export type NodeJson = {
  id: string;
  type: NodeTypeKey; // ノードの種類
  position: { x: number; y: number };
  size: { width?: number; height?: number }; // サイズ、なければ自然なサイズ
  inputs?: { [key: string]: InputPortJson }; // 入力ポートの情報
  data?: Record<string, unknown>; // ノード固有のデータ
  parentId?: string; // グループ化／ネスト用の親ノードID
};

export type InputPortJson = {
  isShowControl: boolean; // コントロールの表示状態
  control?: ControlJson;
};

export type ControlJson = {
  data?: Record<string, unknown>; // コントロールのデータ
};

// 接続情報の型
export type ConnectionJson = {
  id: string;
  source: string; // 接続元ノードID
  sourceOutput: string; // 接続元outputsのkey名
  target: string; // 接続先ノードID
  targetInput: string; // 接続先inputsのkey名
};
