import { type Static, Type } from "@sinclair/typebox";

// ComfyUI のワークフローファイル参照 (テンプレート or ユーザーデータ)
// 実体の JSON は main 側で解決する。renderer からは参照情報のみ渡す。
export const WorkflowRef = Type.Union([
  Type.Object({
    source: Type.Literal("userData"),
    name: Type.String({
      description:
        "ユーザーデータ領域内の workflow ファイル名 (拡張子含む想定)",
    }),
  }),
  Type.Object({
    source: Type.Literal("template"),
    name: Type.String({
      description: "テンプレート領域内の workflow ファイル名 (拡張子含む想定)",
    }),
  }),
]);

export type WorkflowRef = Static<typeof WorkflowRef>;
