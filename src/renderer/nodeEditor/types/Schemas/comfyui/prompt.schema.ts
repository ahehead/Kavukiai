import { type Static, Type } from "@sinclair/typebox";
import { WorkflowRef } from "./workflow-ref.schema";

export const WorkflowInputs = Type.Record(
  Type.String(),
  Type.Object({
    path: Type.String(),
    default: Type.Optional(Type.Any()),
  })
);

export type WorkflowInputs = Static<typeof WorkflowInputs>;

export const WorkflowOutputs = Type.Record(
  Type.String(),
  Type.Object({
    path: Type.String(),
  })
);

export type WorkflowOutputs = Static<typeof WorkflowOutputs>;

/**
 * PromptRecipe 用の TypeBox スキーマ
 */
export const PromptRunOpts = Type.Object(
  {
    forceWs: Type.Optional(Type.Boolean()),
    wsTimeout: Type.Optional(Type.Integer({ minimum: 0 })),
    maxTries: Type.Optional(Type.Integer({ minimum: 0 })),
    delayTime: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  { additionalProperties: false, description: "Options for running Prompt" }
);
export type PromptRunOpts = Static<typeof PromptRunOpts>;

export const PromptRecipe = Type.Object(
  {
    endpoint: Type.String({ description: "ComfyUI API endpoint URL" }),
    workflowRef: WorkflowRef,
    opts: Type.Optional(PromptRunOpts),
    inputs: WorkflowInputs,
    outputs: Type.Optional(WorkflowOutputs),
    bypass: Type.Optional(Type.Array(Type.String())),
  },
  {
    additionalProperties: false,
    description: "PromptRecipe schema (workflowRef 指定)",
  }
);

export type PromptRecipe = Static<typeof PromptRecipe>;

// /**
//  * Launch 用のオプション型（scripts/comfyDesktop.ts の LaunchOpts と同等）
//  */

// export type LaunchOpts = {
//   /** ユーザーが選んだ .exe / .app の絶対パス。未指定なら既定場所を探索 */
//   appPath?: string;
//   /** 期待するサーバーポート（Desktop の既定は 8000） */
//   port?: number;
//   /** 見つからないときにファイルダイアログで聞くか */
//   askIfMissing?: boolean;
//   /**
//    * ヘルスチェックのタイムアウト(ms)。
//    * ComfyUI Desktop の起動確認で待つ最大時間。
//    * 例: 120_000 (2分)
//    * 既定: 90_000 (90秒)
//    */
//   timeoutMs?: number;
// };

export const LaunchOpts = Type.Object(
  {
    appPath: Type.Optional(
      Type.String({ description: "Absolute path to ComfyUI Desktop app" })
    ),
    port: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 65535, description: "Server port" })
    ),
    askIfMissing: Type.Optional(
      Type.Boolean({ description: "Ask user to locate the app when missing" })
    ),
    timeoutMs: Type.Optional(
      Type.Integer({ minimum: 0, description: "Healthcheck timeout (ms)" })
    ),
  },
  {
    additionalProperties: false,
    description: "Options for launching ComfyUI Desktop",
  }
);
export type LaunchOpts = Static<typeof LaunchOpts>;
