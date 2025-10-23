/**
 * ComfyUINode がポート経由でやり取りするイベント型
 * TypeBox スキーマは不要（ノード間の内部イベントのため）。
 */

// 追加: finish の結果はパスまたは ArrayBuffer
export type ComfyUIFinishResult =
  | { paths: string[] }
  | { buffers: ArrayBuffer[] };

export type ComfyUIPortEvent =
  | { type: "start"; promptId?: string }
  | { type: "pending"; promptId?: string }
  | {
      type: "progress";
      /** 0-1 の進捗（不明時は送らない想定） */
      progress: number;
      /** 任意の詳細（処理中ノード名や残り時間など） */
      detail?: string;
      promptId?: string;
    }
  | {
      type: "preview";
      /** プレビュー画像 ArrayBuffer */
      data: ArrayBuffer;
      promptId?: string;
    }
  | {
      type: "output";
      /** 出力キー（images、mask 等） */
      key: string;
      /** 値は API 実行結果に応じて様々。JSON で運ぶ */
      data: unknown;
      promptId?: string;
    }
  | { type: "finish"; promptId?: string } // 互換用 (結果は result イベントで送信)
  | {
      type: "result";
      /** 最終成果物のまとめ（画像パス配列 or ArrayBuffer 配列） */
      result: ComfyUIFinishResult;
      promptId?: string;
    }
  | { type: "error"; message: string; promptId?: string }
  | { type: "abort"; promptId?: string };

export type ComfyUIPortEventOrNull = ComfyUIPortEvent | null;
