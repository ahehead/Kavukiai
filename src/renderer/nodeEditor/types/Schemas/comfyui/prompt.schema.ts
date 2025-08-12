import { type Static, Type } from "@sinclair/typebox";

/**
 * PromptRecipe 用の TypeBox スキーマ
 */
export const PromptRecipe = Type.Object(
  {
    endpoint: Type.String({ description: "ComfyUI API endpoint URL" }),
    workflow: Type.Unknown({ description: "ComfyUI workflow JSON" }),
    opts: Type.Optional(
      Type.Object(
        {
          forceWs: Type.Optional(Type.Boolean()),
          wsTimeout: Type.Optional(Type.Integer({ minimum: 0 })),
          maxTries: Type.Optional(Type.Integer({ minimum: 0 })),
          delayTime: Type.Optional(Type.Integer({ minimum: 0 })),
        },
        { additionalProperties: false }
      )
    ),
    inputs: Type.Record(
      Type.String(),
      Type.Object({
        path: Type.String(),
        default: Type.Optional(Type.Any()),
      })
    ),
    outputs: Type.Record(
      Type.String(),
      Type.Object({
        path: Type.String(),
      })
    ),
    bypass: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false, description: "PromptRecipe schema" }
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
