// グラフデータの型定義 (インターフェース) と TypeBox スキーマ
// 既存の TS 型はそのまま維持しつつ、JSON インポート時のバリデーション用に
// TypeBox スキーマを追加する。
// NOTE: 既存コードとの互換性のため interface / type は変更しない。

import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
export interface GraphJsonData {
  version: string; // バージョン情報
  nodes: NodeJson[]; // ノード情報の配列
  connections: ConnectionJson[]; // 接続情報の配列
  groups?: GroupJson[]; // グループ情報の配列
  metadata?: Record<string, unknown>; // 任意のメタ情報
}

export type NodeJson = {
  id: string;
  // ノードの種類（安定ID）。例: "core:String", "comfyui:LoadWorkflowFile"
  type: string;
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

// グループ情報の型
export type GroupJson = {
  id: string;
  text: string;
  rect: { left: number; top: number; width: number; height: number };
  // NodeId は string 互換のため JSON 上は string[] とする
  links: string[];
  bgColor?: string;
  fontColor?: string;
};

// =============================
// TypeBox Schemas
// =============================

// Control (任意 data: 任意のオブジェクト)
export const ControlJsonSchema = Type.Object(
  {
    data: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false }
);

export const InputPortJsonSchema = Type.Object(
  {
    isShowControl: Type.Boolean(),
    control: Type.Optional(ControlJsonSchema),
  },
  { additionalProperties: false }
);

export const NodeJsonSchema = Type.Object(
  {
    id: Type.String(),
    type: Type.String(),
    position: Type.Object({ x: Type.Number(), y: Type.Number() }),
    size: Type.Object(
      {
        width: Type.Optional(Type.Number()),
        height: Type.Optional(Type.Number()),
      },
      { additionalProperties: false }
    ),
    inputs: Type.Optional(Type.Record(Type.String(), InputPortJsonSchema)),
    data: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    parentId: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const ConnectionJsonSchema = Type.Object(
  {
    id: Type.String(),
    source: Type.String(),
    sourceOutput: Type.String(),
    target: Type.String(),
    targetInput: Type.String(),
  },
  { additionalProperties: false }
);

export const GroupJsonSchema = Type.Object(
  {
    id: Type.String(),
    text: Type.String(),
    rect: Type.Object({
      left: Type.Number(),
      top: Type.Number(),
      width: Type.Number(),
      height: Type.Number(),
    }),
    links: Type.Array(Type.String()),
    bgColor: Type.Optional(Type.String()),
    fontColor: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

export const GraphJsonDataSchema = Type.Object(
  {
    version: Type.String(),
    nodes: Type.Array(NodeJsonSchema),
    connections: Type.Array(ConnectionJsonSchema),
    groups: Type.Optional(Type.Array(GroupJsonSchema)),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false }
);

export type GraphJsonDataValidated = Static<typeof GraphJsonDataSchema>;

export function parseGraphJson(value: unknown): GraphJsonData {
  return Value.Parse(GraphJsonDataSchema, value);
}
